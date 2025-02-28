import { google } from 'googleapis';

// OAuth2 configuration
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Define the scopes we need
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

// Helper function to get calendar client
export const getCalendarClient = async (token: any) => {
  oauth2Client.setCredentials(token);
  return google.calendar({ version: 'v3', auth: oauth2Client });
};