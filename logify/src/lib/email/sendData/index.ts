import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { format } from 'date-fns';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entries, employeeName, startDate, endDate, adminEmail } = await request.json();

    // Group entries by project and task
    const entryGroups = entries.reduce((acc: { [key: string]: number }, entry: any) => {
      const key = `${entry.project_name || 'Unknown Project'} - ${entry.task_title || 'Unknown Task'}`;
      acc[key] = (acc[key] || 0) + entry.hours;
      return acc;
    }, {});

    const totalHours = entries.reduce((sum: number, entry: any) => sum + entry.hours, 0);

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: adminEmail,
      subject: `Timesheet Submission - ${employeeName} - ${format(new Date(startDate), 'MMM d')} to ${format(new Date(endDate), 'MMM d, yyyy')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="min-width: 100%; background-color: hsl(200, 6%, 97%);">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px;">
                      <div style="font-size: 24px; font-weight: 700; color: #E4E6E7;">Logify</div>
                      <h1 style="margin: 0; color: hsl(220, 4%, 28%); font-size: 24px; font-weight: 600;">
                        Timesheet Submission from ${employeeName}
                      </h1>
                      <p style="color: hsl(220, 4%, 45%); margin-top: 8px;">
                        ${format(new Date(startDate), 'MMMM d')} - ${format(new Date(endDate), 'MMMM d, yyyy')}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Summary -->
                  <tr>
                    <td style="padding: 0 40px 20px;">
                      <div style="background-color: hsl(200, 6%, 97%); border-radius: 8px; padding: 24px;">
                        <h2 style="margin: 0 0 16px; color: hsl(220, 4%, 28%); font-size: 18px;">Summary</h2>
                        <p style="margin: 0; color: hsl(220, 4%, 28%);">
                          <strong>Total Hours:</strong> ${totalHours}
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Hours Breakdown -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <h2 style="margin: 0 0 16px; color: hsl(220, 4%, 28%); font-size: 18px;">Hours Breakdown</h2>
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: separate; border-spacing: 0 8px;">
                        ${Object.entries(entryGroups)
                          .map(([task, hours]) => `
                            <tr>
                              <td style="padding: 12px 16px; background-color: hsl(200, 6%, 97%); border-radius: 6px;">
                                <div style="color: hsl(220, 4%, 28%); display: flex; justify-content: space-between;">
                                  <span style="font-weight: 500;">${task}</span>
                                  <span>${hours} hours</span>
                                </div>
                              </td>
                            </tr>
                          `).join('')}
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; border-top: 1px solid hsl(200, 6%, 90%);">
                      <p style="margin: 0; color: hsl(220, 4%, 45%); font-size: 14px; line-height: 1.5;">
                        This timesheet has been submitted for your review.<br>
                        Please log in to Logify to approve or request changes.
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send timesheet email:', error);
    return NextResponse.json(
      { error: 'Failed to send timesheet email' },
      { status: 500 }
    );
  }
}