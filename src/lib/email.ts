import { Resend } from "resend";
import { env } from "@/env";

type Email = {
  to: string;
  subject: string;
  text: string;
};

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, text }: Email) {
  if (!resend) {
    console.info(`[email] To: ${to}\nSubject: ${subject}\n\n${text}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
  });
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
