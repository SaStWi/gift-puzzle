import { VALID_HASHES, TABS_DATA, GIFT_URL } from './puzzle-data.js';

// ── Constants ──────────────────────────────────────────────────────────────
const FREE_TABS      = 5;   // first N tabs always accessible
const TOTAL_PUZZLES  = 21;  // number of passwords that can be solved
let TABS           = TABS_DATA.en; // active language tabs

// ── State ──────────────────────────────────────────────────────────────────
let currentLang      = 'en';
let currentTabId     = 1;
let solvedHashes     = new Set(JSON.parse(localStorage.getItem('solvedHashes') || '[]'));
let authToken        = localStorage.getItem('authToken') || null;
let authUsername     = localStorage.getItem('authUsername') || null;
// ── DOM refs ──────────────────────────────────────────────────────────────
const tabListEl      = document.getElementById('tab-list');
const tabContainer   = document.getElementById('tab-container');
const searchInput    = document.getElementById('search-bar');

const resetBtn       = document.getElementById('reset-btn');
const langSelect     = document.getElementById('lang-select');

// ── Auth DOM refs removed ──────────────────────────────────────────────────

// ── SHA-256 utility ────────────────────────────────────────────────────────
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Unlock count ─────────────────────────────────────────────────────────
function getUnlockedCount() {
  return FREE_TABS + solvedHashes.size;
}



// ── Render sidebar tab list ────────────────────────────────────────────────
function renderSidebar() {
  tabListEl.innerHTML = '';
  const unlocked = getUnlockedCount();
  const data = TABS;

  data.forEach((tab, idx) => {
    const li = document.createElement('li');
    const isUnlocked = idx < unlocked;

    if (isUnlocked) {
      li.className = `tab-item ${tab.id === currentTabId ? 'active' : ''}`;

      const numSpan = document.createElement('span');
      numSpan.className = 'tab-num';
      numSpan.textContent = String(tab.id).padStart(2, '0');

      const titleSpan = document.createElement('span');
      titleSpan.textContent = tab.title;

      li.appendChild(numSpan);
      li.appendChild(titleSpan);
      li.onclick = () => selectTab(tab.id);
    } else {
      li.className = 'tab-item locked';

      const numSpan = document.createElement('span');
      numSpan.className = 'tab-num';
      numSpan.textContent = String(tab.id).padStart(2, '0');

      const lockSpan = document.createElement('span');
      lockSpan.textContent = 'Locked';

      const lockIcon = document.createElement('span');
      lockIcon.style.fontSize = '0.8em';
      lockIcon.textContent = ' 🔒';

      li.appendChild(numSpan);
      li.appendChild(lockSpan);
      li.appendChild(lockIcon);
    }

    tabListEl.appendChild(li);
  });
}

// ── Render all tab content panes (hidden by default) ──────────────────────
function renderTabContents() {
  tabContainer.innerHTML = '';
  TABS.forEach(tab => {
    const pane = document.createElement('div');
    pane.className = 'tab-pane';
    pane.id = `tab-pane-${tab.id}`;
    pane.style.display = 'none';
    pane.innerHTML = tab.content;
    tabContainer.appendChild(pane);
  });
}

// ── Select and display a tab ────────────────────────────────────────────────
function selectTab(id) {
  const unlocked = getUnlockedCount();
  const tabIndex = TABS.findIndex(t => t.id === id);
  if (tabIndex >= unlocked) return;

  currentTabId = id;
  renderSidebar();

  document.querySelectorAll('.tab-pane').forEach(el => { el.style.display = 'none'; });
  const pane = document.getElementById(`tab-pane-${id}`);
  if (pane) {
    pane.style.display = 'block';
    // Reset animation
    pane.classList.remove('tab-pane');
    void pane.offsetWidth;
    pane.classList.add('tab-pane');
  }

  // Special triggers
  if (id === 22) {
    // Tab 22: quantum cryptography — no console hint
    console.clear();
    console.log('%c[ARCHIVE — SECTOR 22]', 'color:#58a6ff;font-weight:bold;font-size:14px;');
    console.log('The post-quantum key is hiding in the text of this archive.');
  }

  if (id === 25) {
    // Generate QR code
    const qrDiv = pane.querySelector('#qrcode');
    if (qrDiv && qrDiv.innerHTML === '') {
      setTimeout(() => {
        new QRCode(qrDiv, {
          text: GIFT_URL,
          width: 200,
          height: 200,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        });
      }, 100);
    }
  }
}

// ── Handle password input ──────────────────────────────────────────────────
searchInput.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const val = searchInput.value.trim().toLowerCase();
  if (!val) return;

  const hash = await sha256(val);

  if (hash === 'fb6f0ede84192737e3f94f800b3dba555438e9d59433f78f84b96bd08795dd26') {
    VALID_HASHES.forEach(h => solvedHashes.add(h));
    localStorage.setItem('solvedHashes', JSON.stringify(Array.from(solvedHashes)));
    localStorage.setItem('archiveCompleted', 'true');
    syncProgress();
    searchInput.classList.remove('error');
    searchInput.classList.add('success');
    setTimeout(() => searchInput.classList.remove('success'), 900);
    searchInput.value = '';
    renderSidebar();
    selectTab(getUnlockedCount());
    return;
  }

  if (VALID_HASHES.has(hash)) {
    if (!solvedHashes.has(hash)) {
      solvedHashes.add(hash);
      localStorage.setItem('solvedHashes', JSON.stringify(Array.from(solvedHashes)));
      syncProgress();
      if (solvedHashes.size >= TOTAL_PUZZLES) {
        localStorage.setItem('archiveCompleted', 'true');
      }
      searchInput.classList.remove('error');
      searchInput.classList.add('success');
      setTimeout(() => searchInput.classList.remove('success'), 900);
      searchInput.value = '';
      renderSidebar();
      selectTab(getUnlockedCount()); // jump to newly unlocked tab
    } else {
      // Already solved
      searchInput.classList.add('success');
      setTimeout(() => searchInput.classList.remove('success'), 900);
      searchInput.value = '';
    }
  } else {
    searchInput.classList.remove('error');
    void searchInput.offsetWidth; // reset animation
    searchInput.classList.add('error');
    setTimeout(() => searchInput.classList.remove('error'), 900);
  }
});

// ── Language change ────────────────────────────────────────────────────────
function changeLanguage(lang) {
  currentLang = lang;
  TABS = TABS_DATA[lang];
  renderTabContents();
  renderSidebar();
  selectTab(currentTabId);
}
window.changeLanguage = changeLanguage;

// ── Reset ──────────────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  if (confirm('Reset all progress? All decrypted archives will be locked again.')) {
    localStorage.removeItem('solvedHashes');
    solvedHashes.clear();
    syncProgress();
    const qrDiv = document.querySelector('#qrcode');
    if (qrDiv) qrDiv.innerHTML = '';
    currentTabId = 1;
    searchInput.value = '';
    renderTabContents();
    renderSidebar();
    selectTab(1);
  }
});

// ── Progress Syncing ───────────────────────────────────────────────────────
async function syncProgress() {
  if (!authToken) return;
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken
      },
      body: JSON.stringify({ solvedHashes: Array.from(solvedHashes) })
    });
  } catch (err) {
    console.error('Failed to sync progress:', err);
  }
}

async function loadProgress() {
  if (!authToken) return;
  try {
    const res = await fetch('/api/progress', {
      headers: { 'x-auth-token': authToken }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.progress && data.progress.solvedHashes) {
        let changed = false;
        data.progress.solvedHashes.forEach(h => {
          if (!solvedHashes.has(h)) {
            solvedHashes.add(h);
            changed = true;
          }
        });
        if (solvedHashes.size > data.progress.solvedHashes.length) {
          syncProgress();
        }
        if (changed) {
          localStorage.setItem('solvedHashes', JSON.stringify(Array.from(solvedHashes)));
          renderSidebar();
          selectTab(getUnlockedCount());
        }
      }
    }
  } catch (err) {
    console.error('Failed to load progress:', err);
  }
}

if (authToken) loadProgress();

// ── Init ───────────────────────────────────────────────────────────────────
renderTabContents();
renderSidebar();
selectTab(1);
