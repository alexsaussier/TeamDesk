import nodemailer from 'nodemailer'

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to TeamDesk! 🎉',
    html: (userName: string, organizationName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature { display: flex; align-items: center; margin: 10px 0; }
            .checkmark { color: #10b981; margin-right: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TeamDesk!</h1>
              <p>Your team management journey starts here</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>Welcome to TeamDesk! We're excited to have you and <strong>${organizationName}</strong> on board.</p>
              
              <p>TeamDesk is designed to help consulting teams and agencies optimize their project planning and team utilization. You're now ready to:</p>
              
              <div class="features">
                <h3>Get Started With Your Free Plan:</h3>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span>Manage up to 3 projects</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span>Track up to 10 consultants</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span>Monitor your utilization metrics</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span>Access our project management tools</span>
                </div>
              </div>
              
              <a href="https://teamdesk.app/dashboard" class="button">Go to Dashboard</a>
              
              <p>Need help getting started? Check out our <a href="https://teamdesk.app/docs">documentation</a> or reply to this email with any questions.</p>
              
              <p>Have a look around, and when you are ready to unlock unlimited projects and staff, <a href="https://teamdesk.app/pricing">get our premium plan</a> for unlimited projects, advanced AI tools, and priority support.</p>
              
              <p>Best regards,<br>Alex, Teamdesk CEO</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: (userName: string, organizationName: string) => `
      Welcome to TeamDesk!
      
      Hi ${userName},
      
      Welcome to TeamDesk! We're excited to have you and ${organizationName} on board.
      
      TeamDesk is designed to help consulting teams and agencies optimize their project planning and team utilization.
      
      Your free plan includes:
      • Manage up to 3 projects
      • Track up to 10 consultants  
      • Monitor utilization metrics
      • Access basic project management tools
      
      Get started: https://teamdesk.app/dashboard
      
      Need help? Reply to this email or check our documentation.
      
      Ready for more features? Explore our Premium plan: https://teamdesk.app/pricing
      
      Best regards,
      
      Alex
      Teamdesk CEO
    `
  },

  premiumUpgrade: {
    subject: 'Welcome to TeamDesk Premium! 🚀',
    html: (userName: string, organizationName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .feature { display: flex; align-items: center; margin: 10px 0; }
            .checkmark { color: #10b981; margin-right: 10px; font-weight: bold; }
            .premium-badge { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Premium!</h1>
              <p>You've unlocked the full power of TeamDesk</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>Congratulations! <strong>${organizationName}</strong> has been upgraded to TeamDesk Premium. You now have access to all our advanced features!</p>
              
              <div class="features">
                <h3>Your Premium Features: <span class="premium-badge">PREMIUM</span></h3>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span><strong>Unlimited projects</strong> - No more limits on your project pipeline</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span><strong>Unlimited consultants</strong> - Manage your entire workforce</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span><strong>5 user accounts</strong> - Collaborate with your team</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span><strong>Advanced AI features</strong> - Smart staffing suggestions & RFP responses</span>
                </div>
                <div class="feature">
                  <span class="checkmark">✓</span>
                  <span><strong>Priority support</strong> - Get help when you need it</span>
                </div>
               
              </div>
              
              <a href="https://teamdesk.app/dashboard" class="button">Explore Your Premium Dashboard</a>
              
              <p>Your subscription is now active and you'll be billed according to your selected plan. You can manage your subscription anytime from your account settings.</p>
              
              <p>Questions about your Premium features? We're here to help! Reply to this email or contact our priority support.</p>
              
              <p>Thank you for choosing TeamDesk Premium!</p>
              
              <p>Best regards,<br>Alex, Teamdesk CEO</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: (userName: string, organizationName: string) => `
      Welcome to TeamDesk Premium!
      
      Hi ${userName},
      
      Congratulations! ${organizationName} has been upgraded to TeamDesk Premium.
      
      Your Premium features include:
      • Unlimited projects and consultants
      • 5 user accounts for team collaboration
      • Advanced AI features for smart staffing
      • Priority support
      
      Explore your Premium dashboard: https://teamdesk.app/dashboard
      
      Your subscription is now active. Manage your subscription from account settings.
      
      Questions? Reply to this email for priority support.
      
      Thank you for choosing TeamDesk Premium!
      
      Best regards,
      
      Alex 
      Teamdesk CEO
    `
  }
}

// Email sending functions
export async function sendWelcomeEmail(userEmail: string, userName: string, organizationName: string) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"TeamDesk" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.html(userName, organizationName),
      text: emailTemplates.welcome.text(userName, organizationName),
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendPremiumUpgradeEmail(userEmail: string, userName: string, organizationName: string) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"TeamDesk" <${process.env.EMAIL_FROM}>`,
      to: userEmail,
      subject: emailTemplates.premiumUpgrade.subject,
      html: emailTemplates.premiumUpgrade.html(userName, organizationName),
      text: emailTemplates.premiumUpgrade.text(userName, organizationName),
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Premium upgrade email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending premium upgrade email:', error)
    return { success: false, error }
  }
} 