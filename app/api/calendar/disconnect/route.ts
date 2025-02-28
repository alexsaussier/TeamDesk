import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oauth2Client } from '@/lib/config';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('google_calendar_token');
    
    if (tokenCookie) {
      // Revoke the token
      const token = JSON.parse(tokenCookie.value);
      if (token.access_token) {
        try {
          await oauth2Client.revokeToken(token.access_token);
        } catch (error) {
          console.error('Error revoking token:', error);
          // Continue anyway to remove the cookie
        }
      }
      
      // Delete the cookie
      cookieStore.delete('google_calendar_token');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
} 