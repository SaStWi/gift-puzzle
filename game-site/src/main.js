import './style.css'

const GAMES = [
  { id: 'archive', title: 'The Archive', desc: 'Decrypt 24 vaults.', cost: 0, reward: 50, url: 'games/puzzle/', parent: null, image: 'archive_neal.jpg' },
  { id: 'base2', title: 'Neon Rider', desc: 'Cyberpunk racing.', cost: 0, reward: 30, url: '#', parent: null, image: 'neonrider_neal.jpg' },
  { id: 'base3', title: 'Clicker Idle', desc: 'Number goes up.', cost: 0, reward: 20, url: '#', parent: null, image: 'clicker_neal.jpg' },

  // Archive children
  { id: 'arch_c1', title: 'The Labyrinth', desc: 'Custom maze generator.', cost: 75, reward: 250, url: 'games/maze/index.html', parent: 'archive' },
  { id: 'arch_c2', title: 'Deep Web', desc: 'Scrape the depths.', cost: 40, reward: 80, url: '#', parent: 'archive' },
  { id: 'arch_c1_1', title: 'Botnet', desc: 'Control nodes.', cost: 50, reward: 100, url: '#', parent: 'arch_c1' },
  { id: 'arch_c1_2', title: 'Zero Day', desc: 'Find exploits.', cost: 60, reward: 120, url: '#', parent: 'arch_c1' },
  { id: 'arch_c2_1', title: 'Data Broker', desc: 'Sell secrets.', cost: 70, reward: 140, url: '#', parent: 'arch_c2' },
  { id: 'arch_c2_2', title: 'Mainframe', desc: 'Hack the core.', cost: 80, reward: 160, url: '#', parent: 'arch_c2' },

  // Base2 children
  { id: 'b2_c1', title: 'Neon Drifter', desc: 'Drift mechanics.', cost: 15, reward: 40, url: '#', parent: 'base2' },
  { id: 'b2_c2', title: 'Synthwave', desc: 'Rhythm game.', cost: 20, reward: 45, url: '#', parent: 'base2' },
  { id: 'b2_c1_1', title: 'Hyper Drive', desc: 'Go faster.', cost: 35, reward: 70, url: '#', parent: 'b2_c1' },
  { id: 'b2_c1_2', title: 'Street King', desc: 'Rule the city.', cost: 40, reward: 80, url: '#', parent: 'b2_c1' },
  { id: 'b2_c2_1', title: 'Beat Saber', desc: 'Slice beats.', cost: 45, reward: 90, url: '#', parent: 'b2_c2' },
  { id: 'b2_c2_2', title: 'DJ Sim', desc: 'Mix tracks.', cost: 50, reward: 100, url: '#', parent: 'b2_c2' },

  // Base3 children
  { id: 'b3_c1', title: 'Cookie Factory', desc: 'Bake cookies.', cost: 10, reward: 25, url: '#', parent: 'base3' },
  { id: 'b3_c2', title: 'Galaxy Miner', desc: 'Mine planets.', cost: 15, reward: 35, url: '#', parent: 'base3' },
  { id: 'b3_c1_1', title: 'Grandma', desc: 'More cookies.', cost: 20, reward: 50, url: '#', parent: 'b3_c1' },
  { id: 'b3_c1_2', title: 'Farm', desc: 'Grow cookies.', cost: 25, reward: 60, url: '#', parent: 'b3_c1' },
  { id: 'b3_c2_1', title: 'Asteroid', desc: 'Mine asteroids.', cost: 30, reward: 70, url: '#', parent: 'b3_c2' },
  { id: 'b3_c2_2', title: 'Black Hole', desc: 'Suck resources.', cost: 35, reward: 80, url: '#', parent: 'b3_c2' },

  // Level 4 Children
  { id: 'arch_c1_1_1', title: 'Project Alpha', desc: 'Classified.', cost: 100, reward: 200, url: '#', parent: 'arch_c1_1' },
  { id: 'arch_c1_1_2', title: 'Project Beta', desc: 'Classified.', cost: 110, reward: 220, url: '#', parent: 'arch_c1_1' },
  { id: 'arch_c1_2_1', title: 'Project Alpha', desc: 'Classified.', cost: 120, reward: 240, url: '#', parent: 'arch_c1_2' },
  { id: 'arch_c1_2_2', title: 'Project Beta', desc: 'Classified.', cost: 130, reward: 260, url: '#', parent: 'arch_c1_2' },
  { id: 'arch_c2_1_1', title: 'Project Alpha', desc: 'Classified.', cost: 140, reward: 280, url: '#', parent: 'arch_c2_1' },
  { id: 'arch_c2_1_2', title: 'Project Beta', desc: 'Classified.', cost: 150, reward: 300, url: '#', parent: 'arch_c2_1' },
  { id: 'arch_c2_2_1', title: 'Project Alpha', desc: 'Classified.', cost: 160, reward: 320, url: '#', parent: 'arch_c2_2' },
  { id: 'arch_c2_2_2', title: 'Project Beta', desc: 'Classified.', cost: 170, reward: 340, url: '#', parent: 'arch_c2_2' },
  { id: 'b2_c1_1_1', title: 'Project Alpha', desc: 'Classified.', cost: 180, reward: 360, url: '#', parent: 'b2_c1_1' },
  { id: 'b2_c1_1_2', title: 'Project Beta', desc: 'Classified.', cost: 190, reward: 380, url: '#', parent: 'b2_c1_1' },
  { id: 'b2_c1_2_1', title: 'Project Alpha', desc: 'Classified.', cost: 200, reward: 400, url: '#', parent: 'b2_c1_2' },
  { id: 'b2_c1_2_2', title: 'Project Beta', desc: 'Classified.', cost: 210, reward: 420, url: '#', parent: 'b2_c1_2' },
  { id: 'b2_c2_1_1', title: 'Project Alpha', desc: 'Classified.', cost: 220, reward: 440, url: '#', parent: 'b2_c2_1' },
  { id: 'b2_c2_1_2', title: 'Project Beta', desc: 'Classified.', cost: 230, reward: 460, url: '#', parent: 'b2_c2_1' },
  { id: 'b2_c2_2_1', title: 'Project Alpha', desc: 'Classified.', cost: 240, reward: 480, url: '#', parent: 'b2_c2_2' },
  { id: 'b2_c2_2_2', title: 'Project Beta', desc: 'Classified.', cost: 250, reward: 500, url: '#', parent: 'b2_c2_2' },
  { id: 'b3_c1_1_1', title: 'Project Alpha', desc: 'Classified.', cost: 260, reward: 520, url: '#', parent: 'b3_c1_1' },
  { id: 'b3_c1_1_2', title: 'Project Beta', desc: 'Classified.', cost: 270, reward: 540, url: '#', parent: 'b3_c1_1' },
  { id: 'b3_c1_2_1', title: 'Project Alpha', desc: 'Classified.', cost: 280, reward: 560, url: '#', parent: 'b3_c1_2' },
  { id: 'b3_c1_2_2', title: 'Project Beta', desc: 'Classified.', cost: 290, reward: 580, url: '#', parent: 'b3_c1_2' },
  { id: 'b3_c2_1_1', title: 'Project Alpha', desc: 'Classified.', cost: 300, reward: 600, url: '#', parent: 'b3_c2_1' },
  { id: 'b3_c2_1_2', title: 'Project Beta', desc: 'Classified.', cost: 310, reward: 620, url: '#', parent: 'b3_c2_1' },
  { id: 'b3_c2_2_1', title: 'Project Alpha', desc: 'Classified.', cost: 320, reward: 640, url: '#', parent: 'b3_c2_2' },
  { id: 'b3_c2_2_2', title: 'Project Beta', desc: 'Classified.', cost: 330, reward: 660, url: '#', parent: 'b3_c2_2' }
];

document.addEventListener('DOMContentLoaded', () => {
  let isSandbox = localStorage.getItem('sandboxMode') === 'true';

  let authToken = localStorage.getItem('authToken') || null;
  let authUsername = localStorage.getItem('authUsername') || null;

  let state = {
    tokens: parseInt(localStorage.getItem('tokens') || '0', 10),
    totalEarned: parseInt(localStorage.getItem('totalEarned') || '0', 10),
    totalSpent: parseInt(localStorage.getItem('totalSpent') || '0', 10),
    unlocked: JSON.parse(localStorage.getItem('unlockedGames') || '["archive", "base2", "base3"]'),
    completed: JSON.parse(localStorage.getItem('completedGames') || '[]'),
    achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
    profilePic: localStorage.getItem('profilePic') || 'favicon.ico'
  };

  // Check integration with The Archive
  if (localStorage.getItem('archiveCompleted') === 'true' && !state.completed.includes('archive')) {
    state.completed.push('archive');
    state.tokens += 50; 
    saveState();
  }

  const sandboxToggle = document.getElementById('sandbox-toggle');
  if (sandboxToggle) {
    sandboxToggle.checked = isSandbox;
    sandboxToggle.addEventListener('change', (e) => {
      localStorage.setItem('sandboxMode', e.target.checked);
      window.location.reload();
    });
  }

  async function saveState(sync = true) {
    localStorage.setItem('tokens', state.tokens.toString());
    localStorage.setItem('totalEarned', state.totalEarned.toString());
    localStorage.setItem('totalSpent', state.totalSpent.toString());
    localStorage.setItem('unlockedGames', JSON.stringify(state.unlocked));
    localStorage.setItem('completedGames', JSON.stringify(state.completed));
    localStorage.setItem('achievements', JSON.stringify(state.achievements));
    localStorage.setItem('profilePic', state.profilePic);
    
    if (sync && authToken) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
          },
          body: JSON.stringify({ siteState: state })
        });
      } catch (e) {
        console.error('Failed to sync state', e);
      }
    }
  }

  function buildBranch(nodeId, depth) {
    const game = GAMES.find(g => g.id === nodeId);
    const children = GAMES.filter(g => g.parent === nodeId);
    
    let isCompleted = state.completed.includes(game.id);
    let isUnlocked = state.unlocked.includes(game.id);
    let parentCompleted = game.parent === null || state.completed.includes(game.parent);
    
    if (isSandbox) {
      isUnlocked = true;
      parentCompleted = true;
    }

    let nodeState = 'locked';
    if (isCompleted) nodeState = 'completed';
    else if (isUnlocked) nodeState = 'unlocked';
    else if (parentCompleted) nodeState = 'purchasable';

    const card = document.createElement(isUnlocked ? 'a' : 'div');
    card.className = `node tier-${depth} ${nodeState}`;
    if (isUnlocked && game.url !== '#') {
      card.href = game.url;
    }

    let actionHtml = '';
    if (nodeState === 'completed') {
      if (game.url === '#') actionHtml = `<div class="node-badge badge-soon">SOON</div>`;
      else actionHtml = `<div class="node-badge badge-completed">DONE</div>`;
    } else if (nodeState === 'unlocked') {
      if (game.url === '#') actionHtml = `<div class="node-badge badge-soon">SOON</div>`;
      else actionHtml = `<div class="node-badge badge-unlocked">PLAY</div>`;
    } else if (nodeState === 'purchasable') {
      actionHtml = `<div class="node-badge badge-buy">BUY</div>`;
    }

    let costHtml = nodeState === 'purchasable' ? `Cost: ${game.cost} T` : `Reward: ${game.reward} T`;
    if (nodeState === 'locked') costHtml = '???';
    if (isSandbox) costHtml = 'SANDBOX';

    if (game.image) {
      card.style.backgroundImage = `url(${game.image})`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }

    card.innerHTML = `
      <div class="node-title">${game.title}</div>
      <div class="node-divider"></div>
      <div class="node-meta">${costHtml}</div>
      ${actionHtml}
    `;

    card.addEventListener('click', (e) => {
       if (card.tagName === 'A') return;
       
       // Handle DEV completion simulation on entire card click if it's a placeholder
       if ((nodeState === 'unlocked' || nodeState === 'completed') && game.url === '#' && !isSandbox) {
           e.preventDefault();
           if (!state.completed.includes(game.id)) {
             if (confirm(`[DEV] Simulate completing ${game.title} to earn ${game.reward} tokens?`)) {
               state.completed.push(game.id);
               state.tokens += game.reward;
               saveState();
               renderAll();
             }
           }
           return;
       }

       if (nodeState === 'purchasable') {
          if (state.tokens >= game.cost) {
            state.tokens -= game.cost;
            state.totalSpent += game.cost;
            state.unlocked.push(game.id);
            saveState();
            renderAll();
          } else {
            alert('Not enough tokens!');
          }
       }
    });

    if (depth === 4) {
      return card;
    }

    const branch = document.createElement('div');
    branch.className = 'branch';
    branch.appendChild(card);

    if (children.length > 0) {
      const vLine = document.createElement('div');
      vLine.className = 'v-line';
      if (isCompleted) vLine.classList.add('completed');
      else if (isUnlocked) vLine.classList.add('unlocked');
      branch.appendChild(vLine);

      if (depth < 3) {
        const hSplit = document.createElement('div');
        hSplit.className = 'h-split';
        if (isCompleted) hSplit.classList.add('completed');
        else if (isUnlocked) hSplit.classList.add('unlocked');
        branch.appendChild(hSplit);

        const subGrid = document.createElement('div');
        subGrid.className = 'sub-grid-2';
        children.forEach(child => {
          subGrid.appendChild(buildBranch(child.id, depth + 1));
        });
        branch.appendChild(subGrid);
      } else {
        const leafStack = document.createElement('div');
        leafStack.className = 'leaf-stack';
        children.forEach(child => {
          leafStack.appendChild(buildBranch(child.id, depth + 1));
        });
        branch.appendChild(leafStack);
      }
    }

    return branch;
  }

  function renderAll() {
    document.getElementById('token-count').textContent = state.tokens;
    const treeRoot = document.getElementById('tree-root');
    treeRoot.innerHTML = '';
    
    const roots = GAMES.filter(g => g.parent === null);
    const grid = document.createElement('div');
    grid.className = 'branches-grid';
    
    roots.forEach(rootGame => {
      grid.appendChild(buildBranch(rootGame.id, 1));
    });
    
    treeRoot.appendChild(grid);
  }

  // --- Auth Logic ---
  const authModal = document.getElementById('auth-modal');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const authLoginView = document.getElementById('auth-login-view');
  const authRegisterView = document.getElementById('auth-register-view');

  const siteUser = document.getElementById('site-user');
  const sitePass = document.getElementById('site-pass');
  const siteLoginBtn = document.getElementById('site-login-btn');
  const siteShowRegisterBtn = document.getElementById('site-show-register-btn');
  const siteAuthMsg = document.getElementById('site-auth-msg');

  const regEmail = document.getElementById('reg-email');
  const regUser = document.getElementById('reg-user');
  const regPass = document.getElementById('reg-pass');
  const regPassConfirm = document.getElementById('reg-pass-confirm');
  const siteRegisterBtn = document.getElementById('site-register-btn');
  const siteShowLoginBtn = document.getElementById('site-show-login-btn');
  const siteRegMsg = document.getElementById('site-reg-msg');
  
  const siteUserDisplay = document.getElementById('site-user-display');
  const toggleAuthBtn = document.getElementById('site-toggle-auth-btn');
  const logoutBtn = document.getElementById('site-logout-btn');

  function updateAuthUI() {
    if (authToken) {
      authModal.style.display = 'none';
      toggleAuthBtn.style.display = 'none';
      siteUserDisplay.style.display = 'inline';
      siteUserDisplay.textContent = authUsername;
      logoutBtn.style.display = 'inline';
      
      // Clear forms
      siteAuthMsg.textContent = '';
      siteRegMsg.textContent = '';
      siteUser.value = '';
      sitePass.value = '';
      regEmail.value = '';
      regUser.value = '';
      regPass.value = '';
      regPassConfirm.value = '';
    } else {
      siteUserDisplay.style.display = 'none';
      logoutBtn.style.display = 'none';
      toggleAuthBtn.style.display = 'inline';
    }
  }

  function resetModalViews() {
    authLoginView.style.display = 'block';
    authRegisterView.style.display = 'none';
    siteAuthMsg.textContent = '';
    siteRegMsg.textContent = '';
  }

  if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', () => {
      resetModalViews();
      authModal.style.display = 'flex';
    });
  }

  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', () => {
      authModal.style.display = 'none';
    });
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.style.display = 'none';
      }
    });
  }

  if (siteShowRegisterBtn) {
    siteShowRegisterBtn.addEventListener('click', () => {
      authLoginView.style.display = 'none';
      authRegisterView.style.display = 'block';
    });
  }

  if (siteShowLoginBtn) {
    siteShowLoginBtn.addEventListener('click', () => {
      authRegisterView.style.display = 'none';
      authLoginView.style.display = 'block';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authToken = null;
      authUsername = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUsername');
      updateAuthUI();
    });
  }

  async function handleLogin() {
    const username = siteUser.value.trim();
    const password = sitePass.value;
    if (!username || !password) {
      siteAuthMsg.textContent = 'Missing credentials.';
      return;
    }
    siteAuthMsg.textContent = 'Authenticating...';

    try {
      let res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        authToken = data.token;
        authUsername = data.username;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('authUsername', authUsername);
        
        if (data.progress && data.progress.siteState) {
          state = data.progress.siteState;
          saveState(false);
        }
        updateAuthUI();
        renderAll();
      } else {
        siteAuthMsg.textContent = data.message || 'Error occurred.';
      }
    } catch (err) {
      siteAuthMsg.textContent = 'Network error.';
    }
  }

  async function handleRegister() {
    const email = regEmail.value.trim();
    const username = regUser.value.trim();
    const password = regPass.value;
    const passConfirm = regPassConfirm.value;

    if (!email || !username || !password || !passConfirm) {
      siteRegMsg.textContent = 'Please fill in all fields.';
      return;
    }
    if (password !== passConfirm) {
      siteRegMsg.textContent = 'Passwords do not match.';
      return;
    }

    siteRegMsg.textContent = 'Creating account...';

    try {
      let res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        authToken = data.token;
        authUsername = data.username;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('authUsername', authUsername);
        
        if (data.progress && data.progress.siteState) {
          state = data.progress.siteState;
          saveState(false);
        }
        updateAuthUI();
        renderAll();
      } else {
        siteRegMsg.textContent = data.message || 'Error occurred.';
      }
    } catch (err) {
      siteRegMsg.textContent = 'Network error.';
    }
  }

  if (siteLoginBtn) {
    siteLoginBtn.addEventListener('click', handleLogin);
  }
  
  if (siteRegisterBtn) {
    siteRegisterBtn.addEventListener('click', handleRegister);
  }

  updateAuthUI();
  if (authToken) {
    fetch('/api/progress', { headers: { 'x-auth-token': authToken } })
      .then(res => res.json())
      .then(data => {
        if (data.progress && data.progress.siteState) {
          state = data.progress.siteState;
          saveState(false);
          renderAll();
        }
      })
      .catch(e => console.error('Failed to load state', e));
  }

  renderAll();

  // --- UI Enhancements: Profile, Achievements, Audio, Canvas ---
  
  function checkAchievements() {
    if (localStorage.getItem('archiveCompleted') === 'true' && !state.achievements.includes('ach_archive')) {
      state.achievements.push('ach_archive');
      state.tokens += 15;
      state.totalEarned += 15;
      alert('Achievement Unlocked: Reach artifact 015 in the archive! Reward: 15 tokens.');
      saveState();
      renderAll();
    }
  }
  
  // Call it on load and after actions
  checkAchievements();

  // Profile Modal Logic
  const profileModal = document.getElementById('profile-modal');
  const profileCloseBtn = document.getElementById('profile-close-btn');
  const profileUsername = document.getElementById('profile-username');
  const profilePic = document.getElementById('profile-pic');
  const profilePicUrl = document.getElementById('profile-pic-url');
  const savePicBtn = document.getElementById('save-pic-btn');
  
  const statCompleted = document.getElementById('stat-completed');
  const statEarnt = document.getElementById('stat-earnt');
  const statSpent = document.getElementById('stat-spent');
  const statCurrent = document.getElementById('stat-current');
  const achievementsList = document.getElementById('achievements-list');

  siteUserDisplay.style.cursor = 'pointer';
  siteUserDisplay.addEventListener('click', () => {
    profileUsername.textContent = authUsername || 'Guest';
    profilePic.src = state.profilePic || 'favicon.ico';
    statCompleted.textContent = state.completed.length;
    statEarnt.textContent = state.totalEarned;
    statSpent.textContent = state.totalSpent;
    statCurrent.textContent = state.tokens;
    
    achievementsList.innerHTML = '';
    if (state.achievements.length === 0) {
      achievementsList.innerHTML = '<li>No achievements yet.</li>';
    } else {
      if (state.achievements.includes('ach_archive')) {
        achievementsList.innerHTML += '<li>🌟 The Archive Master - 15 Tokens</li>';
      }
    }
    
    profileModal.style.display = 'flex';
  });

  profileCloseBtn.addEventListener('click', () => {
    profileModal.style.display = 'none';
  });

  savePicBtn.addEventListener('click', () => {
    const url = profilePicUrl.value.trim();
    if (url) {
      state.profilePic = url;
      profilePic.src = url;
      saveState();
    }
  });

  // Audio Context for Typing Sounds
  let audioCtx = null;
  function playTypingSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    // Randomize pitch slightly for mechanical feel
    osc.frequency.setValueAtTime(400 + Math.random() * 100, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  document.addEventListener('keydown', (e) => {
    // Only play on character keys or space/backspace
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      playTypingSound();
    }
  });

  // Background Particle Animation
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    for(let i=0; i<100; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
      });
    }

    let time = 0;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      // Wavy lines
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let y = 0; y < height; y += 50) {
        ctx.moveTo(0, y + Math.sin(time + y) * 10);
        for(let x = 0; x < width; x += 50) {
          ctx.lineTo(x, y + Math.sin(time + (x+y)*0.01) * 20);
        }
      }
      ctx.stroke();

      // Particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        
        if(p.x < 0 || p.x > width) p.dx *= -1;
        if(p.y < 0 || p.y > height) p.dy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 0.02;
      requestAnimationFrame(animate);
    }
    animate();
  }

});
