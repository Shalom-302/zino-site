'use server';

import nodemailer from 'nodemailer';
import { supabaseServer } from '@/lib/supabase-server';

function buildNewsletterHtml(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4ebe1;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ebe1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;">
          <!-- Header -->
          <tr>
            <td style="background:#0F0F0F;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background:#E13027;width:32px;height:32px;text-align:center;line-height:32px;font-style:italic;font-weight:900;color:#fff;font-size:16px;font-family:Georgia,serif;">Z</span>
                    <span style="color:#fff;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;margin-left:10px;vertical-align:middle;">Z FIT / SPA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Gold line -->
          <tr><td style="height:3px;background:#C4A87A;"></td></tr>
          <!-- Subject -->
          <tr>
            <td style="padding:40px 40px 0 40px;">
              <p style="margin:0 0 8px 0;font-size:10px;color:#C4A87A;letter-spacing:0.28em;text-transform:uppercase;">Z FIT SPA — Abidjan</p>
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#0F0F0F;line-height:1.3;">${subject}</h1>
              <div style="width:40px;height:1px;background:#C4A87A;margin-top:20px;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 40px 40px;font-size:15px;font-weight:300;color:#1C1108;line-height:1.8;">
              ${body.replace(/\n/g, '<br />')}
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background:rgba(28,17,8,0.1);"></div></td></tr>
          <!-- CTA zone -->
          <tr>
            <td style="padding:32px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="https://zfitspa.ci" style="display:inline-block;padding:14px 28px;border:1px solid rgba(28,17,8,0.25);font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#0F0F0F;text-decoration:none;font-family:Georgia,serif;">
                      Visiter le site
                    </a>
                  </td>
                  <td style="padding-left:12px;">
                    <a href="https://zfitspa.ci/reservation" style="display:inline-block;padding:14px 28px;background:#C4A87A;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#fff;text-decoration:none;font-family:Georgia,serif;">
                      Réserver
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0F0F0F;padding:24px 40px;">
              <p style="margin:0 0 4px 0;font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.2em;text-transform:uppercase;">Z FIT SPA — 2 Plateaux Vallon, Abidjan</p>
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.25);">
                Vous recevez cet email car vous êtes inscrit à notre newsletter.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNewsletter(subject: string, body: string): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  error?: string;
}> {
  if (!subject.trim() || !body.trim()) {
    return { success: false, sent: 0, failed: 0, error: 'Sujet et contenu requis.' };
  }

  let emails: string[] = [];
  try {
    const { data, error } = await supabaseServer
      .from('newsletter_subscribers')
      .select('email')
      .order('created_at', { ascending: true });
    if (error) throw error;
    emails = (data || []).map(d => d.email as string).filter(Boolean);
  } catch (err: any) {
    return { success: false, sent: 0, failed: 0, error: 'Erreur Supabase: ' + err.message };
  }

  if (emails.length === 0) {
    return { success: false, sent: 0, failed: 0, error: 'Aucun abonné trouvé.' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
  });

  const html = buildNewsletterHtml(subject, body);
  let sent = 0;
  let failed = 0;

  // Send in batches of 10 to avoid overwhelming SMTP
  const batchSize = 10;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (email) => {
        try {
          await transporter.sendMail({
            from: `"Z FIT / SPA" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
          });
          sent++;
        } catch {
          failed++;
        }
      })
    );
  }

  return { success: true, sent, failed };
}
