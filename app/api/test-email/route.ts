import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Verify connection configuration
    await transporter.verify();
    
    // Send a test email
    await transporter.sendMail({
      from: `"Test User" <${process.env.EMAIL_FROM}>`,
      to: "your-test-email@example.com", // Change this to your email
      subject: "Test Email",
      text: "This is a test email to verify your email configuration.",
    });

    return NextResponse.json({ 
      success: true,
      message: "Email configuration is working correctly"
    });
  } catch (error) {
    console.error('Email configuration error:', error);
    return NextResponse.json(
      { error: 'Email configuration failed', details: error },
      { status: 500 }
    );
  }
} 