const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function generateReply(emailContent, tone) {
  let response;
  try {
    response = await fetch(`${API_URL}/api/email/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailContent, tone }),
    });
  } catch {
    throw new Error(`Cannot reach the backend at ${API_URL}. Is it running?`);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data.reply;
}
