import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, company, companySize, email, jobTitle, phone } = body

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'asaussier99@gmail.com',
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