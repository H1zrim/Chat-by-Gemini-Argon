/**
 * RT-Ku - Prototype Script (v0.1)
 * Pure Vanilla JavaScript handling Authentication, 2-Column Chat Layout,
 * LocalStorage state persistence, and Admin CRUD Clear Data.
 */

const STORAGE_KEYS = {
  USERS: 'rtku_users',
  SESSION: 'rtku_session',
  MESSAGES: 'rtku_messages',
  ACTIVE_CHAT: 'rtku_active_chat'
};

const INITIAL_USERS = [
  {
    nik: "3201010101900001",
    name: "Bambang Pamungkas",
    rtrw: "003/005",
    password: "admin",
    role: "admin",
    status: "Active"
  },
  {
    nik: "3201010202920002",
    name: "Siti Nurhaliza",
    rtrw: "003/005",
    password: "user123",
    role: "citizen",
    status: "Active"
  },
  {
    nik: "3201010303950003",
    name: "Budi Santoso",
    rtrw: "003/005",
    password: "user123",
    role: "citizen",
    status: "Active"
  },
  {
    nik: "3201010404980004",
    name: "Dewi Lestari",
    rtrw: "003/005",
    password: "user123",
    role: "citizen",
    status: "Pending"
  },
  {
    nik: "9999999999999999",
    name: "Akun Fiktif Spammer",
    rtrw: "999/999",
    password: "fake",
    role: "citizen",
    status: "Fictional"
  }
];

const INITIAL_MESSAGES = [
  {
    id: "msg_init_1",
    channel: "group-rt",
    senderNik: "3201010202920002",
    senderName: "Siti Nurhaliza",
    text: "Selamat pagi bapak/ibu warga RT 003, jangan lupa kerja bakti hari Minggu jam 07.00 pagi ya.",
    time: "07:30"
  },
  {
    id: "msg_init_2",
    channel: "group-rt",
    senderNik: "3201010303950003",
    senderName: "Budi Santoso",
    text: "Pagi Bu Siti. Siap, peralatan kebersihan dan tempat sampah sudah dipersiapkan di pos ronda.",
    time: "07:45"
  },
  {
    id: "msg_init_3",
    channel: "group-rt",
    senderNik: "3201010101900001",
    senderName: "Bambang Pamungkas (Admin)",
    text: "Terima kasih warga sekalian. Mohon partisipasi seluruh kepala keluarga demi kebersihan lingkungan kita.",
    time: "08:00"
  }
];

let currentUser = null;
let currentChatTarget = {
  id: "group-rt",
  name: "Forum Warga RT 003",
  isGroup: true,
  subtitle: "Saluran Publik Warga RT Aktif"
};

function initializeStorage(forceReset = false) {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
}

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getMessages() {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return data ? JSON.parse(data) : [];
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

function getSession() {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  return data ? JSON.parse(data) : null;
}

function setSession(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

const authView = document.getElementById('auth-view');
const mainView = document.getElementById('main-view');
const adminView = document.getElementById('admin-view');

function showView(viewName) {
  authView.classList.add('hidden');
  mainView.classList.add('hidden');
  adminView.classList.add('hidden');

  if (viewName === 'auth') {
    authView.classList.remove('hidden');
  } else if (viewName === 'main') {
    mainView.classList.remove('hidden');
    renderMainView();
  } else if (viewName === 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Akses Ditolak: Halaman ini hanya untuk Pengurus / Admin RT.');
      showView('main');
      return;
    }
    adminView.classList.remove('hidden');
    renderAdminView();
  }
}

const tabLoginBtn = document.getElementById('tab-login-btn');
const tabRegisterBtn = document.getElementById('tab-register-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginAlert = document.getElementById('login-alert');
const registerAlert = document.getElementById('register-alert');

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

function showAlert(element, message, type = 'danger') {
  element.textContent = message;
  element.className = `alert alert-${type}`;
  element.classList.remove('hidden');
}

function hideAlerts() {
  loginAlert.classList.add('hidden');
  registerAlert.classList.add('hidden');
}

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

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  hideAlerts();

  const nik = document.getElementById('login-nik').value.trim();
  const password = document.getElementById('login-password').value;

  const users = getUsers();
  const foundUser = users.find(u => u.nik === nik);

  if (!foundUser) {
    showAlert(loginAlert, 'NIK tidak terdaftar dalam sistem RT-Ku.');
    return;
  }

  if (foundUser.password !== password) {
    showAlert(loginAlert, 'Kata sandi yang Anda masukkan salah.');
    return;
  }

  if (foundUser.status === 'Fictional') {
    showAlert(loginAlert, 'Akses ditolak: Data kependudukan Anda telah ditandai sebagai FIKTIF oleh Admin. Silakan hubungi pengurus RT.');
    return;
  }

  if (foundUser.status === 'Pending') {
    showAlert(loginAlert, 'Peringatan: Data pendaftaran Anda masih dalam status PENDING verifikasi pengurus RT.', 'warning');
  }

  setSession(foundUser);
  loginForm.reset();
  showView('main');
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  hideAlerts();

  const nik = document.getElementById('reg-nik').value.trim();
  const name = document.getElementById('reg-name').value.trim();
  const rtrw = document.getElementById('reg-rtrw').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!/^\d{16}$/.test(nik)) {
    showAlert(registerAlert, 'NIK harus terdiri dari tepat 16 digit angka.');
    return;
  }

  const users = getUsers();
  const existingUser = users.find(u => u.nik === nik);

  if (existingUser) {
    showAlert(registerAlert, 'NIK ini sudah terdaftar sebelumnya.');
    return;
  }

  const newUser = {
    nik: nik,
    name: name,
    rtrw: rtrw,
    password: password,
    role: 'citizen',
    status: 'Active'
  };

  users.push(newUser);
  saveUsers(users);

  registerForm.reset();
  showAlert(loginAlert, `Pendaftaran warga (${name}) berhasil! Silakan masuk menggunakan NIK dan kata sandi Anda.`, 'success');
  tabLoginBtn.click();
  document.getElementById('login-nik').value = nik;
  document.getElementById('login-password').focus();
});

function performLogout() {
  setSession(null);
  currentChatTarget = {
    id: "group-rt",
    name: "Forum Warga RT 003",
    isGroup: true,
    subtitle: "Saluran Publik Warga RT Aktif"
  };
  showView('auth');
}

document.getElementById('btn-logout').addEventListener('click', performLogout);
document.getElementById('btn-admin-logout').addEventListener('click', performLogout);

document.getElementById('btn-goto-admin').addEventListener('click', () => {
  showView('admin');
});

document.getElementById('btn-admin-back-chat').addEventListener('click', () => {
  showView('main');
});

const mobileToggleBtn = document.getElementById('mobile-toggle-sidebar');
const appSidebar = document.getElementById('app-sidebar');
if (mobileToggleBtn) {
  mobileToggleBtn.addEventListener('click', () => {
    appSidebar.classList.toggle('open');
  });
}

function renderMainView() {
  if (!currentUser) return;

  document.getElementById('sidebar-name').textContent = currentUser.name;
  document.getElementById('sidebar-nik').textContent = `NIK: ${currentUser.nik} (RT ${currentUser.rtrw})`;
  document.getElementById('sidebar-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

  const sidebarRoleEl = document.getElementById('sidebar-role');
  sidebarRoleEl.textContent = currentUser.role === 'admin' ? 'Pengurus / Admin' : 'Warga RT';
  if (currentUser.role === 'admin') {
    sidebarRoleEl.classList.add('admin');
  } else {
    sidebarRoleEl.classList.remove('admin');
  }

  const adminSection = document.getElementById('sidebar-admin-section');
  if (currentUser.role === 'admin') {
    adminSection.classList.remove('hidden');
  } else {
    adminSection.classList.add('hidden');
  }

  renderContactsList();
  renderChatHeader();
  renderChatMessages();
}

function renderContactsList(filterQuery = '') {
  const contactsContainer = document.getElementById('contacts-list');
  contactsContainer.innerHTML = '';

  const users = getUsers();
  const activeCitizens = users.filter(u => 
    u.status === 'Active' && 
    u.nik !== currentUser.nik
  );

  const query = filterQuery.toLowerCase().trim();

  const isGroupMatches = 'forum warga rt 003 grup publik'.includes(query);
  if (!query || isGroupMatches) {
    const groupItem = document.createElement('div');
    groupItem.className = `contact-item ${currentChatTarget.id === 'group-rt' ? 'active' : ''}`;
    groupItem.innerHTML = `
      <div class="contact-avatar group-avatar">RT</div>
      <div class="contact-details">
        <div class="contact-header">
          <span class="contact-title">Forum Warga RT 003</span>
        </div>
        <div class="contact-sub">Grup Resmi Warga RT</div>
      </div>
    `;
    groupItem.addEventListener('click', () => {
      currentChatTarget = {
        id: "group-rt",
        name: "Forum Warga RT 003",
        isGroup: true,
        subtitle: "Saluran Publik Warga RT Aktif"
      };
      renderContactsList(filterQuery);
      renderChatHeader();
      renderChatMessages();
      if (window.innerWidth <= 768) {
        appSidebar.classList.remove('open');
      }
    });
    contactsContainer.appendChild(groupItem);
  }

  const matchingCitizens = activeCitizens.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.nik.includes(query)
  );

  matchingCitizens.forEach(citizen => {
    const item = document.createElement('div');
    const isCurrentActive = currentChatTarget.id === citizen.nik;
    item.className = `contact-item ${isCurrentActive ? 'active' : ''}`;

    const roleBadge = citizen.role === 'admin' ? ' • Admin' : '';
    item.innerHTML = `
      <div class="contact-avatar">${sanitizeHTML(citizen.name.charAt(0).toUpperCase())}</div>
      <div class="contact-details">
        <div class="contact-header">
          <span class="contact-title">${sanitizeHTML(citizen.name)}</span>
        </div>
        <div class="contact-sub">NIK: ${sanitizeHTML(citizen.nik)}${roleBadge}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      currentChatTarget = {
        id: citizen.nik,
        name: citizen.name,
        isGroup: false,
        subtitle: `Warga Aktif • RT ${citizen.rtrw}`
      };
      renderContactsList(filterQuery);
      renderChatHeader();
      renderChatMessages();
      if (window.innerWidth <= 768) {
        appSidebar.classList.remove('open');
      }
    });

    contactsContainer.appendChild(item);
  });

  if (!isGroupMatches && matchingCitizens.length === 0) {
    contactsContainer.innerHTML = `
      <div style="text-align: center; color: var(--neutral-400); font-size: 0.8125rem; padding: 1.5rem 0.5rem;">
        Tidak ada warga aktif ditemukan dengan kata kunci "${sanitizeHTML(query)}"
      </div>
    `;
  }
}

document.getElementById('contact-search').addEventListener('input', (e) => {
  renderContactsList(e.target.value);
});

function renderChatHeader() {
  document.getElementById('chat-current-title').textContent = currentChatTarget.name;
  document.getElementById('chat-current-subtitle').textContent = currentChatTarget.subtitle;
  const avatarEl = document.getElementById('chat-current-avatar');

  if (currentChatTarget.isGroup) {
    avatarEl.textContent = 'RT';
    avatarEl.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
  } else {
    avatarEl.textContent = currentChatTarget.name.charAt(0).toUpperCase();
    avatarEl.style.background = 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)';
  }
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  container.innerHTML = '';

  const allMessages = getMessages();

  const filtered = allMessages.filter(msg => {
    if (currentChatTarget.isGroup) {
      return msg.channel === 'group-rt';
    } else {
      return (
        (msg.senderNik === currentUser.nik && msg.channel === currentChatTarget.id) ||
        (msg.senderNik === currentChatTarget.id && (msg.channel === currentUser.nik || msg.recipientNik === currentUser.nik))
      );
    }
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="chat-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <p>Belum ada percakapan. Mulai kirim pesan pertama Anda sekarang!</p>
      </div>
    `;
    return;
  }

  filtered.forEach(msg => {
    const isSentByMe = msg.senderNik === currentUser.nik;
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = `chat-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`;

    const senderDisplay = !isSentByMe ? `<span class="chat-sender-name">${sanitizeHTML(msg.senderName)}</span>` : '';

    bubbleWrapper.innerHTML = `
      ${senderDisplay}
      <div class="chat-bubble">
        <div class="chat-bubble-text">${sanitizeHTML(msg.text)}</div>
        <div class="chat-bubble-time">${sanitizeHTML(msg.time)}</div>
      </div>
    `;

    container.appendChild(bubbleWrapper);
  });

  container.scrollTop = container.scrollHeight;
}

const chatForm = document.getElementById('chat-form');
const chatInputText = document.getElementById('chat-input-text');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInputText.value.trim();
  if (!text) return;

  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    channel: currentChatTarget.id,
    recipientNik: currentChatTarget.isGroup ? null : currentChatTarget.id,
    senderNik: currentUser.nik,
    senderName: currentUser.name,
    text: text,
    time: getCurrentTimeString()
  };

  const messages = getMessages();
  messages.push(newMessage);
  saveMessages(messages);

  chatInputText.value = '';
  renderChatMessages();

  simulateIncomingResponse(text, currentChatTarget);
});

function simulateIncomingResponse(userText, target) {
  const users = getUsers();
  const activeCitizens = users.filter(u => u.status === 'Active' && u.nik !== currentUser.nik);
  if (activeCitizens.length === 0) return;

  setTimeout(() => {
    let responder;
    let channelTarget;

    if (target.isGroup) {
      responder = activeCitizens[Math.floor(Math.random() * activeCitizens.length)];
      channelTarget = 'group-rt';
    } else {
      responder = activeCitizens.find(u => u.nik === target.id);
      if (!responder) return;
      channelTarget = currentUser.nik;
    }

    const responses = [
      "Baik, terima kasih atas informasinya.",
      "Siap, kami catat untuk diteruskan ke warga sekitar.",
      "Terima kasih sudah peduli dengan lingkungan RT kita!",
      "Baik pak/bu, segera kami tindak lanjuti.",
      "Sepakat! Mari kita jaga kerukunan RT bersama."
    ];
    const replyText = responses[Math.floor(Math.random() * responses.length)];

    const simMessage = {
      id: `msg_sim_${Date.now()}`,
      channel: channelTarget,
      recipientNik: target.isGroup ? null : currentUser.nik,
      senderNik: responder.nik,
      senderName: responder.name + (responder.role === 'admin' ? ' (Admin)' : ''),
      text: replyText,
      time: getCurrentTimeString()
    };

    const msgs = getMessages();
    msgs.push(simMessage);
    saveMessages(msgs);

    if (currentChatTarget.id === target.id) {
      renderChatMessages();
    }
  }, 1200);
}

const citizensTableBody = document.getElementById('citizens-table-body');
const adminSearchInput = document.getElementById('admin-search-input');
const adminFilterStatus = document.getElementById('admin-filter-status');
const adminAlert = document.getElementById('admin-alert');

function renderAdminView() {
  if (!currentUser || currentUser.role !== 'admin') return;

  const users = getUsers();

  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const pendingCount = users.filter(u => u.status === 'Pending').length;
  const fictionalCount = users.filter(u => u.status === 'Fictional').length;

  document.getElementById('stat-total-citizens').textContent = totalCount;
  document.getElementById('stat-active-citizens').textContent = activeCount;
  document.getElementById('stat-pending-citizens').textContent = pendingCount;
  document.getElementById('stat-fictional-citizens').textContent = fictionalCount;

  const searchQuery = adminSearchInput.value.toLowerCase().trim();
  const statusFilter = adminFilterStatus.value;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery) || user.nik.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  citizensTableBody.innerHTML = '';

  if (filteredUsers.length === 0) {
    citizensTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--neutral-400); padding: 2rem;">
          Tidak ada data warga yang sesuai dengan pencarian atau filter.
        </td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach((user, index) => {
    const tr = document.createElement('tr');

    let statusBadgeClass = 'badge-active';
    let statusLabel = 'Aktif (Active)';
    if (user.status === 'Pending') {
      statusBadgeClass = 'badge-pending';
      statusLabel = 'Menunggu Verifikasi (Pending)';
    } else if (user.status === 'Fictional') {
      statusBadgeClass = 'badge-fictional';
      statusLabel = 'Fiktif / Palsu (Fictional)';
    }

    const isSelfAdmin = user.nik === currentUser.nik;

    let actionButtons = '';
    if (isSelfAdmin) {
      actionButtons = '<span style="font-size: 0.75rem; color: var(--neutral-400); font-style: italic;">Akun Anda Sendiri</span>';
    } else {
      actionButtons = `
        <div class="table-actions">
          ${user.status !== 'Active' ? `<button type="button" class="btn-action btn-action-activate" onclick="adminSetStatus('${user.nik}', 'Active')">Aktifkan</button>` : ''}
          ${user.status !== 'Pending' ? `<button type="button" class="btn-action" style="background: var(--warning-light); color: var(--warning-dark); border: 1px solid var(--warning-border);" onclick="adminSetStatus('${user.nik}', 'Pending')">Set Pending</button>` : ''}
          ${user.status !== 'Fictional' ? `<button type="button" class="btn-action btn-action-flag" onclick="adminSetStatus('${user.nik}', 'Fictional')">Tandai Fiktif</button>` : ''}
          <button type="button" class="btn-action btn-action-delete" onclick="adminDeleteUser('${user.nik}')">Hapus</button>
        </div>
      `;
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${sanitizeHTML(user.nik)}</strong></td>
      <td>${sanitizeHTML(user.name)}</td>
      <td>RT ${sanitizeHTML(user.rtrw)}</td>
      <td><span class="badge-role">${user.role === 'admin' ? 'Admin RT' : 'Warga'}</span></td>
      <td><span class="badge ${statusBadgeClass}">${statusLabel}</span></td>
      <td>${actionButtons}</td>
    `;

    citizensTableBody.appendChild(tr);
  });
}

window.adminSetStatus = function(nik, newStatus) {
  const users = getUsers();
  const targetUser = users.find(u => u.nik === nik);
  if (!targetUser) return;

  targetUser.status = newStatus;
  saveUsers(users);

  showAdminAlert(`Berhasil memperbarui status warga "${targetUser.name}" menjadi ${newStatus}.`, 'success');
  renderAdminView();
};

window.adminDeleteUser = function(nik) {
  const users = getUsers();
  const targetUser = users.find(u => u.nik === nik);
  if (!targetUser) return;

  if (targetUser.nik === currentUser.nik) {
    alert('Tidak dapat menghapus akun Anda sendiri.');
    return;
  }

  const confirmDelete = confirm(`PERINGATAN: Apakah Anda yakin ingin MENGHAPUS data "${targetUser.name}" (NIK: ${targetUser.nik}) secara permanen? Tindakan ini tidak dapat dibatalkan.`);
  if (!confirmDelete) return;

  const updatedUsers = users.filter(u => u.nik !== nik);
  saveUsers(updatedUsers);

  showAdminAlert(`Data warga "${targetUser.name}" berhasil dihapus dari sistem kependudukan RT.`, 'danger');
  renderAdminView();
};

function showAdminAlert(message, type = 'success') {
  adminAlert.textContent = message;
  adminAlert.className = `alert alert-${type}`;
  adminAlert.classList.remove('hidden');
  setTimeout(() => {
    adminAlert.classList.add('hidden');
  }, 4000);
}

adminSearchInput.addEventListener('input', () => {
  renderAdminView();
});

adminFilterStatus.addEventListener('change', () => {
  renderAdminView();
});

document.getElementById('btn-admin-reset-data').addEventListener('click', () => {
  const confirmReset = confirm('Apakah Anda yakin ingin mengembalikan seluruh data warga dan pesan ke data awal dummy prototype?');
  if (confirmReset) {
    initializeStorage(true);
    showAdminAlert('Seluruh data prototype telah di-reset ke kondisi awal.', 'warning');
    renderAdminView();
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEYS.USERS) {
    if (!adminView.classList.contains('hidden')) {
      renderAdminView();
    }
    if (!mainView.classList.contains('hidden')) {
      renderContactsList(document.getElementById('contact-search').value);
    }
  }
  if (e.key === STORAGE_KEYS.MESSAGES) {
    if (!mainView.classList.contains('hidden')) {
      renderChatMessages();
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  initializeStorage(false);

  const existingSession = getSession();
  if (existingSession) {
    currentUser = existingSession;
    showView('main');
  } else {
    showView('auth');
  }
});
