// Contact form handler for Social Mate
// Sends submissions via noreply@mail.socialmate.org to info@mail.socialmate.org
// Uses Google Workspace API with domain-wide delegation

async function _gmailGetAccessToken(serviceAccountJson, impersonateEmail) {
  const sa = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    sub: impersonateEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const signatureInput = `${headerB64}.${payloadB64}`;

  const ec = new TextEncoder();
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    _pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, ec.encode(signatureInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const jwt = `${signatureInput}.${signatureB64}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) throw new Error(`Token fetch failed: ${tokenRes.status}`);
  const data = await tokenRes.json();
  return data.access_token;
}

function _pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function _b64urlEncode(buffer) {
  const arr = Array.from(new Uint8Array(buffer));
  const str = String.fromCharCode(...arr);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function _buildRfc822(from, fromName, to, subject, html) {
  const boundary = 'boundary_' + Date.now();
  const headers = [
    `From: ${fromName} <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    'Content-Transfer-Encoding: 7bit',
    '',
  ].join('\r\n');

  const textPart = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    textPart,
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
    `--${boundary}--`,
  ].join('\r\n');

  return headers + '\r\n' + body;
}

async function sendViaGmail(env, { to, subject, html }) {
  const impersonate = 'noreply@mail.socialmate.org';
  const token = await _gmailGetAccessToken(env.GMAIL_SERVICE_ACCOUNT_JSON, impersonate);
  const raw = _buildRfc822(impersonate, 'Social Mate', to, subject, html);
  const rawB64 = _b64urlEncode(new TextEncoder().encode(raw));

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: rawB64 }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail send failed: ${res.status} ${errText}`);
  }
  return true;
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;

  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name')?.trim() || '';
    const email = formData.get('email')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const company = formData.get('company')?.trim() || '';
    const inquiryType = formData.get('inquiry_type')?.trim() || '';
    const message = formData.get('message')?.trim() || '';

    // Validate required fields
    if (!name || !email || !inquiryType || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build email to admin
    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A3060; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; }
    .field { margin: 15px 0; }
    .label { font-weight: bold; color: #1A3060; }
    .value { color: #555; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name</div>
        <div class="value">${name}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>
      ${phone ? `<div class="field"><div class="label">Phone</div><div class="value">${phone}</div></div>` : ''}
      ${company ? `<div class="field"><div class="label">Company</div><div class="value">${company}</div></div>` : ''}
      <div class="field">
        <div class="label">Inquiry Type</div>
        <div class="value">${inquiryType}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="value" style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px;">${message}</div>
      </div>
      <div class="field" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 0.9em; color: #777;">
        <p>This message was sent from the Social Mate contact form.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Build confirmation email to user
    const userHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A3060; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Thank You for Contacting Us</h2>
    </div>
    <div class="content">
      <p>Hi ${name.split(' ')[0]},</p>
      <p>We've received your inquiry and appreciate you reaching out to Social Mate. Our team will review your message and get back to you within 24 business hours.</p>
      <p><strong>Your message details:</strong></p>
      <ul>
        <li><strong>Inquiry Type:</strong> ${inquiryType}</li>
        ${company ? `<li><strong>Company:</strong> ${company}</li>` : ''}
        ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
      </ul>
      <p>In the meantime, feel free to explore our website or follow us on social media for updates on upcoming events and opportunities.</p>
      <p>Best regards,<br><strong>Social Mate Events UAE Team</strong><br>Dubai, United Arab Emirates</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 0.85em; color: #777;">This is an automated confirmation email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Check if Gmail credentials are available
    if (!env.GMAIL_SERVICE_ACCOUNT_JSON) {
      console.error('GMAIL_SERVICE_ACCOUNT_JSON not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send email to admin
    await sendViaGmail(env, {
      to: 'info@mail.socialmate.org',
      subject: `New Contact Form: ${inquiryType} from ${name}`,
      html: adminHtml,
    });

    // Send confirmation email to user
    await sendViaGmail(env, {
      to: email,
      subject: 'We Received Your Message - Social Mate',
      html: userHtml,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Thank you! Your message has been sent.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error.message);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
