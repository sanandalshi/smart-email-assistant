const DEFAULTS = { apiUrl: 'http://localhost:8080', tone: 'Professional' };

chrome.storage.sync.get(DEFAULTS).then(({ apiUrl, tone }) => {
  document.getElementById('apiUrl').value = apiUrl;
  document.getElementById('tone').value = tone;
});

document.getElementById('save').addEventListener('click', async () => {
  await chrome.storage.sync.set({
    apiUrl: document.getElementById('apiUrl').value.trim() || DEFAULTS.apiUrl,
    tone: document.getElementById('tone').value,
  });
  const status = document.getElementById('status');
  status.textContent = 'Saved';
  setTimeout(() => (status.textContent = ''), 1500);
});
