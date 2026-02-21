/* ============================================================
   AMPLIFYD Digital — Netlify Serverless Function: Kontaktformular
   Datei: /netlify/functions/contact.js

   Setup:
   1. npm install resend  (im Projekt-Root)
   2. Netlify: Site settings → Environment variables:
      RESEND_API_KEY     = re_xxxxxxxxxxxxxxxxxxxx
      CONTACT_EMAIL      = deine@firmenmail.de
      ALLOWED_ORIGIN     = https://amplifyd.digital
   ============================================================ */

const { Resend } = require('resend');

const escapeHtml = str =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

const isValidEmail = email =>
    /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email);

const ALLOWED_FIELDS = ['name', 'email', 'company', 'service', 'message', '_honeypot'];

const LIMITS = {
    name: 100,
    email: 200,
    company: 200,
    service: 80,
    message: 2000,
    _honeypot: 0,
};

exports.handler = async event => {

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const origin = event.headers?.origin || '';
    const allowed = process.env.ALLOWED_ORIGIN || 'https://amplifyd.digital';
    if (!origin.startsWith(allowed)) {
        return { statusCode: 403, body: 'Forbidden' };
    }

    let raw;
    try {
        raw = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: 'Ungültige Anfrage.' };
    }

    const data = {};
    for (const key of ALLOWED_FIELDS) {
        data[key] = typeof raw[key] === 'string' ? raw[key].trim() : '';
    }

    if (data._honeypot.length > 0) {
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    for (const [field, limit] of Object.entries(LIMITS)) {
        if (field === '_honeypot') continue;
        if (data[field].length > limit) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: `Feld "${field}" ist zu lang.` }),
            };
        }
    }

    if (!data.name) return { statusCode: 400, body: JSON.stringify({ error: 'Name fehlt.' }) };
    if (!data.email) return { statusCode: 400, body: JSON.stringify({ error: 'E-Mail fehlt.' }) };
    if (!data.message) return { statusCode: 400, body: JSON.stringify({ error: 'Nachricht fehlt.' }) };
    if (!isValidEmail(data.email)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Ungültige E-Mail-Adresse.' }) };
    }

    const safe = {
        name: escapeHtml(data.name),
        email: escapeHtml(data.email),
        company: escapeHtml(data.company) || '—',
        service: escapeHtml(data.service) || '—',
        message: escapeHtml(data.message).replace(/\n/g, '<br>'),
    };

    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipientMail = process.env.CONTACT_EMAIL || 'kontakt@amplifyd.digital';

    try {
        await resend.emails.send({
            from: 'AMPLIFYD Digital <kontakt@amplifyd.digital>',
            to: recipientMail,
            replyTo: data.email,
            subject: `Neue Anfrage von ${safe.name}`,
            html: `
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #060810; color: #F5F5F7; margin: 0; padding: 24px; }
            .wrapper { max-width: 600px; margin: 0 auto; background: #1C1C1E; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #00f0ff22, #ff2d6b11); padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.08); }
            .header h1 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #fff; }
            .header p { margin: 6px 0 0; font-size: 0.85rem; color: #8E8E93; }
            .body { padding: 32px; }
            .field { margin-bottom: 20px; }
            .label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #636366; margin-bottom: 6px; }
            .value { font-size: 0.95rem; color: #F5F5F7; line-height: 1.6; }
            .message-box { background: #0A0A0A; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; }
            .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.78rem; color: #48484A; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>AMPLIFYD Digital — Neue Kontaktanfrage</h1>
              <p>Eingegangen: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
            </div>
            <div class="body">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${safe.name}</div>
              </div>
              <div class="field">
                <div class="label">E-Mail</div>
                <div class="value"><a href="mailto:${safe.email}" style="color:#2997FF">${safe.email}</a></div>
              </div>
              <div class="field">
                <div class="label">Unternehmen</div>
                <div class="value">${safe.company}</div>
              </div>
              <div class="field">
                <div class="label">Interesse an</div>
                <div class="value">${safe.service}</div>
              </div>
              <div class="field">
                <div class="label">Nachricht</div>
                <div class="message-box value">${safe.message}</div>
              </div>
            </div>
            <div class="footer">
              Diese E-Mail wurde automatisch von amplifyd.digital gesendet.
            </div>
          </div>
        </body>
        </html>
      `,
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowed,
            },
            body: JSON.stringify({ success: true }),
        };

    } catch (err) {
        console.error('[contact.js] E-Mail-Fehler:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Interner Fehler. Bitte per E-Mail kontaktieren.' }),
        };
    }
};
