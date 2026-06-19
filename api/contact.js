/**
 * Vercel serverless function — forwards contact form submissions to Google Sheets
 * via a Google Apps Script web app URL stored in GOOGLE_SCRIPT_URL.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return res.status(500).json({
      error: 'Contact form is not configured yet. Please set GOOGLE_SCRIPT_URL in Vercel.',
    });
  }

  const { fullName, email, brief } = req.body || {};
  if (!fullName || !email || !brief) {
    return res.status(400).json({ error: 'Name, email, and project brief are required.' });
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let result = { success: response.ok };

    try {
      result = JSON.parse(text);
    } catch {
      // Apps Script may return plain text on success
    }

    if (!response.ok || result.success === false) {
      return res.status(500).json({
        error: result.error || 'Could not save your submission. Please try again.',
      });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({
      error: 'Could not reach the form service. Please email contact@svctechai.com instead.',
    });
  }
}
