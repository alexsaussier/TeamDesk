import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oauth2Client } from '@/lib/config';

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('google_calendar_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }
    
    const token = JSON.parse(tokenCookie.value);
    
    // Check if token is expired
    const isTokenExpired = token.expiry_date && token.expiry_date < Date.now();
    
    if (isTokenExpired) {
      // Try to refresh the token
      oauth2Client.setCredentials(token);
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        // Save refreshed token
        cookieStore.set('google_calendar_token', JSON.stringify(credentials), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
        });
        return NextResponse.json({ connected: true });
      } catch (error) {
        // If refresh fails, consider disconnected
        return NextResponse.json({ connected: false });
      }
    }
    
    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    return NextResponse.json({ connected: false });
  }
} 