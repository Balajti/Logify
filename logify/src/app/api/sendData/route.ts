import { authOptions } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { format } from "date-fns";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import { TimesheetEntry, ProjectTaskHours } from "@/lib/services/types";


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

      const body = await request.json();

      if (!body.entries || !Array.isArray(body.entries) || body.entries.length === 0) {
          return NextResponse.json({ error: 'No entries provided' }, { status: 400 });
      }

      // Get admin's email using admin_id
      const adminQuery = await sql`
          SELECT email 
          FROM users 
          WHERE id = ${session.user.admin_id || session.user.id}
      `;

      if (adminQuery.rows.length === 0) {
          return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      const adminEmail = adminQuery.rows[0].email;



    // Group entries by project and task
    const entryGroups = body.entries.reduce((acc: ProjectTaskHours, entry: TimesheetEntry) => {
      const projectName = entry.project_name || 'Unknown Project';
      const taskName = entry.task_title || 'Unknown Task';
      
      // Initialize project if it doesn't exist
      if (!acc[projectName]) {
          acc[projectName] = {};
      }
      
      // Initialize or add to task hours
      const hours = typeof entry.hours === 'string' ? parseFloat(entry.hours) : entry.hours;
      if (!acc[projectName][taskName]) {
          acc[projectName][taskName] = hours;
      } else {
          acc[projectName][taskName] += hours;
      }
      
      return acc;
    }, {} as ProjectTaskHours);
  
  // Fixed table generation with proper type assertions
  const tableRows = Object.entries(entryGroups)
      .map(([projectName, tasks]) => 
          Object.entries(tasks as Record<string, number>)
              .map(([taskName, hours]) => `
                  <tr>
                      <td style="padding: 12px 16px; background-color: hsl(200, 6%, 97%); border-radius: 6px 0 0 6px; border-right: 1px solid #fff;">
                          <span style="font-weight: 500;">${projectName}</span>
                      </td>
                      <td style="padding: 12px 16px; background-color: hsl(200, 6%, 97%); border-right: 1px solid #fff;">
                          <span>${taskName}</span>
                      </td>
                      <td style="padding: 12px 16px; background-color: hsl(200, 6%, 97%); border-radius: 0 6px 6px 0; text-align: right;">
                          <span>${hours.toFixed(2)} hours</span>
                      </td>
                  </tr>
              `)
              .join('')
      ).join('');

      const totalHours = body.entries.reduce((sum: number, entry: any) => sum + Number(entry.hours), 0);


        await transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: adminEmail,
            subject: `Timesheet Submission - ${body.employeeName} - ${format(new Date(body.startDate), 'MMM d')} to ${format(new Date(body.endDate), 'MMM d, yyyy')}`,
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
                                            <h1 style="margin: 0; color: hsl(220, 4%, 28%); font-size: 24px; font-weight: 600;">
                                                Timesheet Submission from ${body.employeeName}
                                            </h1>
                                            <p style="color: hsl(220, 4%, 45%); margin-top: 8px;">
                                                ${format(new Date(body.startDate), 'MMMM d')} - ${format(new Date(body.endDate), 'MMMM d, yyyy')}
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
                                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: separate; border-spacing: 0 8px;">
                                                    <tr style="background-color: #f5f5f5;">
                                                        <th style="padding: 8px 16px; text-align: left; color: hsl(220, 4%, 28%); font-weight: 600;">Project</th>
                                                        <th style="padding: 8px 16px; text-align: left; color: hsl(220, 4%, 28%); font-weight: 600;">Task</th>
                                                        <th style="padding: 8px 16px; text-align: right; color: hsl(220, 4%, 28%); font-weight: 600;">Hours</th>
                                                    </tr>
                                                    ${tableRows}
                                                </table>
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
          console.error('Detailed error:', error);
          return NextResponse.json(
              { 
                  error: error instanceof Error ? error.message : 'Failed to send timesheet email',
                  details: error
              },
              { status: 500 }
          );
      }
  }