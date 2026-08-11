import nodemailer from 'nodemailer';
import { config } from '../config.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}
export async function sendAlertEmail(subject: string, body: string): Promise<void> {
  const t = getTransporter();

  if (!t || !config.smtp.alertTo) {
    console.warn(`[mailer] Configuration SMTP incomplète, email non envoyé : ${subject}`);
    return;
  }

  try {
    await t.sendMail({
      from: config.smtp.user,
      to: config.smtp.alertTo,
      subject: `[ai-hotline] ${subject}`,
      text: body,
    });
    console.log(`[mailer] Email envoyé : ${subject}`);
  } catch (error) {
    console.error("[mailer] Échec de l'envoi de l'email :", error);
  }
}