import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, company, companySize, email, jobTitle, phone } = body

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: `"TeamDesk" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM, // Send demo requests to the same email
      subject: 'New Demo Request from TeamDesk',
      html: `
        <h2>New Demo Request</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Company Size:</strong> ${companySize}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Job Title:</strong> ${jobTitle}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: 'Demo request submitted successfully' })
  } catch (error) {
    console.error('Error processing demo request:', error)
    return NextResponse.json(
      { error: 'Failed to process demo request' },
      { status: 500 }
    )
  }
} 