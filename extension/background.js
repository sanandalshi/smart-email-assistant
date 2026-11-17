// Service worker: performs the backend call on behalf of the Gmail content script.
// Running the request here (with host_permissions) keeps it off the Gmail page.

const DEFAULTS = { apiUrl: 'http://localhost:8080', tone: 'Professional' };

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'GENERATE_REPLY') return false;

  generate(message.emailContent)
    .then((reply) => sendResponse({ ok: true, reply }))
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true; // keep the channel open for the async response
});

async function generate(emailContent) {
  const { apiUrl, tone } = await chrome.storage.sync.get(DEFAULTS);
  let response;
  try {
    response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/email/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailContent, tone }),
    });
  } catch {
    throw new Error(`Cannot reach the backend at ${apiUrl}`);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data.reply;
}
