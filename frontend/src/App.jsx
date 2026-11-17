import { useState } from 'react';
import { generateReply } from './api.js';

const TONES = ['None', 'Professional', 'Casual', 'Friendly'];

export default function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('Professional');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReply('');
    setCopied(false);
    try {
      setReply(await generateReply(emailContent, tone));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to clipboard');
    }
  }

  return (
    <main className="container">
      <header>
        <h1>Smart Email Assistant</h1>
        <p className="subtitle">Paste an email, pick a tone, get a reply.</p>
      </header>

      <form onSubmit={handleGenerate} className="card">
        <label htmlFor="email">Original email</label>
        <textarea
          id="email"
          rows={10}
          placeholder="Paste the email you received here…"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          disabled={loading}
        />

        <div className="row">
          <div className="field">
            <label htmlFor="tone">Tone</label>
            <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} disabled={loading}>
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="primary" disabled={loading || !emailContent.trim()}>
            {loading ? <><span className="spinner" /> Generating…</> : 'Generate reply'}
          </button>
        </div>
      </form>

      {error && <div className="error" role="alert">{error}</div>}

      {reply && (
        <section className="card">
          <div className="reply-header">
            <h2>Generated reply</h2>
            <button type="button" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
          <textarea rows={12} value={reply} onChange={(e) => setReply(e.target.value)} />
        </section>
      )}
    </main>
  );
}
