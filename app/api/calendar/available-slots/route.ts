import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';

/**
 * Calendar API route for fetching available interview slots
 * 
 * This route handles:
 * - Retrieving calendar credentials from either cookies or database
 * - Checking calendar availability for a specified time period (default 7 days)
 * - Finding free slots during business hours (9am-5pm)
 * - Excluding weekends and times that conflict with existing calendar events
 * - Returns formatted available time slots that can be used for scheduling interviews
 */

// Add this interface at the top of the file
interface ErrorWithMessage {
  message: string;
}

// Function to get available slots for the next 7 days
export async function GET(request: Request) {
  try {
    await connectDB();

    // First try to get credentials from cookies (for development/testing)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('google_calendar_token');
    let credentials = null;
    
    if (tokenCookie) {
      try {
        credentials = JSON.parse(tokenCookie.value);
        console.log("Using credentials from cookie");
      } catch (e) {
        console.error("Error parsing token cookie:", e);
      }
    }
    
    // If no cookie credentials, try to get from database
    if (!credentials) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Find user with calendar tokens
      const user = await User.findOne({ 
        email: session.user.email
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (!user.calendarCredentials || !user.calendarCredentials.accessToken) {
        return NextResponse.json({ error: 'Calendar not connected', details: 'No calendar credentials found for user' }, { status: 400 });
      }
      
      credentials = {
        access_token: user.calendarCredentials.accessToken,
        refresh_token: user.calendarCredentials.refreshToken,
        expiry_date: user.calendarCredentials.expiryDate
      };
      console.log("Using credentials from database");
    }

    // Get URL parameters
    const url = new URL(request.url);
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 7; // Default to 7 days
    const durationParam = url.searchParams.get('duration');
    const duration = durationParam ? parseInt(durationParam, 10) : 60; // Default to 60 minutes

    // Set up OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials
    oauth2Client.setCredentials(credentials);

    // Check if token needs refresh
    if (credentials.expiry_date && credentials.expiry_date < Date.now()) {
      console.log("Token expired, refreshing...");
      try {
        const { credentials: refreshedCredentials } = await oauth2Client.refreshAccessToken();
        
        // Update tokens in database or cookie based on where we got them from
        if (tokenCookie) {
          const response = NextResponse.json({ success: true });
          response.cookies.set('google_calendar_token', JSON.stringify(refreshedCredentials), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
          });
          return response;
        } else {
          const session = await getServerSession(authOptions);
          await User.updateOne(
            { email: session?.user.email },
            { 
              $set: { 
                'calendarCredentials.accessToken': refreshedCredentials.access_token,
                'calendarCredentials.expiryDate': refreshedCredentials.expiry_date
              } 
            }
          );
        }
        
        oauth2Client.setCredentials(refreshedCredentials);
      } catch (error) {
        const err = error as ErrorWithMessage;
        console.error("Error refreshing token:", err);
        return NextResponse.json({ error: 'Failed to refresh token', details: err.message }, { status: 401 });
      }
    }

    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Calculate time range (now to X days in the future)
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + days);

    // Get busy times from primary calendar
    try {
      const busyTimesResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: now.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: 'primary' }]
        }
      });

      const busySlots = busyTimesResponse.data.calendars?.primary?.busy || [];

      // Generate available slots (9 AM to 5 PM, excluding busy times)
      const availableSlots = [];
      const currentDate = new Date(now);
      
      // Start from tomorrow instead of today
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(9, 0, 0, 0); // Start at 9 AM

      // Loop through each day
      while (currentDate < endDate) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          // Track slots per day (maximum 3)
          let slotsForCurrentDay = 0;
          
          // Loop through each hour from 9 AM to 5 PM
          for (let hour = currentDate.getHours(); hour < 17; hour++) {
            // Stop if we already have 3 slots for this day
            if (slotsForCurrentDay >= 3) {
              break;
            }
            
            const slotStart = new Date(currentDate);
            slotStart.setHours(hour, 0, 0, 0);
            
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotStart.getMinutes() + duration);
            
            // Skip if slot end is after 5 PM
            if (slotEnd.getHours() >= 17) {
              continue;
            }
            
            // Check if slot overlaps with any busy time
            const isOverlapping = busySlots.some(busySlot => {
              const busyStart = new Date(busySlot.start || '');
              const busyEnd = new Date(busySlot.end || '');
              
              return (
                (slotStart >= busyStart && slotStart < busyEnd) || // Slot start is within busy period
                (slotEnd > busyStart && slotEnd <= busyEnd) || // Slot end is within busy period
                (slotStart <= busyStart && slotEnd >= busyEnd) // Slot completely contains busy period
              );
            });
            
            if (!isOverlapping) {
              availableSlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                formatted: `${slotStart.toLocaleDateString()} at ${slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              });
              
              // Increment the counter for slots on this day
              slotsForCurrentDay++;
            }
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(9, 0, 0, 0); // Reset to 9 AM
      }

      return NextResponse.json({ availableSlots });
    } catch (error) {
      const err = error as ErrorWithMessage;
      console.error("Error querying calendar:", err);
      return NextResponse.json({ error: 'Failed to query calendar', details: err.message }, { status: 500 });
    }
  } catch (error) {
    const err = error as ErrorWithMessage;
    console.error('Error fetching available slots:', err);
    return NextResponse.json({ error: 'Failed to fetch available slots', details: err.message }, { status: 500 });
  }
} 