// messenger-pin content_script.js (robust, v3)
(() => {
const STORAGE_KEY = 'messengerPinned_v3';
let pinnedSet = new Set();
let scanScheduled = false;

function debug(...args){ try{ console.log('[MessPin]', ...args); }catch{} }

function loadPinned() {
  return new Promise(resolve => {
    try {
      chrome.storage.local.get([STORAGE_KEY], res => {
        const arr = (res && res[STORAGE_KEY]) || [];
        pinnedSet = new Set(arr);
        debug('loaded', arr);
        resolve(arr);
      });
    } catch (e) {
      const s = localStorage.getItem(STORAGE_KEY);
      const arr = s ? JSON.parse(s) : [];
      pinnedSet = new Set(arr);
      debug('loaded fallback', arr);
      resolve(arr);
    }
  });
}

function savePinned() {
  const arr = Array.from(pinnedSet);
  try {
    chrome.storage.local.set({ [STORAGE_KEY]: arr });
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
  debug('saved', arr);
}

function extractConversationId(href) {
  if (!href) return null;
  const m = href.match(/\/messages\/t\/([^/?#]+)/);
  return m ? m[1] : null;
}

function findConversationAnchors() {
  // Primary selector used by many Messenger layouts
  return Array.from(document.querySelectorAll('a[role="link"][href*="/messages/t/"]'));
}

function findRow(anchor) {
  if (!anchor) return null;
  let node = anchor;
  for (let i = 0; i < 8 && node; i++) {
    node = node.parentElement;
    if (!node) break;
    try {
      const rect = node.getBoundingClientRect();
      if (rect && rect.height > 24) {
        // If node contains at least one thread anchor and not too many, it's likely a row
        const anchorsInside = node.querySelectorAll('a[role="link"][href*="/messages/t/"]').length;
        if (anchorsInside >= 1 && anchorsInside <= 6) return node;
      }
    } catch {}
  }
  // Fallbacks
  return anchor.parentElement || anchor.closest('li') || anchor.closest('div');
}

function makeButton(isPinned, convId) {
  const btn = document.createElement('button');
  btn.className = 'messpin-btn';
  btn.type = 'button';
  btn.style.position = 'absolute';
  btn.style.right = '8px';
  btn.style.top = '50%';
  btn.style.transform = 'translateY(-50%)';
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '16px';
  btn.style.padding = '2px';
  btn.style.zIndex = '9999';
  btn.title = isPinned ? 'Unpin chat' : 'Pin chat';
  btn.textContent = isPinned ? '📌' : '📍';
  btn.dataset.convId = convId;
  return btn;
}

function attachToAnchor(anchor) {
  try {
    const convId = extractConversationId(anchor.href);
    if (!convId) return;
    const row = findRow(anchor);
    if (!row) return;
    // Already attached?
    if (row.querySelector('.messpin-btn')) return;
    row.style.position = row.style.position || 'relative';
    const isPinned = pinnedSet.has(convId);
    const btn = makeButton(isPinned, convId);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      if (pinnedSet.has(convId)) {
        pinnedSet.delete(convId);
        btn.textContent = '📍';
        btn.title = 'Pin chat';
        row.classList.remove('messpin-pinned');
      } else {
        pinnedSet.add(convId);
        btn.textContent = '📌';
        btn.title = 'Unpin chat';
        row.classList.add('messpin-pinned');
      }
      savePinned();
      reorderPinned();
    });

    row.appendChild(btn);
    row.dataset.messPinAttached = '1';
    if (pinnedSet.has(convId)) row.classList.add('messpin-pinned');
  } catch (err) {
    console.error('[MessPin] attach error', err);
  }
}

async function addPinButtons() {
  try {
    await loadPinned();
  } catch {}
  const anchors = findConversationAnchors();
  if (!anchors.length) return;
  anchors.forEach(a => attachToAnchor(a));
  reorderPinned();
}

function findListParent(anchors) {
  if (!anchors || !anchors.length) return null;
  function ancestors(el) {
    const out = [];
    let n = el;
    while (n) { out.push(n); n = n.parentElement; }
    return out;
  }
  const lists = anchors.map(a => ancestors(a));
  let common = lists.reduce((acc, cur) => {
    if (!acc) return cur;
    return acc.filter(x => cur.includes(x));
  }, null);
  if (common && common.length) {
    for (const c of common) {
      try {
        const rect = c.getBoundingClientRect();
        if (rect && rect.height > 80 && rect.height < window.innerHeight * 1.2) return c;
      } catch {}
    }
    return common[0];
  }
  return anchors[0].parentElement;
}

function reorderPinned() {
  try {
    const anchors = findConversationAnchors();
    if (!anchors.length) return;
    const listParent = findListParent(anchors);
    if (!listParent) return;
    const nodes = [];
    anchors.forEach(a => {
      const id = extractConversationId(a.href);
      if (!id) return;
      const row = findRow(a);
      if (!row) return;
      nodes.push({ id, row });
    });
    const pinnedIds = Array.from(pinnedSet);
    if (!pinnedIds.length) return;
    const ref = listParent.firstElementChild;
    for (let i = pinnedIds.length - 1; i >= 0; i--) {
      const id = pinnedIds[i];
      const n = nodes.find(x => x.id === id);
      if (n && n.row && n.row.parentElement === listParent) {
        try { listParent.insertBefore(n.row, ref); } catch (e) {}
      }
    }
  } catch (err) {
    console.error('[MessPin] reorder error', err);
  }
}

const observer = new MutationObserver(muts => {
  let added = false;
  for (const m of muts) { if (m.addedNodes && m.addedNodes.length) { added = true; break; } }
  if (!added) return;
  if (scanScheduled) return;
  scanScheduled = true;
  setTimeout(() => { addPinButtons().finally(() => { scanScheduled = false; }); }, 200);
});

(function init() {
  try {
    addPinButtons();
    observer.observe(document.body, { childList: true, subtree: true });
    // safety net periodic scan
    setInterval(() => { addPinButtons(); }, 1500);
    debug('initialized');
  } catch (e) {
    console.error('[MessPin] init error', e);
  }
})();
})(); // IIFE end
