import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oauth2Client } from '@/lib/config';

/**
 * Google Calendar OAuth2 Callback Route
 * 
 * This route handles the OAuth2 callback from Google Calendar authentication.
 * When a user authorizes the application to access their Google Calendar,
 * Google redirects them here with an authorization code.
 * 
 * The route:
 * 1. Exchanges the authorization code for access/refresh tokens
 * 2. Stores the tokens securely in HTTP-only cookies
 * 3. Returns an HTML page that automatically closes the popup window
 * 4. Redirects to the recruitment dashboard if there's an error
 */


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/recruitment', request.url));
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in cookies
    const cookieStore = cookies();
    cookieStore.set('google_calendar_token', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Close the popup window with JavaScript
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
        </head>
        <body>
          <h1>Authorization Successful!</h1>
          <p>You can close this window now.</p>
          <script>
            window.onload = function() {
              window.close();
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.redirect(new URL('/dashboard/recruitment?error=auth_failed', request.url));
  }
} 