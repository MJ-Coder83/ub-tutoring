/**
 * Vercel serverless function: receives the enquiry form and emails it on.
 *
 * Required environment variables (set in the Vercel dashboard):
 *   RESEND_API_KEY   - API key from https://resend.com (free tier: 3,000 emails/month)
 *   CONTACT_TO       - where enquiries are delivered (e.g. umartnba.1992@gmail.com)
 *   CONTACT_FROM     - verified sender address. Use "UB Tutoring <onboarding@resend.dev>"
 *                      until a custom domain is verified in Resend.
 *
 * The GitHub Pages copy of the site cannot reach this endpoint (Pages is static
 * only), so app.js falls back to FormSubmit there.
 */

const FIELDS = ['Package', 'Name', 'Email', 'Level', 'Exam Board', 'Focus', 'Comments', 'Newsletter'];
const MAX_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  // Honeypot: bots fill hidden fields, humans never see them.
  if (body._honey) {
    return res.status(200).json({ success: true });
  }

  const name = String(body.Name || '').trim();
  const email = String(body.Email || '').trim();

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }
  if (body.Consent !== 'Yes') {
    return res.status(400).json({ success: false, message: 'Consent is required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || 'UB Tutoring <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.error('Missing RESEND_API_KEY or CONTACT_TO environment variable');
    return res.status(500).json({ success: false, message: 'Form is not configured' });
  }

  const rows = FIELDS
    .filter(field => body[field])
    .map(field => {
      const value = String(body[field]).slice(0, MAX_LENGTH);
      return `<tr>
        <td style="padding:8px 14px;border:1px solid #E4DFD6;background:#F6F3ED;font-weight:600;white-space:nowrap">${escapeHtml(field)}</td>
        <td style="padding:8px 14px;border:1px solid #E4DFD6">${escapeHtml(value).replace(/\n/g, '<br />')}</td>
      </tr>`;
    })
    .join('');

  const html = `
    <div style="font-family:Roboto,Helvetica,Arial,sans-serif;color:#1A2B33">
      <h2 style="color:#0E3A47;margin:0 0 4px">New enquiry from the UB Tutoring website</h2>
      <p style="color:#4A5F6A;margin:0 0 18px">Reply directly to this email to reach ${escapeHtml(name)}.</p>
      <table style="border-collapse:collapse;font-size:15px">${rows}</table>
    </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `UB Tutoring Enquiry — ${name}`,
        html
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend rejected the message:', response.status, detail);
      return res.status(502).json({ success: false, message: 'Could not send your enquiry' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to send enquiry:', error);
    return res.status(502).json({ success: false, message: 'Could not send your enquiry' });
  }
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
