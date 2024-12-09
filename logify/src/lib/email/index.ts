import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});
export async function sendWelcomeEmail(
  email: string,
  name: string,
  tempPassword: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Welcome to Logify - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="min-width: 100%; background-color: hsl(200, 6%, 97%);">
                <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px;">
                        <div style="font-size: 24px; font-weight: 700; color: #8a8a8a;">Logify</div>
                        <h1 style="margin: 0; color: hsl(220, 4%, 28%); font-size: 24px; font-weight: 600;">Welcome to Logify, ${name}! 👋</h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 20px 40px;">
                        <p style="color: hsl(220, 4%, 28%); font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            You've been added to your team's workspace. Here are your login credentials:
                        </p>
                        
                        <!-- Credentials Box -->
                        <div style="background-color: hsl(200, 6%, 97%); border-radius: 8px; padding: 24px; margin: 24px 0;">
                            <p style="margin: 0 0 12px; color: hsl(220, 4%, 28%);">
                            <strong style="display: inline-block; width: 100px;">Email:</strong> 
                            <span style="color: hsl(220, 13%, 37%);">${email}</span>
                            </p>
                            <p style="margin: 0; color: hsl(220, 4%, 28%);">
                            <strong style="display: inline-block; width: 100px;">Password:</strong> 
                            <span style="color: hsl(220, 13%, 37%);">${tempPassword}</span>
                            </p>
                        </div>
                        
                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                            <tr>
                            <td align="center" style="padding: 30px 0;">
                                <a href="${process.env.NEXTAUTH_URL}/login" 
                                style="display: inline-block; padding: 14px 32px; background-color: hsl(43, 90%, 54%); color: hsl(220, 4%, 28%); text-decoration: none; font-weight: 600; border-radius: 6px; transition: all 0.2s;">
                                Get Started →
                                </a>
                            </td>
                            </tr>
                        </table>
                        
                        <p style="color: hsl(220, 4%, 28%); font-size: 16px; line-height: 1.6; margin: 0;">
                            Need help? Contact your team administrator or reply to this email for support.
                        </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid hsl(200, 6%, 90%);">
                        <p style="margin: 0; color: hsl(220, 4%, 45%); font-size: 14px; line-height: 1.5;">
                            Logify - Your team's time management solution.<br>
                            This is an automated message. Please do not reply directly to this email.
                        </p>
                        </td>
                    </tr>
                    </table>
                    
                    <!-- Footer Links -->
                    <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; margin-top: 20px;">
                    <tr>
                        <td align="center">
                        <p style="margin: 0; color: hsl(220, 4%, 45%); font-size: 14px;">
                            <a href="#" style="color: hsl(220, 13%, 37%); text-decoration: none;">Privacy Policy</a> • 
                            <a href="#" style="color: hsl(220, 13%, 37%); text-decoration: none;">Terms of Service</a> • 
                            <a href="#" style="color: hsl(220, 13%, 37%); text-decoration: none;">Unsubscribe</a>
                        </p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}