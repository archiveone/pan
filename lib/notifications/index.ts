import Pusher from 'pusher';
import { Resend } from 'resend';

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Pusher for real-time notifications
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

// Email Templates
const emailTemplates = {
  newLead: (lead: any) => ({
    subject: `New Lead: ${lead.contactName}`,
    html: `
      <h2>New Lead Received</h2>
      <p>Contact Details:</p>
      <ul>
        <li>Name: ${lead.contactName}</li>
        <li>Email: ${lead.contactEmail}</li>
        ${lead.contactPhone ? `<li>Phone: ${lead.contactPhone}</li>` : ''}
      </ul>
      <p>Source: ${lead.source}</p>
      ${lead.description ? `<p>Message: ${lead.description}</p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${lead.id}">View Lead in Dashboard</a></p>
    `,
  }),

  newTask: (task: any) => ({
    subject: `New Task: ${task.title}`,
    html: `
      <h2>New Task Assigned</h2>
      <p><strong>${task.title}</strong></p>
      <p>Priority: ${task.priority}</p>
      ${task.description ? `<p>Description: ${task.description}</p>` : ''}
      ${task.dueDate ? `<p>Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks/${task.id}">View Task in Dashboard</a></p>
    `,
  }),

  leadStatusUpdate: (lead: any) => ({
    subject: `Lead Status Updated: ${lead.title}`,
    html: `
      <h2>Lead Status Update</h2>
      <p>The lead "${lead.title}" has been updated to: ${lead.status}</p>
      ${lead.notes ? `<p>Notes: ${lead.notes}</p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads/${lead.id}">View Lead Details</a></p>
    `,
  }),
};

// Notification Types
export type NotificationType = 'NEW_LEAD' | 'NEW_TASK' | 'LEAD_UPDATE' | 'TASK_UPDATE';

// Notification Functions
export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: any
) {
  try {
    // Send real-time notification via Pusher
    await pusher.trigger(`user-${userId}`, type, data);

    return { success: true };
  } catch (error) {
    console.error('Pusher notification error:', error);
    return { success: false, error };
  }
}

export async function sendEmail(
  to: string,
  type: 'newLead' | 'newTask' | 'leadStatusUpdate',
  data: any
) {
  try {
    const template = emailTemplates[type](data);

    const email = await resend.emails.send({
      from: 'GREIA <notifications@greia.ie>',
      to,
      subject: template.subject,
      html: template.html,
    });

    return { success: true, emailId: email.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

// Combined notification function
export async function notifyUser(
  userId: string,
  email: string,
  type: NotificationType,
  data: any
) {
  const notifications = [];

  // Send real-time notification
  notifications.push(sendNotification(userId, type, data));

  // Determine email type and send if applicable
  if (type === 'NEW_LEAD') {
    notifications.push(sendEmail(email, 'newLead', data));
  } else if (type === 'NEW_TASK') {
    notifications.push(sendEmail(email, 'newTask', data));
  } else if (type === 'LEAD_UPDATE') {
    notifications.push(sendEmail(email, 'leadStatusUpdate', data));
  }

  // Wait for all notifications to complete
  const results = await Promise.allSettled(notifications);

  return {
    success: results.some((result) => result.status === 'fulfilled'),
    results,
  };
}