import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { google } from 'googleapis';
import { oauth2Client, SCOPES } from '@/lib/config';
import OpenAI from 'openai';
import { Candidate } from '@/types';

// Interface for error handling
interface ErrorWithMessage {
  message: string;
  stack?: string;
}

export async function POST(request: Request) {
  console.log("API: Email monitoring process started");
  try {
    console.log("API: Connecting to database");
    await connectDB();
    console.log("API: Database connection established");

    console.log("API: Getting server session");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("API: No session found - unauthorized");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("API: Session found for user:", session.user.email);

    // Get token from cookies
    console.log("API: Getting calendar token from cookies");
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('google_calendar_token');
    
    if (!tokenCookie) {
      console.error("API: No calendar token found in cookies");
      return NextResponse.json({ 
        error: 'Calendar not connected', 
        details: 'No calendar token found. Please connect your Google Calendar.',
        code: 'NO_CREDENTIALS'
      }, { status: 400 });
    }
    
    const token = JSON.parse(tokenCookie.value);
    console.log("API: Calendar token found");
    
    // Check if token is expired
    const isTokenExpired = token.expiry_date && token.expiry_date < Date.now();
    
    if (isTokenExpired) {
      console.log("API: Token expired, attempting to refresh");
      // Try to refresh the token
      oauth2Client.setCredentials(token);
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log("API: Token refreshed successfully");
        
        // Update the token cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('google_calendar_token', JSON.stringify(credentials), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
        
        // Use the refreshed token
        oauth2Client.setCredentials(credentials);
      } catch (error) {
        const err = error as ErrorWithMessage;
        console.error("API: Error refreshing token:", err);
        console.error("API: Error details:", err.message);
        return NextResponse.json({ error: 'Failed to refresh token', details: err.message }, { status: 401 });
      }
    } else {
      // Set the credentials from the cookie
      oauth2Client.setCredentials(token);
    }

    // Create Gmail client
    console.log("API: Creating Gmail client");
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get all jobs with candidates in interviewing status
    console.log("API: Finding jobs with interviewing candidates");
    const jobs = await Job.find({
      organizationId: session.user.organizationId,
      'candidates.status': 'Interviewing',
      'candidates.interviewScheduled': { $ne: true } // Only get candidates without scheduled interviews
    });
    
    console.log(`API: Found ${jobs.length} jobs with interviewing candidates`);

    // Initialize OpenAI for meeting description generation
    console.log("API: Initializing OpenAI");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    if (!process.env.OPENAI_API_KEY) {
      console.warn("API: OPENAI_API_KEY environment variable is not set");
    }

    let scheduledCount = 0;

    // Process each job
    for (const job of jobs) {
      console.log(`API: Processing job: ${job.title} (${job._id})`);
      
      // Get interviewing candidates without scheduled interviews
      const interviewingCandidates = job.candidates.filter(
        (candidate: Candidate) => candidate.status === 'Interviewing' && !candidate.interviewScheduled
      );
      
      console.log(`API: Found ${interviewingCandidates.length} candidates to check for job ${job._id}`);

      for (const candidate of interviewingCandidates) {
        console.log(`API: Checking emails for candidate: ${candidate.name} (${candidate.email})`);
        
        // Search for emails from this candidate
        const query = `from:${candidate.email} subject:"Re: Interview Invitation"`;
        console.log(`API: Gmail search query: "${query}"`);
        
        try {
          const res = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 5
          });
          
          console.log(`API: Gmail search results: ${res.data.messages?.length || 0} messages found`);

          if (res.data.messages && res.data.messages.length > 0) {
            console.log(`API: Found email response from candidate ${candidate.name}`);
            
            // Get the most recent message
            const messageId = res.data.messages[0].id;
            console.log(`API: Getting message content for ID: ${messageId}`);
            
            const message = await gmail.users.messages.get({
              userId: 'me',
              id: messageId as string
            });

            // Extract email content
            const emailContent = message.data.snippet || '';
            console.log(`API: Email content snippet: "${emailContent.substring(0, 100)}..."`);
            
            // Use AI to extract proposed time or confirm availability
            console.log("API: Using OpenAI to extract proposed time");
            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `You are an assistant that extracts interview time preferences from candidate emails. 
                    Extract the date and time the candidate is available for an interview. 
                    If multiple times are mentioned, choose the earliest one. 
                    Return the result in ISO format (YYYY-MM-DDTHH:MM:SS) or "No specific time found" if none is mentioned.`
                  },
                  {
                    role: 'user',
                    content: emailContent
                  }
                ],
                temperature: 0.3,
              });

              const proposedTime = completion.choices[0].message.content?.trim();
              console.log(`API: Extracted proposed time: ${proposedTime}`);
              
              // If we found a time, schedule the interview
              if (proposedTime && proposedTime !== "No specific time found") {
                console.log(`API: Valid time found, scheduling interview`);
                
                // Get the current interview round
                const currentRound = candidate.currentRound || 1;
                console.log(`API: Current interview round: ${currentRound}`);
                
                const interviewRound = job.interviewRounds[currentRound - 1];
                
                if (!interviewRound) {
                  console.error(`API: No interview round found for candidate ${candidate._id} (round ${currentRound})`);
                  continue;
                }
                
                // Get interviewers
                const interviewers = interviewRound.interviewers || [];
                console.log(`API: Interviewers for this round: ${interviewers.join(', ')}`);
                
                // Generate meeting description
                console.log("API: Generating meeting description");
                const descriptionCompletion = await openai.chat.completions.create({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'system',
                      content: `Generate a concise meeting description for an interview. Include:
                      - Job title
                      - Candidate name
                      - Interview round number and name
                      - Interviewers
                      Keep it professional and brief.`
                    },
                    {
                      role: 'user',
                      content: `Job: ${job.title}
                      Candidate: ${candidate.name}
                      Round: ${currentRound} - ${interviewRound.name}
                      Interviewers: ${interviewers.join(', ')}`
                    }
                  ],
                  temperature: 0.7,
                });
                
                const meetingDescription = descriptionCompletion.choices[0].message.content?.trim();
                console.log(`API: Generated meeting description: "${meetingDescription?.substring(0, 100)}..."`);
                
                // Create calendar event
                console.log("API: Creating calendar event");
                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
                
                // Parse the proposed time
                const startTime = new Date(proposedTime);
                console.log(`API: Parsed start time: ${startTime.toISOString()}`);
                
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 1); // 1 hour interview
                console.log(`API: End time: ${endTime.toISOString()}`);
                
                // Prepare attendees
                const attendees = [
                  { email: candidate.email }, // Candidate
                  { email: session.user.email } // Organizer
                ];
                
                // Add interviewers
                interviewers.forEach((interviewer: string) => {
                  if (interviewer.includes('@')) {
                    attendees.push({ email: interviewer });
                  }
                });
                
                console.log(`API: Event attendees: ${attendees.map(a => a.email).join(', ')}`);
                
                try {
                  // Create the event
                  console.log("API: Sending calendar event creation request");
                  const event = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                      summary: `Interview: ${job.title} with ${candidate.name}`,
                      description: meetingDescription,
                      start: {
                        dateTime: startTime.toISOString(),
                        timeZone: 'UTC'
                      },
                      end: {
                        dateTime: endTime.toISOString(),
                        timeZone: 'UTC'
                      },
                      attendees,
                      conferenceData: {
                        createRequest: {
                          requestId: `interview-${job._id}-${candidate._id}`,
                          conferenceSolutionKey: {
                            type: 'hangoutsMeet'
                          }
                        }
                      }
                    },
                    conferenceDataVersion: 1
                  });
                  
                  console.log(`API: Calendar event created successfully, ID: ${event.data.id}`);
                  console.log(`API: Meet link: ${event.data.hangoutLink}`);
                  
                  // Update candidate with meeting info
                  candidate.interviewScheduled = true;
                  candidate.interviewDateTime = startTime;
                  candidate.meetingLink = event.data.hangoutLink || '';
                  
                  // Add a note about the scheduled interview
                  if (!candidate.notes) {
                    candidate.notes = '';
                  }
                  
                  candidate.notes += `\n[${new Date().toISOString()}] Interview scheduled for ${startTime.toLocaleString()}. Meeting link: ${candidate.meetingLink}`;
                  
                  scheduledCount++;
                  console.log(`API: Candidate ${candidate.name} updated with meeting info`);
                } catch (error) {
                  const err = error as ErrorWithMessage;
                  console.error(`API: Error creating calendar event:`, err);
                  console.error(`API: Error details:`, err.message);
                }
              } else {
                console.log(`API: No specific time found in the email or invalid time format`);
              }
            } catch (error) {
              const err = error as ErrorWithMessage;
              console.error(`API: Error with OpenAI processing:`, err);
              console.error(`API: Error details:`, err.message);
            }
          } else {
            console.log(`API: No email responses found for candidate ${candidate.name}`);
          }
        } catch (error) {
          const err = error as ErrorWithMessage;
          console.error(`API: Error searching Gmail:`, err);
          console.error(`API: Error details:`, err.message);
        }
      }
      
      // Save the updated job
      console.log(`API: Saving updated job ${job._id}`);
      try {
        await job.save();
        console.log(`API: Job ${job._id} saved successfully`);
      } catch (error) {
        const err = error as ErrorWithMessage;
        console.error(`API: Error saving job:`, err);
        console.error(`API: Error details:`, err.message);
      }
    }

    console.log(`API: Email monitoring complete. Scheduled ${scheduledCount} interviews.`);
    return NextResponse.json({ 
      success: true,
      scheduledCount
    });
  } catch (error) {
    const err = error as ErrorWithMessage;
    console.error('API: Error monitoring email responses:', err);
    console.error('API: Error details:', err.message);
    console.error('API: Error stack:', err.stack);
    return NextResponse.json({ error: 'Failed to monitor email responses', details: err.message }, { status: 500 });
  }
} 