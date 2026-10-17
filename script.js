/**
 * RT-Ku v0.3 — Hybrid Real-Time Client Engine
 * Powered by Native SQLite + Server-Sent Events (SSE) with LocalStorage Fallback.
 * Includes Focus #1: Transparent Kas Ledger & Monthly Citizen Dues Tracker.
 */

const STORAGE_KEYS = {
  STORE: 'rtku_v03_store',
  SESSION: 'rtku_v03_session',
  THEME: 'rtku_v03_theme'
};

const REACTION_EMOJIS = ['👍', '❤️', '🙏', '🔥', '✅'];

function getDefaultSeedStore() {
  return {
    channels: [
      {
        id: 'group-rt',
        name: 'forum-warga-rt003',
        title: 'Forum Warga RT 003',
        category: 'public',
        topic: 'Saluran Utama Diskusi & Koordinasi Warga RT 003 / RW 005',
        badge: 'Utama'
      },
      {
        id: 'ch-pengumuman',
        name: 'pengumuman-resmi',
        title: 'Pengumuman Pengurus',
        category: 'announcement',
        topic: 'Informasi Resmi Ketua RT, Sekretaris, dan Bendahara',
        badge: 'Resmi'
      },
      {
        id: 'ch-keamanan',
        name: 'keamanan-ronda',
        title: 'Keamanan & Siskamling',
        category: 'public',
        topic: 'Koordinasi Pos Ronda Malam, Tamu Wajib Lapor & Keamanan Lingkungan',
        badge: 'Siaga'
      },
      {
        id: 'ch-umkm',
        name: 'lapak-umkm-warga',
        title: 'Lapak UMKM & Kuliner Warga',
        category: 'public',
        topic: 'Promosi Usaha Warga, Kuliner Harian, dan Jasa Lingkungan RT',
        badge: 'Ekonomi'
      }
    ],
    users: [
      {
        nik: '3201010101900001',
        name: 'Bambang Pamungkas',
        rtrw: '003/005',
        password: 'admin',
        role: 'admin',
        title: 'Ketua RT 003',
        status: 'Active',
        bio: 'Pengurus RT 003 / RW 005 • Melayani administrasi & ketertiban warga.'
      },
      {
        nik: '3201010202920002',
        name: 'Siti Nurhaliza',
        rtrw: '003/005',
        password: 'user123',
        role: 'citizen',
        title: 'Koordinator PKK & Posyandu',
        status: 'Active',
        bio: 'Penggerak PKK RT 003 & Posyandu Balita/Lansia.'
      },
      {
        nik: '3201010303950003',
        name: 'Budi Santoso',
        rtrw: '003/005',
        password: 'user123',
        role: 'citizen',
        title: 'Koordinator Keamanan',
        status: 'Active',
        bio: 'Koordinator Siskamling & Ketertiban Blok A-C.'
      },
      {
        nik: '3201010606930006',
        name: 'Rina Kartika',
        rtrw: '003/005',
        password: 'user123',
        role: 'citizen',
        title: 'Bendahara Kas Warga',
        status: 'Active',
        bio: 'Pengelola Kas RT & Transparansi Iuran Kebersihan.'
      },
      {
        nik: '3201010404980004',
        name: 'Dewi Lestari',
        rtrw: '003/005',
        password: 'user123',
        role: 'citizen',
        title: 'Warga Baru Blok D',
        status: 'Pending',
        bio: 'Warga pindahan baru Blok D No. 14.'
      },
      {
        nik: '9999999999999999',
        name: 'Akun Fiktif Spammer',
        rtrw: '999/999',
        password: 'fake',
        role: 'citizen',
        title: 'Tidak Terverifikasi',
        status: 'Fictional',
        bio: 'Data terindikasi fiktif / duplikat.'
      }
    ],
    messages: [
      {
        id: 'msg_init_1',
        channel: 'group-rt',
        topic: 'Kerja Bakti Minggu',
        senderNik: '3201010202920002',
        senderName: 'Siti Nurhaliza',
        senderRole: 'citizen',
        text: 'Selamat pagi bapak/ibu warga RT 003, jangan lupa kerja bakti hari Minggu jam 07.00 pagi ya. Konsumsi teh hangat & gorengan disiapkan ibu-ibu PKK.',
        time: '07:30',
        pinned: true,
        replyTo: null,
        reactions: { '👍': ['3201010101900001', '3201010303950003'], '❤️': ['3201010606930006'] }
      },
      {
        id: 'msg_init_2',
        channel: 'group-rt',
        topic: 'Kerja Bakti Minggu',
        senderNik: '3201010303950003',
        senderName: 'Budi Santoso',
        senderRole: 'citizen',
        text: 'Pagi Bu Siti. Siap, peralatan kebersihan, cangkul, dan kantong sampah sudah dipersiapkan di pos ronda.',
        time: '07:45',
        pinned: false,
        replyTo: {
          id: 'msg_init_1',
          senderName: 'Siti Nurhaliza',
          text: 'Selamat pagi bapak/ibu warga RT 003, jangan lupa kerja bakti hari Minggu...'
        },
        reactions: { '🔥': ['3201010202920002'] }
      },
      {
        id: 'msg_init_3',
        channel: 'group-rt',
        topic: 'Pengumuman RT',
        senderNik: '3201010101900001',
        senderName: 'Bambang Pamungkas',
        senderRole: 'admin',
        text: 'Terima kasih warga sekalian. Fokus utama kita Minggu ini pembersihan saluran drainase Blok A sampai Blok D menjelang musim hujan.',
        time: '08:00',
        pinned: true,
        replyTo: null,
        reactions: { '✅': ['3201010202920002', '3201010303950003', '3201010606930006'] }
      }
    ],
    posts: [
      {
        id: 'post_1',
        authorNik: '3201010101900001',
        authorName: 'Bambang Pamungkas',
        authorTitle: 'Ketua RT 003',
        authorRole: 'admin',
        category: 'Pengumuman Resmi',
        title: 'Transparansi Kas RT & Rencana Perbaikan Lampu Jalan Lingkungan',
        content: 'Halo warga RT 003/005! Buku Kas RT kini dapat dipantau secara real-time di menu Kas RT. Minggu depan kita akan melakukan penggantian 6 titik lampu jalan LED hemat energi di sepanjang gang Blok B dan C.',
        createdAt: 'Hari ini, 08:10',
        pinned: true,
        likes: ['3201010202920002', '3201010303950003', '3201010606930006'],
        poll: {
          question: 'Prioritas peningkatan fasilitas RT bulan depan?',
          options: [
            { id: 'opt_1', text: 'Penambahan CCTV Sudut Gang Blok C', votes: ['3201010101900001', '3201010303950003'] },
            { id: 'opt_2', text: 'Peremajaan Taman Bermain & Posyandu', votes: ['3201010202920002', '3201010606930006'] },
            { id: 'opt_3', text: 'Pengadaan Gerobak Sampah Terpilah', votes: [] }
          ]
        },
        comments: [
          {
            id: 'cmt_1',
            authorNik: '3201010606930006',
            authorName: 'Rina Kartika',
            text: 'Seluruh mutasi pemasukan dan pengeluaran sudah tercatat otomatis di menu Kas RT.',
            time: '08:22'
          }
        ]
      }
    ],
    kasTransactions: [
      {
        id: 'tx_1',
        date: '2026-10-01',
        type: 'IN',
        category: 'Saldo Awal',
        description: 'Saldo Kas RT 003 Bulan Sebelumnya',
        amount: 8200000,
        actorName: 'Rina Kartika'
      },
      {
        id: 'tx_2',
        date: '2026-10-05',
        type: 'IN',
        category: 'Iuran Wajib',
        description: 'Kolektif Iuran Kebersihan & Keamanan Warga Tahap 1',
        amount: 950000,
        actorName: 'Rina Kartika'
      },
      {
        id: 'tx_3',
        date: '2026-10-10',
        type: 'OUT',
        category: 'Infrastruktur',
        description: 'Pembelian 6 Lampu Jalan LED 30W & Kabel Gang Blok B-C',
        amount: 520000,
        actorName: 'Bambang Pamungkas'
      },
      {
        id: 'tx_4',
        date: '2026-10-14',
        type: 'OUT',
        category: 'Sosial/PKK',
        description: 'Konsumsi Kerja Bakti & Vitamin Posyandu Lansia',
        amount: 180000,
        actorName: 'Siti Nurhaliza'
      }
    ],
    citizenDues: [
      { nik: '3201010101900001', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-02' },
      { nik: '3201010202920002', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-03' },
      { nik: '3201010303950003', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-04' },
      { nik: '3201010606930006', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-02' },
      { nik: '3201010404980004', month: 'Oktober 2026', amount: 50000, status: 'UNPAID', updatedAt: '-' }
    ],
    auditLogs: [
      {
        id: 'log_1',
        time: '08:00',
        actor: 'Bambang Pamungkas',
        action: 'Inisialisasi database SQLite WAL & buku kas transparan RT 003'
      }
    ],
    onlineNiks: ['3201010101900001', '3201010202920002', '3201010303950003']
  };
}

const state = {
  serverOnline: false,
  store: getDefaultSeedStore(),
  currentUser: null,
  activeStage: 'chat', // 'chat' | 'feed' | 'finance' | 'directory' | 'admin'
  activeChat: {
    id: 'group-rt',
    name: 'Forum Warga RT 003',
    isGroup: true,
    badge: 'Utama',
    subtitle: 'Saluran Utama Diskusi & Koordinasi Warga RT 003 / RW 005'
  },
  replyingTo: null,
  feedCategory: 'ALL',
  financeFilter: 'ALL'
};

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('rtku_v03_bus') : null;
let sseConnection = null;

function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatRupiah(num) {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}

function getCurrentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

// ============================================================================
// HYBRID DATA LAYER (SQLITE SERVER + LOCAL FALLBACK)
// ============================================================================
function saveLocalStore() {
  localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(state.store));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'SYNC_STORE', store: state.store });
  }
}

function loadLocalStore(forceReset = false) {
  if (!forceReset) {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE);
    if (raw) {
      try {
        state.store = { ...getDefaultSeedStore(), ...JSON.parse(raw) };
        return;
      } catch {
        // Fallback to seed
      }
    }
  }
  state.store = getDefaultSeedStore();
  saveLocalStore();
}

async function initDataLayer() {
  loadLocalStore(false);
  try {
    const res = await fetch('/api/bootstrap', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      state.serverOnline = true;
      state.store = { ...state.store, ...data };
      saveLocalStore();
      connectSSE();
    }
  } catch {
    state.serverOnline = false;
  }
  updateEngineBadge();
}

function connectSSE() {
  if (sseConnection) sseConnection.close();
  const nikParam = state.currentUser ? `?nik=${encodeURIComponent(state.currentUser.nik)}` : '';
  sseConnection = new EventSource(`/api/events${nikParam}`);

  sseConnection.addEventListener('message:new', (e) => {
    const msg = JSON.parse(e.data);
    if (!state.store.messages.some((m) => m.id === msg.id)) {
      state.store.messages.push(msg);
      renderChatMessages();
      renderContextDrawer();
    }
  });

  sseConnection.addEventListener('message:update', (e) => {
    const updated = JSON.parse(e.data);
    const idx = state.store.messages.findIndex((m) => m.id === updated.id);
    if (idx !== -1) {
      state.store.messages[idx] = updated;
      renderChatMessages();
      renderContextDrawer();
    }
  });

  sseConnection.addEventListener('posts:update', (e) => {
    const { posts } = JSON.parse(e.data);
    state.store.posts = posts;
    renderFeedPosts();
  });

  sseConnection.addEventListener('finance:update', (e) => {
    const { kasTransactions, citizenDues, auditLogs } = JSON.parse(e.data);
    if (kasTransactions) state.store.kasTransactions = kasTransactions;
    if (citizenDues) state.store.citizenDues = citizenDues;
    if (auditLogs) state.store.auditLogs = auditLogs;
    renderFinanceView();
    renderContextDrawer();
    renderAdminView();
  });

  sseConnection.addEventListener('users:update', (e) => {
    const { users, auditLogs, citizenDues } = JSON.parse(e.data);
    state.store.users = users;
    if (auditLogs) state.store.auditLogs = auditLogs;
    if (citizenDues) state.store.citizenDues = citizenDues;
    renderSidebarLists();
    renderDirectory();
    renderFinanceView();
    renderAdminView();
  });

  sseConnection.addEventListener('presence:update', (e) => {
    const { onlineNiks } = JSON.parse(e.data);
    state.store.onlineNiks = onlineNiks;
    renderSidebarLists();
  });

  sseConnection.addEventListener('bootstrap:reset', (e) => {
    const data = JSON.parse(e.data);
    state.store = { ...state.store, ...data };
    refreshAllViews();
  });
}

function updateEngineBadge() {
  const badge = document.getElementById('engine-status-badge');
  if (!badge) return;
  if (state.serverOnline) {
    badge.textContent = '⚡ SQLite-WAL + SSE Aktif';
    badge.style.color = 'var(--success)';
  } else {
    badge.textContent = '💾 Mode Lokal (BroadcastSync)';
    badge.style.color = 'var(--primary)';
  }
}

if (broadcastChannel) {
  broadcastChannel.onmessage = (e) => {
    if (e.data && e.data.type === 'SYNC_STORE' && !state.serverOnline) {
      state.store = e.data.store;
      refreshAllViews();
    }
  };
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

document.getElementById('btn-theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEYS.THEME, next);
});

// ============================================================================
// AUTHENTICATION & SESSION
// ============================================================================
const authView = document.getElementById('auth-view');
const mainView = document.getElementById('main-view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginAlert = document.getElementById('login-alert');
const registerAlert = document.getElementById('register-alert');
const tabLoginBtn = document.getElementById('tab-login-btn');
const tabRegisterBtn = document.getElementById('tab-register-btn');

function showAlert(el, msg, type = 'danger') {
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.classList.remove('hidden');
}

function hideAlerts() {
  loginAlert.classList.add('hidden');
  registerAlert.classList.add('hidden');
}

tabLoginBtn.addEventListener('click', () => {
  tabLoginBtn.classList.add('active');
  tabRegisterBtn.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  hideAlerts();
});

tabRegisterBtn.addEventListener('click', () => {
  tabRegisterBtn.classList.add('active');
  tabLoginBtn.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
  hideAlerts();
});

document.getElementById('quick-fill-admin').addEventListener('click', () => {
  tabLoginBtn.click();
  document.getElementById('login-nik').value = '3201010101900001';
  document.getElementById('login-password').value = 'admin';
});

document.getElementById('quick-fill-citizen').addEventListener('click', () => {
  tabLoginBtn.click();
  document.getElementById('login-nik').value = '3201010202920002';
  document.getElementById('login-password').value = 'user123';
});

document.getElementById('quick-fill-security').addEventListener('click', () => {
  tabLoginBtn.click();
  document.getElementById('login-nik').value = '3201010606930006';
  document.getElementById('login-password').value = 'user123';
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();

  const nik = document.getElementById('login-nik').value.trim();
  const password = document.getElementById('login-password').value;

  if (state.serverOnline) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(loginAlert, data.error || 'Gagal masuk.');
        return;
      }
      setSession(data.user);
      loginForm.reset();
      enterWorkspace();
      return;
    } catch {
      // Fallback local
    }
  }

  const found = state.store.users.find((u) => u.nik === nik);
  if (!found) {
    showAlert(loginAlert, 'NIK tidak terdaftar dalam sistem RT-Ku.');
    return;
  }
  if (found.password && found.password !== password) {
    showAlert(loginAlert, 'Kata sandi yang Anda masukkan salah.');
    return;
  }
  if (found.status === 'Fictional') {
    showAlert(loginAlert, 'Akses ditolak: Data kependudukan Anda ditandai sebagai FIKTIF oleh Pengurus RT.');
    return;
  }

  setSession(found);
  loginForm.reset();
  enterWorkspace();
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlerts();

  const nik = document.getElementById('reg-nik').value.trim();
  const name = document.getElementById('reg-name').value.trim();
  const rtrw = document.getElementById('reg-rtrw').value.trim();
  const title = document.getElementById('reg-title').value.trim() || 'Warga RT';
  const password = document.getElementById('reg-password').value;

  if (!/^\d{16}$/.test(nik)) {
    showAlert(registerAlert, 'NIK harus terdiri dari tepat 16 digit angka.');
    return;
  }

  if (state.serverOnline) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, name, rtrw, title, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(registerAlert, data.error || 'Pendaftaran gagal.');
        return;
      }
      registerForm.reset();
      tabLoginBtn.click();
      showAlert(loginAlert, `Warga "${name}" berhasil terdaftar! Silakan masuk.`, 'success');
      document.getElementById('login-nik').value = nik;
      return;
    } catch {
      // Fallback local
    }
  }

  if (state.store.users.some((u) => u.nik === nik)) {
    showAlert(registerAlert, 'NIK ini sudah terdaftar sebelumnya.');
    return;
  }

  const newUser = {
    nik,
    name,
    rtrw,
    password,
    role: 'citizen',
    title,
    status: 'Active',
    bio: `Warga RT ${rtrw} • ${title}`
  };

  state.store.users.push(newUser);
  state.store.citizenDues.push({
    nik,
    month: 'Oktober 2026',
    amount: 50000,
    status: 'UNPAID',
    updatedAt: '-'
  });
  state.store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    time: getCurrentTime(),
    actor: name,
    action: `Registrasi mandiri warga baru (NIK: ${nik})`
  });
  saveLocalStore();

  registerForm.reset();
  tabLoginBtn.click();
  showAlert(loginAlert, `Pendaftaran warga (${name}) berhasil! Silakan masuk.`, 'success');
  document.getElementById('login-nik').value = nik;
});

function setSession(user) {
  state.currentUser = user;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

document.getElementById('btn-logout').addEventListener('click', () => {
  setSession(null);
  mainView.classList.add('hidden');
  authView.classList.remove('hidden');
});

function enterWorkspace() {
  authView.classList.add('hidden');
  mainView.classList.remove('hidden');
  if (state.serverOnline) connectSSE();
  switchStage('chat');
  refreshAllViews();
}

// ============================================================================
// NAVIGATION RAIL & STAGE SWITCHER
// ============================================================================
const railButtons = document.querySelectorAll('.rail-btn[data-nav]');
const stages = {
  chat: document.getElementById('stage-chat'),
  feed: document.getElementById('stage-feed'),
  finance: document.getElementById('stage-finance'),
  directory: document.getElementById('stage-directory'),
  admin: document.getElementById('stage-admin')
};

railButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-nav');
    switchStage(target);
  });
});

function switchStage(stageName) {
  if (stageName === 'admin' && (!state.currentUser || state.currentUser.role !== 'admin')) {
    alert('Akses Ditolak: Hanya Pengurus / Admin RT yang dapat membuka konsol tata kelola.');
    return;
  }
  state.activeStage = stageName;

  railButtons.forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-nav') === stageName);
  });

  Object.entries(stages).forEach(([key, el]) => {
    if (el) el.classList.toggle('hidden', key !== stageName);
  });

  if (stageName === 'chat') {
    renderChatMessages();
    renderContextDrawer();
  } else if (stageName === 'feed') {
    renderFeedPosts();
  } else if (stageName === 'finance') {
    renderFinanceView();
  } else if (stageName === 'directory') {
    renderDirectory();
  } else if (stageName === 'admin') {
    renderAdminView();
  }
}

function refreshAllViews() {
  if (!state.currentUser) return;

  document.getElementById('sidebar-name').textContent = state.currentUser.name;
  document.getElementById('sidebar-nik').textContent = `NIK: ${state.currentUser.nik}`;
  document.getElementById('sidebar-avatar').textContent = state.currentUser.name.charAt(0).toUpperCase();

  const roleEl = document.getElementById('sidebar-role');
  roleEl.textContent = state.currentUser.role === 'admin' ? 'Ketua / Admin RT' : (state.currentUser.title || 'Warga RT');
  roleEl.classList.toggle('admin', state.currentUser.role === 'admin');

  const railAdminBtn = document.getElementById('rail-admin-btn');
  railAdminBtn.classList.toggle('hidden', state.currentUser.role !== 'admin');

  updateEngineBadge();
  renderSidebarLists(document.getElementById('contact-search').value);
  renderChatHeader();
  renderChatMessages();
  renderContextDrawer();
  renderFeedPosts();
  renderFinanceView();
  renderDirectory();
  if (state.currentUser.role === 'admin') {
    renderAdminView();
  }
}

// ============================================================================
// SIDEBAR: CHANNELS & ACTIVE CITIZENS
// ============================================================================
function renderSidebarLists(query = '') {
  const q = String(query || '').toLowerCase().trim();
  const channelsList = document.getElementById('channels-list');
  const contactsList = document.getElementById('contacts-list');
  channelsList.innerHTML = '';
  contactsList.innerHTML = '';

  state.store.channels
    .filter((ch) => !q || ch.title.toLowerCase().includes(q) || ch.name.toLowerCase().includes(q))
    .forEach((ch) => {
      const div = document.createElement('div');
      div.className = `contact-item ${state.activeChat.id === ch.id ? 'active' : ''}`;
      div.innerHTML = `
        <div class="contact-avatar channel-hash">#</div>
        <div class="contact-details">
          <div class="contact-title">${sanitizeHTML(ch.title)}</div>
          <div class="contact-sub">${sanitizeHTML(ch.badge)} • Publik</div>
        </div>
      `;
      div.addEventListener('click', () => {
        state.activeChat = {
          id: ch.id,
          name: ch.title,
          isGroup: true,
          badge: ch.badge,
          subtitle: ch.topic
        };
        switchStage('chat');
        renderSidebarLists(q);
        renderChatHeader();
        renderChatMessages();
        renderContextDrawer();
        document.getElementById('app-sidebar').classList.remove('open');
      });
      channelsList.appendChild(div);
    });

  const activeCitizens = state.store.users.filter(
    (u) => u.status === 'Active' && u.nik !== state.currentUser.nik &&
      (!q || u.name.toLowerCase().includes(q) || u.nik.includes(q))
  );

  activeCitizens.forEach((citizen) => {
    const isOnline = (state.store.onlineNiks || []).includes(citizen.nik);
    const div = document.createElement('div');
    div.className = `contact-item ${state.activeChat.id === citizen.nik ? 'active' : ''}`;
    div.innerHTML = `
      <div class="contact-avatar">
        ${sanitizeHTML(citizen.name.charAt(0).toUpperCase())}
        ${isOnline ? '<span class="online-dot" title="Online"></span>' : ''}
      </div>
      <div class="contact-details">
        <div class="contact-title">${sanitizeHTML(citizen.name)}</div>
        <div class="contact-sub">${sanitizeHTML(citizen.title || `RT ${citizen.rtrw}`)}</div>
      </div>
    `;
    div.addEventListener('click', () => openDirectMessage(citizen));
    contactsList.appendChild(div);
  });
}

function openDirectMessage(citizen) {
  state.activeChat = {
    id: citizen.nik,
    name: citizen.name,
    isGroup: false,
    badge: citizen.role === 'admin' ? 'Pengurus RT' : 'Warga Aktif',
    subtitle: `${citizen.title || 'Warga'} • NIK: ${citizen.nik} (RT ${citizen.rtrw})`
  };
  switchStage('chat');
  renderSidebarLists(document.getElementById('contact-search').value);
  renderChatHeader();
  renderChatMessages();
  renderContextDrawer();
  document.getElementById('app-sidebar').classList.remove('open');
}

document.getElementById('contact-search').addEventListener('input', (e) => {
  renderSidebarLists(e.target.value);
});

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    document.getElementById('contact-search').focus();
  }
  if (e.key === 'Escape' && state.replyingTo) {
    clearReplyTarget();
  }
});

// ============================================================================
// REAL-TIME CHAT STREAM
// ============================================================================
function renderChatHeader() {
  document.getElementById('chat-current-title').textContent = state.activeChat.name;
  document.getElementById('chat-current-badge').textContent = state.activeChat.badge || 'Saluran';
  document.getElementById('chat-current-subtitle').textContent = state.activeChat.subtitle;
  const avatar = document.getElementById('chat-current-avatar');
  avatar.textContent = state.activeChat.isGroup ? '#' : state.activeChat.name.charAt(0).toUpperCase();
}

function getActiveConversationMessages() {
  const filterText = (document.getElementById('chat-message-filter').value || '').toLowerCase().trim();
  return state.store.messages.filter((m) => {
    const inConvo = state.activeChat.isGroup
      ? m.channel === state.activeChat.id
      : (m.senderNik === state.currentUser.nik && m.channel === state.activeChat.id) ||
        (m.senderNik === state.activeChat.id && (m.channel === state.currentUser.nik || m.recipientNik === state.currentUser.nik));

    if (!inConvo) return false;
    if (!filterText) return true;
    return (
      m.text.toLowerCase().includes(filterText) ||
      (m.senderName || '').toLowerCase().includes(filterText) ||
      (m.topic || '').toLowerCase().includes(filterText)
    );
  });
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  container.innerHTML = '';

  const messages = getActiveConversationMessages();
  const pinnedMsgs = messages.filter((m) => m.pinned);
  const pinnedBanner = document.getElementById('pinned-banner');
  if (pinnedMsgs.length > 0) {
    const latestPin = pinnedMsgs[pinnedMsgs.length - 1];
    document.getElementById('pinned-banner-text').innerHTML =
      `<strong>${sanitizeHTML(latestPin.senderName)}:</strong> ${sanitizeHTML(latestPin.text)}`;
    pinnedBanner.classList.remove('hidden');
  } else {
    pinnedBanner.classList.add('hidden');
  }

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="margin:auto;text-align:center;color:var(--text-muted);padding:2rem;">
        <p>Belum ada pesan pada saluran ini. Mulailah diskusi pertama Anda!</p>
      </div>
    `;
    return;
  }

  messages.forEach((msg) => {
    const isMe = msg.senderNik === state.currentUser.nik;
    const wrapper = document.createElement('div');
    wrapper.className = `chat-bubble-wrapper ${isMe ? 'sent' : 'received'}`;

    const topicBadge = msg.topic ? `<span class="chat-topic-tag"># ${sanitizeHTML(msg.topic)}</span>` : '';
    const pinBadge = msg.pinned ? `<span class="chat-topic-tag" style="background:var(--warning-light);color:var(--warning-dark);">📌 Disematkan</span>` : '';

    const replyHtml = msg.replyTo
      ? `<div class="reply-quote-box"><strong>↩ ${sanitizeHTML(msg.replyTo.senderName)}:</strong> ${sanitizeHTML(msg.replyTo.text)}</div>`
      : '';

    const reactionsObj = msg.reactions || {};
    const reactionButtons = REACTION_EMOJIS.map((emoji) => {
      const voters = reactionsObj[emoji] || [];
      const count = voters.length;
      const isVoted = voters.includes(state.currentUser.nik);
      if (count === 0) return '';
      return `<button type="button" class="reaction-chip ${isVoted ? 'active' : ''}" onclick="toggleReaction('${msg.id}', '${emoji}')">${emoji} ${count}</button>`;
    }).join('');

    wrapper.innerHTML = `
      <div class="chat-meta-top">
        ${!isMe ? `<span class="chat-sender-name">${sanitizeHTML(msg.senderName)}</span>` : ''}
        ${topicBadge}
        ${pinBadge}
      </div>
      <div class="chat-bubble">
        ${replyHtml}
        <div>${sanitizeHTML(msg.text)}</div>
        <div class="chat-bubble-footer">
          <span class="chat-bubble-time">${sanitizeHTML(msg.time)}</span>
          <div class="bubble-Utility-btns">
            <button type="button" class="bubble-action-btn" title="Beri Reaksi 👍" onclick="toggleReaction('${msg.id}', '👍')">👍</button>
            <button type="button" class="bubble-action-btn" title="Beri Reaksi ❤️" onclick="toggleReaction('${msg.id}', '❤️')">❤️</button>
            <button type="button" class="bubble-action-btn" title="Balas Pesan" onclick="setReplyTarget('${msg.id}')">↩ Balas</button>
            <button type="button" class="bubble-action-btn" title="Sematkan Pesan" onclick="togglePinMessage('${msg.id}')">📌</button>
          </div>
        </div>
      </div>
      ${reactionButtons ? `<div class="reactions-row">${reactionButtons}</div>` : ''}
    `;

    container.appendChild(wrapper);
  });

  container.scrollTop = container.scrollHeight;
}

document.getElementById('chat-message-filter').addEventListener('input', renderChatMessages);

window.setReplyTarget = function (msgId) {
  const msg = state.store.messages.find((m) => m.id === msgId);
  if (!msg) return;
  state.replyingTo = {
    id: msg.id,
    senderName: msg.senderName,
    text: msg.text.slice(0, 70)
  };
  document.getElementById('reply-target-name').textContent = state.replyingTo.senderName;
  document.getElementById('reply-target-text').textContent = state.replyingTo.text;
  document.getElementById('reply-preview-bar').classList.remove('hidden');
  document.getElementById('chat-input-text').focus();
};

function clearReplyTarget() {
  state.replyingTo = null;
  document.getElementById('reply-preview-bar').classList.add('hidden');
}

document.getElementById('btn-cancel-reply').addEventListener('click', clearReplyTarget);

window.toggleReaction = async function (messageId, emoji) {
  if (state.serverOnline) {
    try {
      await fetch('/api/messages/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, nik: state.currentUser.nik })
      });
      return;
    } catch {
      // Fallback local
    }
  }
  const msg = state.store.messages.find((m) => m.id === messageId);
  if (!msg) return;
  if (!msg.reactions) msg.reactions = {};
  if (!msg.reactions[emoji]) msg.reactions[emoji] = [];
  const idx = msg.reactions[emoji].indexOf(state.currentUser.nik);
  if (idx === -1) msg.reactions[emoji].push(state.currentUser.nik);
  else msg.reactions[emoji].splice(idx, 1);
  saveLocalStore();
  renderChatMessages();
};

window.togglePinMessage = async function (messageId) {
  if (state.serverOnline) {
    try {
      await fetch('/api/messages/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      return;
    } catch {
      // Fallback local
    }
  }
  const msg = state.store.messages.find((m) => m.id === messageId);
  if (!msg) return;
  msg.pinned = !msg.pinned;
  saveLocalStore();
  renderChatMessages();
  renderContextDrawer();
};

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const textInput = document.getElementById('chat-input-text');
  const topicInput = document.getElementById('chat-input-topic');
  const text = textInput.value.trim();
  const topic = topicInput.value.trim() || (state.activeChat.isGroup ? 'Diskusi Warga' : 'Pesan Langsung');
  if (!text) return;

  const payload = {
    channel: state.activeChat.id,
    recipientNik: state.activeChat.isGroup ? null : state.activeChat.id,
    topic,
    senderNik: state.currentUser.nik,
    senderName: state.currentUser.name,
    senderRole: state.currentUser.role,
    text,
    replyTo: state.replyingTo
  };

  textInput.value = '';
  clearReplyTarget();

  if (state.serverOnline) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return;
    } catch {
      // Fallback local
    }
  }

  const localMsg = {
    ...payload,
    id: `msg_${Date.now()}`,
    time: getCurrentTime(),
    pinned: false,
    reactions: {}
  };
  state.store.messages.push(localMsg);
  saveLocalStore();
  renderChatMessages();
  simulateNeighborReply(localMsg);
});

function simulateNeighborReply(sentMsg) {
  const activeCitizens = state.store.users.filter(
    (u) => u.status === 'Active' && u.nik !== state.currentUser.nik
  );
  if (activeCitizens.length === 0) return;

  setTimeout(() => {
    const responder = state.activeChat.isGroup
      ? activeCitizens[Math.floor(Math.random() * activeCitizens.length)]
      : activeCitizens.find((u) => u.nik === state.activeChat.id);
    if (!responder) return;

    const replies = [
      'Baik, terima kasih informasinya. Segera kami koordinasikan bersama warga.',
      'Siap! Sudah tercatat di agenda lingkungan RT 003.',
      'Setuju, mari kita dukung bersama demi kenyamanan warga RT kita.',
      'Terima kasih laporannya, pengurus dan tim keamanan siap menindaklanjuti.'
    ];

    const replyMsg = {
      id: `msg_sim_${Date.now()}`,
      channel: state.activeChat.isGroup ? state.activeChat.id : state.currentUser.nik,
      recipientNik: state.activeChat.isGroup ? null : state.currentUser.nik,
      topic: sentMsg.topic || 'Tanggapan Warga',
      senderNik: responder.nik,
      senderName: responder.name,
      senderRole: responder.role,
      text: replies[Math.floor(Math.random() * replies.length)],
      time: getCurrentTime(),
      pinned: false,
      replyTo: {
        id: sentMsg.id,
        senderName: sentMsg.senderName,
        text: sentMsg.text.slice(0, 60)
      },
      reactions: {}
    };

    state.store.messages.push(replyMsg);
    saveLocalStore();
    if (state.activeStage === 'chat') {
      renderChatMessages();
    }
  }, 1100);
}

// ============================================================================
// CONTEXTUAL RIGHT DRAWER
// ============================================================================
function calculateKasSummary() {
  const txs = state.store.kasTransactions || [];
  let totalIn = 0;
  let totalOut = 0;
  txs.forEach((tx) => {
    if (tx.type === 'IN') totalIn += Number(tx.amount || 0);
    else totalOut += Number(tx.amount || 0);
  });
  return { totalIn, totalOut, balance: totalIn - totalOut };
}

function renderContextDrawer() {
  document.getElementById('drawer-channel-desc').textContent = state.activeChat.subtitle;
  const pinnedContainer = document.getElementById('drawer-pinned-list');
  pinnedContainer.innerHTML = '';

  const { balance } = calculateKasSummary();
  const drawerBalanceEl = document.getElementById('drawer-kas-balance');
  if (drawerBalanceEl) drawerBalanceEl.textContent = formatRupiah(balance);

  const pinned = getActiveConversationMessages().filter((m) => m.pinned);
  if (pinned.length === 0) {
    pinnedContainer.innerHTML = `<div style="font-size:0.75rem;color:var(--text-muted);">Belum ada pesan yang disematkan. Klik ikon 📌 pada pesan penting.</div>`;
    return;
  }

  pinned.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'pinned-card';
    card.innerHTML = `<strong>${sanitizeHTML(m.senderName)} (${sanitizeHTML(m.time)}):</strong><br>${sanitizeHTML(m.text)}`;
    pinnedContainer.appendChild(card);
  });
}

document.getElementById('btn-toggle-drawer').addEventListener('click', () => {
  document.getElementById('context-drawer').classList.toggle('hidden');
});

// ============================================================================
// STAGE B: META WORKPLACE / COMMUNITY FEED & POLLS
// ============================================================================
document.getElementById('btn-toggle-poll').addEventListener('click', () => {
  document.getElementById('poll-builder').classList.toggle('hidden');
});

document.querySelectorAll('#feed-category-filters .pill-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#feed-category-filters .pill-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.feedCategory = btn.getAttribute('data-cat');
    renderFeedPosts();
  });
});

document.getElementById('feed-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('post-title').value.trim();
  const category = document.getElementById('post-category').value;
  const content = document.getElementById('post-content').value.trim();
  const pollQuestion = document.getElementById('poll-question').value.trim();
  const pollOptionsRaw = document.getElementById('poll-options').value.trim();
  const pollOptions = pollOptionsRaw ? pollOptionsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];

  if (!title || !content) return;

  const payload = {
    authorNik: state.currentUser.nik,
    authorName: state.currentUser.name,
    authorTitle: state.currentUser.title || 'Warga RT',
    authorRole: state.currentUser.role,
    category,
    title,
    content,
    pollQuestion,
    pollOptions
  };

  e.target.reset();
  document.getElementById('poll-builder').classList.add('hidden');

  if (state.serverOnline) {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return;
    } catch {
      // Fallback local
    }
  }

  let poll = null;
  if (pollQuestion && pollOptions.length >= 2) {
    poll = {
      question: pollQuestion,
      options: pollOptions.map((opt, i) => ({ id: `opt_${Date.now()}_${i}`, text: opt, votes: [] }))
    };
  }

  state.store.posts.unshift({
    id: `post_${Date.now()}`,
    ...payload,
    createdAt: `Hari ini, ${getCurrentTime()}`,
    pinned: state.currentUser.role === 'admin',
    likes: [],
    poll,
    comments: []
  });
  saveLocalStore();
  renderFeedPosts();
});

function renderFeedPosts() {
  const container = document.getElementById('feed-posts-container');
  if (!container) return;
  container.innerHTML = '';

  const filtered = (state.store.posts || []).filter(
    (p) => state.feedCategory === 'ALL' || p.category === state.feedCategory
  );

  filtered.forEach((post) => {
    const isLiked = (post.likes || []).includes(state.currentUser.nik);
    const card = document.createElement('article');
    card.className = 'feed-post-card';

    let pollHtml = '';
    if (post.poll) {
      const totalVotes = post.poll.options.reduce((acc, o) => acc + o.votes.length, 0);
      const optsHtml = post.poll.options.map((opt) => {
        const count = opt.votes.length;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const voted = opt.votes.includes(state.currentUser.nik);
        return `
          <button type="button" class="poll-option-btn ${voted ? 'voted' : ''}" onclick="interactPost('${post.id}', 'vote', '${opt.id}')">
            <span>${voted ? '✅ ' : ''}${sanitizeHTML(opt.text)}</span>
            <span>${pct}% (${count} suara)</span>
          </button>
        `;
      }).join('');

      pollHtml = `
        <div class="poll-box">
          <div class="poll-question-title">📊 Musyawarah Polling: ${sanitizeHTML(post.poll.question)}</div>
          ${optsHtml}
          <small style="color:var(--text-muted);font-size:0.72rem;">Total partisipasi: ${totalVotes} warga</small>
        </div>
      `;
    }

    const commentsHtml = (post.comments || []).map((c) => `
      <div class="comment-item">
        <strong>${sanitizeHTML(c.authorName)}</strong> <span style="color:var(--text-muted);font-size:0.7rem;">(${sanitizeHTML(c.time)})</span>:
        ${sanitizeHTML(c.text)}
      </div>
    `).join('');

    card.innerHTML = `
      <div class="post-header">
        <div class="post-author-box">
          <div class="user-avatar">${sanitizeHTML(post.authorName.charAt(0).toUpperCase())}</div>
          <div>
            <div style="font-weight:700;font-size:0.88rem;">${sanitizeHTML(post.authorName)}</div>
            <div style="font-size:0.72rem;color:var(--text-secondary);">${sanitizeHTML(post.authorTitle)} • ${sanitizeHTML(post.createdAt)}</div>
          </div>
        </div>
        <span class="post-category-badge">${sanitizeHTML(post.category)}</span>
      </div>
      <h3 class="post-title">${sanitizeHTML(post.title)}</h3>
      <p class="post-body">${sanitizeHTML(post.content)}</p>
      ${pollHtml}
      <div class="post-footer-bar">
        <button type="button" class="btn btn-secondary btn-sm" onclick="interactPost('${post.id}', 'like')">
          ${isLiked ? '❤️ Disukai' : '🤍 Suka'} (${(post.likes || []).length})
        </button>
        <span style="font-size:0.78rem;color:var(--text-secondary);align-self:center;">
          💬 ${(post.comments || []).length} Tanggapan Warga
        </span>
      </div>
      <div class="comments-section">
        ${commentsHtml}
        <form class="comment-form" onsubmit="submitPostComment(event, '${post.id}')">
          <input type="text" placeholder="Tulis tanggapan musyawarah..." required>
          <button type="submit" class="btn btn-primary btn-sm">Kirim</button>
        </form>
      </div>
    `;
    container.appendChild(card);
  });
}

window.interactPost = async function (postId, action, optionId = null) {
  if (state.serverOnline) {
    try {
      await fetch('/api/posts/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action,
          nik: state.currentUser.nik,
          authorName: state.currentUser.name,
          optionId
        })
      });
      return;
    } catch {
      // Fallback local
    }
  }

  const post = state.store.posts.find((p) => p.id === postId);
  if (!post) return;
  if (action === 'like') {
    const idx = post.likes.indexOf(state.currentUser.nik);
    if (idx === -1) post.likes.push(state.currentUser.nik);
    else post.likes.splice(idx, 1);
  } else if (action === 'vote' && post.poll && optionId) {
    post.poll.options.forEach((opt) => {
      opt.votes = opt.votes.filter((v) => v !== state.currentUser.nik);
      if (opt.id === optionId) opt.votes.push(state.currentUser.nik);
    });
  }
  saveLocalStore();
  renderFeedPosts();
};

window.submitPostComment = async function (e, postId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  if (state.serverOnline) {
    try {
      await fetch('/api/posts/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action: 'comment',
          nik: state.currentUser.nik,
          authorName: state.currentUser.name,
          text
        })
      });
      return;
    } catch {
      // Fallback local
    }
  }

  const post = state.store.posts.find((p) => p.id === postId);
  if (!post) return;
  post.comments.push({
    id: `cmt_${Date.now()}`,
    authorNik: state.currentUser.nik,
    authorName: state.currentUser.name,
    text,
    time: getCurrentTime()
  });
  saveLocalStore();
  renderFeedPosts();
};

// ============================================================================
// STAGE C: TRANSPARENT KAS & MONTHLY CITIZEN DUES (FOCUS #1)
// ============================================================================
document.querySelectorAll('#finance-type-filters .pill-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#finance-type-filters .pill-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.financeFilter = btn.getAttribute('data-tx');
    renderFinanceView();
  });
});

function canManageFinance() {
  if (!state.currentUser) return false;
  return state.currentUser.role === 'admin' || (state.currentUser.title || '').toLowerCase().includes('bendahara');
}

function renderFinanceView() {
  if (!state.currentUser) return;

  const { totalIn, totalOut, balance } = calculateKasSummary();
  document.getElementById('fin-balance').textContent = formatRupiah(balance);
  document.getElementById('fin-total-in').textContent = formatRupiah(totalIn);
  document.getElementById('fin-total-out').textContent = formatRupiah(totalOut);

  const activeUsers = state.store.users.filter((u) => u.status === 'Active');
  const duesMap = new Map((state.store.citizenDues || []).map((d) => [d.nik, d]));
  const paidCount = activeUsers.filter((u) => {
    const d = duesMap.get(u.nik);
    return d && d.status === 'PAID';
  }).length;
  const duesRate = activeUsers.length > 0 ? Math.round((paidCount / activeUsers.length) * 100) : 0;
  document.getElementById('fin-dues-rate').textContent = `${duesRate}% (${paidCount}/${activeUsers.length})`;

  // Show/hide transaction form for Admin / Bendahara
  const txForm = document.getElementById('finance-tx-form');
  if (txForm) {
    txForm.classList.toggle('hidden', !canManageFinance());
  }

  // Render Ledger Table
  const ledgerBody = document.getElementById('finance-ledger-body');
  ledgerBody.innerHTML = '';
  const filteredTxs = (state.store.kasTransactions || []).filter(
    (tx) => state.financeFilter === 'ALL' || tx.type === state.financeFilter
  );

  filteredTxs.forEach((tx) => {
    const tr = document.createElement('tr');
    const isIn = tx.type === 'IN';
    tr.innerHTML = `
      <td>${sanitizeHTML(tx.date)}</td>
      <td><span class="badge ${isIn ? 'badge-active' : 'badge-pending'}">${sanitizeHTML(tx.category)}</span></td>
      <td>
        <div style="font-weight:600;">${sanitizeHTML(tx.description)}</div>
        <div style="font-size:0.7rem;color:var(--text-secondary);">Dicatat oleh: ${sanitizeHTML(tx.actorName)}</div>
      </td>
      <td style="font-weight:800;color:${isIn ? 'var(--success)' : 'var(--danger)'};">
        ${isIn ? '+' : '-'} ${formatRupiah(tx.amount)}
      </td>
    `;
    ledgerBody.appendChild(tr);
  });

  // Render Citizen Monthly Dues Table
  const duesBody = document.getElementById('finance-dues-body');
  duesBody.innerHTML = '';
  const isManager = canManageFinance();

  activeUsers.forEach((u) => {
    const due = duesMap.get(u.nik) || { status: 'UNPAID', updatedAt: '-' };
    const isPaid = due.status === 'PAID';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div style="font-weight:700;">${sanitizeHTML(u.name)}</div>
        <div style="font-size:0.7rem;color:var(--text-secondary);">RT ${sanitizeHTML(u.rtrw)}</div>
      </td>
      <td>
        <span class="badge ${isPaid ? 'badge-active' : 'badge-fictional'}">
          ${isPaid ? '✅ Lunas' : '⏳ Belum Bayar'}
        </span>
      </td>
      <td style="font-size:0.76rem;color:var(--text-secondary);">${sanitizeHTML(due.updatedAt)}</td>
      <td>
        ${isManager
          ? `<button type="button" class="btn-action ${isPaid ? '' : 'btn-action-activate'}" onclick="toggleCitizenDue('${u.nik}')">
              ${isPaid ? 'Batalkan' : 'Tandai Lunas'}
            </button>`
          : `<span style="font-size:0.72rem;color:var(--text-muted);">Transparan</span>`
        }
      </td>
    `;
    duesBody.appendChild(tr);
  });
}

document.getElementById('finance-tx-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!canManageFinance()) return;

  const type = document.getElementById('tx-type').value;
  const category = document.getElementById('tx-category').value;
  const amount = Math.abs(Number(document.getElementById('tx-amount').value) || 0);
  const description = document.getElementById('tx-desc').value.trim();
  if (!description || amount <= 0) return;

  e.target.reset();

  if (state.serverOnline) {
    try {
      await fetch('/api/finance/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category,
          amount,
          description,
          actorName: state.currentUser.name
        })
      });
      return;
    } catch {
      // Fallback local
    }
  }

  state.store.kasTransactions.unshift({
    id: `tx_${Date.now()}`,
    date: getTodayDate(),
    type,
    category,
    description,
    amount,
    actorName: state.currentUser.name
  });
  state.store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    time: getCurrentTime(),
    actor: state.currentUser.name,
    action: `Mencatat mutasi Kas [${type}] ${formatRupiah(amount)} — ${description}`
  });
  saveLocalStore();
  renderFinanceView();
  renderContextDrawer();
});

window.toggleCitizenDue = async function (nik) {
  if (!canManageFinance()) return;

  if (state.serverOnline) {
    try {
      await fetch('/api/finance/dues-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, actorName: state.currentUser.name })
      });
      return;
    } catch {
      // Fallback local
    }
  }

  const existing = state.store.citizenDues.find((d) => d.nik === nik);
  if (existing) {
    existing.status = existing.status === 'PAID' ? 'UNPAID' : 'PAID';
    existing.updatedAt = existing.status === 'PAID' ? getTodayDate() : '-';
  } else {
    state.store.citizenDues.push({
      nik,
      month: 'Oktober 2026',
      amount: 50000,
      status: 'PAID',
      updatedAt: getTodayDate()
    });
  }
  saveLocalStore();
  renderFinanceView();
};

// ============================================================================
// STAGE D: CITIZEN DIRECTORY
// ============================================================================
function renderDirectory() {
  const container = document.getElementById('directory-cards-container');
  if (!container) return;
  const q = (document.getElementById('directory-search').value || '').toLowerCase().trim();
  container.innerHTML = '';

  const activeUsers = state.store.users.filter(
    (u) => u.status === 'Active' &&
      (!q || u.name.toLowerCase().includes(q) || u.nik.includes(q) || (u.title || '').toLowerCase().includes(q))
  );

  activeUsers.forEach((u) => {
    const card = document.createElement('div');
    card.className = 'citizen-card';
    const isMe = u.nik === state.currentUser.nik;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div class="user-avatar">${sanitizeHTML(u.name.charAt(0).toUpperCase())}</div>
        <div>
          <div style="font-weight:800;font-size:0.92rem;">${sanitizeHTML(u.name)}</div>
          <div style="font-size:0.74rem;color:var(--primary);font-weight:600;">${sanitizeHTML(u.title || 'Warga RT')}</div>
        </div>
      </div>
      <div style="font-size:0.78rem;color:var(--text-secondary);">
        <div><strong>NIK:</strong> ${sanitizeHTML(u.nik)}</div>
        <div><strong>Domisili:</strong> RT ${sanitizeHTML(u.rtrw)}</div>
        <div style="margin-top:0.25rem;">${sanitizeHTML(u.bio || '')}</div>
      </div>
      ${!isMe ? `<button type="button" class="btn btn-secondary btn-sm" onclick="startDmFromDirectory('${u.nik}')">💬 Kirim Pesan Langsung</button>` : '<span class="badge badge-active" style="align-self:flex-start;">Profil Anda</span>'}
    `;
    container.appendChild(card);
  });
}

window.startDmFromDirectory = function (nik) {
  const target = state.store.users.find((u) => u.nik === nik);
  if (target) openDirectMessage(target);
};

document.getElementById('directory-search').addEventListener('input', renderDirectory);

// ============================================================================
// STAGE E: ADMIN GOVERNANCE & CLEAR DATA CONSOLE
// ============================================================================
function renderAdminView() {
  if (!state.currentUser || state.currentUser.role !== 'admin') return;

  const users = state.store.users;
  document.getElementById('stat-total-citizens').textContent = users.length;
  document.getElementById('stat-active-citizens').textContent = users.filter((u) => u.status === 'Active').length;
  document.getElementById('stat-pending-citizens').textContent = users.filter((u) => u.status === 'Pending').length;
  document.getElementById('stat-fictional-citizens').textContent = users.filter((u) => u.status === 'Fictional').length;

  const q = (document.getElementById('admin-search-input').value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('admin-filter-status').value;

  const filtered = users.filter((u) => {
    const matchText = u.name.toLowerCase().includes(q) || u.nik.includes(q);
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchText && matchStatus;
  });

  const tbody = document.getElementById('citizens-table-body');
  tbody.innerHTML = '';

  filtered.forEach((user, idx) => {
    const tr = document.createElement('tr');
    let badgeClass = 'badge-active';
    if (user.status === 'Pending') badgeClass = 'badge-pending';
    if (user.status === 'Fictional') badgeClass = 'badge-fictional';

    const isSelf = user.nik === state.currentUser.nik;
    const actionsHtml = isSelf
      ? '<span style="font-size:0.75rem;color:var(--text-muted);">Akun Admin Aktif</span>'
      : `
        <div class="table-actions">
          ${user.status !== 'Active' ? `<button type="button" class="btn-action btn-action-activate" onclick="adminSetStatus('${user.nik}', 'Active')">Aktifkan</button>` : ''}
          ${user.status !== 'Pending' ? `<button type="button" class="btn-action" onclick="adminSetStatus('${user.nik}', 'Pending')">Pending</button>` : ''}
          ${user.status !== 'Fictional' ? `<button type="button" class="btn-action btn-action-flag" onclick="adminSetStatus('${user.nik}', 'Fictional')">Tandai Fiktif</button>` : ''}
          <button type="button" class="btn-action btn-action-delete" onclick="adminDeleteUser('${user.nik}')">Hapus</button>
        </div>
      `;

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${sanitizeHTML(user.nik)}</strong></td>
      <td>
        <div style="font-weight:700;">${sanitizeHTML(user.name)}</div>
        <div style="font-size:0.72rem;color:var(--text-secondary);">${sanitizeHTML(user.title || 'Warga')}</div>
      </td>
      <td>RT ${sanitizeHTML(user.rtrw)}</td>
      <td>${user.role === 'admin' ? 'Admin RT' : 'Warga'}</td>
      <td><span class="badge ${badgeClass}">${sanitizeHTML(user.status)}</span></td>
      <td>${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  });

  const auditContainer = document.getElementById('admin-audit-list');
  auditContainer.innerHTML = '';
  (state.store.auditLogs || []).slice(0, 8).forEach((log) => {
    const div = document.createElement('div');
    div.className = 'audit-item';
    div.innerHTML = `<strong>[${sanitizeHTML(log.time)}] ${sanitizeHTML(log.actor)}:</strong> ${sanitizeHTML(log.action)}`;
    auditContainer.appendChild(div);
  });
}

window.adminSetStatus = async function (nik, status) {
  if (state.serverOnline) {
    try {
      await fetch('/api/admin/citizen-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, status, actorName: state.currentUser.name })
      });
      return;
    } catch {
      // Fallback local
    }
  }
  const target = state.store.users.find((u) => u.nik === nik);
  if (!target) return;
  target.status = status;
  state.store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    time: getCurrentTime(),
    actor: state.currentUser.name,
    action: `Mengubah status ${target.name} (${target.nik}) menjadi ${status}`
  });
  saveLocalStore();
  renderAdminView();
  renderSidebarLists();
};

window.adminDeleteUser = async function (nik) {
  const target = state.store.users.find((u) => u.nik === nik);
  if (!target || target.nik === state.currentUser.nik) return;
  if (!confirm(`Hapus permanen data "${target.name}" (NIK: ${target.nik})?`)) return;

  if (state.serverOnline) {
    try {
      await fetch(`/api/admin/citizen/${encodeURIComponent(nik)}`, { method: 'DELETE' });
      return;
    } catch {
      // Fallback local
    }
  }

  state.store.users = state.store.users.filter((u) => u.nik !== nik);
  state.store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    time: getCurrentTime(),
    actor: state.currentUser.name,
    action: `Menghapus permanen data ${target.name} (NIK: ${target.nik})`
  });
  saveLocalStore();
  renderAdminView();
  renderSidebarLists();
};

document.getElementById('admin-search-input').addEventListener('input', renderAdminView);
document.getElementById('admin-filter-status').addEventListener('change', renderAdminView);

document.getElementById('btn-admin-reset-data').addEventListener('click', async () => {
  if (!confirm('Reset seluruh data ke kondisi awal?')) return;
  if (state.serverOnline) {
    try {
      await fetch('/api/admin/reset', { method: 'POST' });
      return;
    } catch {
      // Fallback local
    }
  }
  loadLocalStore(true);
  refreshAllViews();
});

document.getElementById('mobile-toggle-sidebar').addEventListener('click', () => {
  document.getElementById('app-sidebar').classList.toggle('open');
});

document.getElementById('mobile-toggle-info').addEventListener('click', () => {
  document.getElementById('context-drawer').classList.toggle('hidden');
});

window.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await initDataLayer();

  const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (savedSession) {
    try {
      state.currentUser = JSON.parse(savedSession);
      enterWorkspace();
      return;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }
});
