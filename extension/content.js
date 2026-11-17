// Injects an "AI Reply" button into Gmail compose / reply toolbars.

(() => {
  const BUTTON_CLASS = 'sea-ai-reply-button';

  // Gmail class names are obfuscated and can change; keep all selectors here.
  const SELECTORS = {
    composeToolbar: '.btC',                         // bottom toolbar of a compose/reply box
    composeContainer: '.M9, .AD, [role="dialog"], .ip, .aoI',
    composeBody: '[role="textbox"][g_editable="true"], div[contenteditable="true"][aria-label]',
    emailContent: ['.h7 .a3s.aiL', '.a3s.aiL', '.gmail_quote', '[role="presentation"] .ii.gt'],
  };

  function getEmailContent(toolbar) {
    // Prefer the last expanded message in the open thread.
    for (const selector of SELECTORS.emailContent) {
      const nodes = document.querySelectorAll(selector);
      if (nodes.length) {
        const text = nodes[nodes.length - 1].innerText.trim();
        if (text) return text;
      }
    }
    // Fallback: quoted text inside the compose box itself.
    const quote = findComposeBody(toolbar)?.querySelector('.gmail_quote');
    return quote ? quote.innerText.trim() : '';
  }

  function findComposeBody(toolbar) {
    let node = toolbar;
    while (node && node !== document.body) {
      const body = node.querySelector(SELECTORS.composeBody);
      if (body) return body;
      node = node.parentElement;
    }
    return document.querySelector(SELECTORS.composeBody);
  }

  function insertReply(toolbar, reply) {
    const body = findComposeBody(toolbar);
    if (!body) throw new Error('Could not find the Gmail compose box');
    body.focus();
    // Place caret at the start (above any quoted text) and insert.
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(body, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    // execCommand keeps Gmail's editor state (and undo) in sync and works under Trusted Types.
    if (!document.execCommand('insertText', false, reply)) {
      body.textContent = reply;
      body.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
  }

  function createButton(toolbar) {
    const button = document.createElement('div');
    button.className = `T-I J-J5-Ji aoO v7 T-I-atl L3 ${BUTTON_CLASS}`;
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('data-tooltip', 'Generate AI reply');
    button.textContent = 'AI Reply';

    const run = async () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      const emailContent = getEmailContent(toolbar);
      if (!emailContent) {
        alert('Smart Email Assistant: could not find email content to reply to.');
        return;
      }
      setBusy(button, true);
      try {
        const res = await chrome.runtime.sendMessage({ type: 'GENERATE_REPLY', emailContent });
        if (!res?.ok) throw new Error(res?.error || 'Unknown error');
        insertReply(toolbar, res.reply);
      } catch (err) {
        console.error('[Smart Email Assistant]', err);
        alert(`Smart Email Assistant: ${err.message}`);
      } finally {
        setBusy(button, false);
      }
    };

    button.addEventListener('click', run);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
    });
    return button;
  }

  function setBusy(button, busy) {
    button.textContent = busy ? 'Generating…' : 'AI Reply';
    button.setAttribute('aria-disabled', String(busy));
    button.classList.toggle('sea-busy', busy);
  }

  function injectButtons() {
    document.querySelectorAll(SELECTORS.composeToolbar).forEach((toolbar) => {
      if (toolbar.querySelector(`.${BUTTON_CLASS}`)) return;
      const button = createButton(toolbar);
      // Put it right after the Send button group (first cell of the toolbar row).
      const firstCell = toolbar.querySelector('td');
      if (firstCell?.parentElement) {
        const cell = document.createElement('td');
        cell.appendChild(button);
        firstCell.after(cell);
      } else {
        toolbar.prepend(button);
      }
    });
  }

  // Gmail is a single-page app: watch for compose windows appearing.
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      injectButtons();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  injectButtons();
})();
