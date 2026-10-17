/**
 * RT-Ku v0.3 — High-Efficiency Real-Time Community, Chat & Transparent Finance Server
 * Powered by Pure Zero-Dependency Node.js + Native `node:sqlite` (WAL Mode) + SSE
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

// 1. Native .env Loader (Confidentiality-First)
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  });
}
loadEnvFile();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const DATA_DIR = path.join(__dirname, 'data', 'private');
const SQLITE_PATH = path.join(DATA_DIR, 'rtku.sqlite');

fs.mkdirSync(DATA_DIR, { recursive: true });

// 2. Cryptographic Helpers
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, key] = storedHash.split(':');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

// 3. Native SQLite Database Initialization (WAL Mode)
const sqlite = new DatabaseSync(SQLITE_PATH);
sqlite.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;

  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS kas_transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    actorName TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS citizen_dues (
    nik TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

function createSeedState() {
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
        passwordHash: hashPassword('admin'),
        role: 'admin',
        title: 'Ketua RT 003',
        status: 'Active',
        bio: 'Pengurus RT 003 / RW 005 • Melayani administrasi & ketertiban warga.'
      },
      {
        nik: '3201010202920002',
        name: 'Siti Nurhaliza',
        rtrw: '003/005',
        passwordHash: hashPassword('user123'),
        role: 'citizen',
        title: 'Koordinator PKK & Posyandu',
        status: 'Active',
        bio: 'Penggerak PKK RT 003 & Posyandu Balita/Lansia.'
      },
      {
        nik: '3201010303950003',
        name: 'Budi Santoso',
        rtrw: '003/005',
        passwordHash: hashPassword('user123'),
        role: 'citizen',
        title: 'Koordinator Keamanan',
        status: 'Active',
        bio: 'Koordinator Siskamling & Ketertiban Blok A-C.'
      },
      {
        nik: '3201010606930006',
        name: 'Rina Kartika',
        rtrw: '003/005',
        passwordHash: hashPassword('user123'),
        role: 'citizen',
        title: 'Bendahara Kas Warga',
        status: 'Active',
        bio: 'Pengelola Kas RT & Transparansi Iuran Kebersihan.'
      },
      {
        nik: '3201010404980004',
        name: 'Dewi Lestari',
        rtrw: '003/005',
        passwordHash: hashPassword('user123'),
        role: 'citizen',
        title: 'Warga Baru Blok D',
        status: 'Pending',
        bio: 'Warga pindahan baru Blok D No. 14.'
      },
      {
        nik: '9999999999999999',
        name: 'Akun Fiktif Spammer',
        rtrw: '999/999',
        passwordHash: hashPassword('fake'),
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
        content: 'Halo warga RT 003/005! Buku Kas RT kini dapat dipantau secara real-time di menu Kas & Iuran. Minggu depan kita akan melakukan penggantian 6 titik lampu jalan LED hemat energi di sepanjang gang Blok B dan C.',
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
            text: 'Seluruh mutasi pemasukan dan pengeluaran sudah tercatat otomatis di tab Kas & Iuran Warga.',
            time: '08:22'
          }
        ]
      }
    ],
    auditLogs: [
      {
        id: 'log_1',
        time: '08:00',
        actor: 'Bambang Pamungkas',
        action: 'Inisialisasi database SQLite WAL & buku kas transparan RT 003'
      }
    ]
  };
}

const INITIAL_KAS = [
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
];

const INITIAL_DUES = [
  { nik: '3201010101900001', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-02' },
  { nik: '3201010202920002', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-03' },
  { nik: '3201010303950003', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-04' },
  { nik: '3201010606930006', month: 'Oktober 2026', amount: 50000, status: 'PAID', updatedAt: '2026-10-02' },
  { nik: '3201010404980004', month: 'Oktober 2026', amount: 50000, status: 'UNPAID', updatedAt: '-' }
];

let db = null;

function saveKvState() {
  const upsert = sqlite.prepare(`
    INSERT INTO kv_store (key, value) VALUES ('app_state', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  upsert.run(JSON.stringify(db));
}

function getKasTransactions() {
  return sqlite.prepare('SELECT * FROM kas_transactions ORDER BY date DESC, id DESC').all();
}

function getCitizenDues() {
  return sqlite.prepare('SELECT * FROM citizen_dues').all();
}

function seedRelationalTables(forceReset = false) {
  if (forceReset) {
    sqlite.exec('DELETE FROM kas_transactions; DELETE FROM citizen_dues;');
  }
  const txCount = sqlite.prepare('SELECT COUNT(*) as c FROM kas_transactions').get().c;
  if (txCount === 0) {
    const insertTx = sqlite.prepare(`
      INSERT INTO kas_transactions (id, date, type, category, description, amount, actorName)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const tx of INITIAL_KAS) {
      insertTx.run(tx.id, tx.date, tx.type, tx.category, tx.description, tx.amount, tx.actorName);
    }
  }
  const duesCount = sqlite.prepare('SELECT COUNT(*) as c FROM citizen_dues').get().c;
  if (duesCount === 0) {
    const insertDue = sqlite.prepare(`
      INSERT INTO citizen_dues (nik, month, amount, status, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const d of INITIAL_DUES) {
      insertDue.run(d.nik, d.month, d.amount, d.status, d.updatedAt);
    }
  }
}

function initDatabase(forceReset = false) {
  if (!forceReset) {
    const row = sqlite.prepare("SELECT value FROM kv_store WHERE key = 'app_state'").get();
    if (row && row.value) {
      try {
        db = JSON.parse(row.value);
        seedRelationalTables(false);
        return;
      } catch {
        // Fallback to seed
      }
    }
  }
  db = createSeedState();
  saveKvState();
  seedRelationalTables(true);
}
initDatabase(false);

function sanitizeUser(u) {
  const { passwordHash, password, ...safe } = u;
  return safe;
}

// 4. Real-Time SSE Clients Registry
const sseClients = new Map();

function broadcastEvent(event, payload) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const [, client] of sseClients) {
    try {
      client.res.write(frame);
    } catch {
      // Cleaned up on close
    }
  }
}

function getOnlineNiks() {
  const niks = new Set(['3201010101900001', '3201010202920002', '3201010303950003']);
  for (const [, client] of sseClients) {
    if (client.nik) niks.add(client.nik);
  }
  return Array.from(niks);
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

// 5. HTTP & REST + SSE Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // --- SSE STREAM ---
  if (req.method === 'GET' && pathname === '/api/events') {
    const clientId = crypto.randomUUID();
    const nik = url.searchParams.get('nik') || null;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    sseClients.set(clientId, { res, nik });
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, onlineNiks: getOnlineNiks() })}\n\n`);
    broadcastEvent('presence:update', { onlineNiks: getOnlineNiks() });

    const hb = setInterval(() => {
      try { res.write(': hb\n\n'); } catch { clearInterval(hb); }
    }, 20000);

    req.on('close', () => {
      clearInterval(hb);
      sseClients.delete(clientId);
      broadcastEvent('presence:update', { onlineNiks: getOnlineNiks() });
    });
    return;
  }

  // --- BOOTSTRAP ---
  if (req.method === 'GET' && pathname === '/api/bootstrap') {
    return sendJSON(res, 200, {
      channels: db.channels,
      users: db.users.map(sanitizeUser),
      messages: db.messages,
      posts: db.posts,
      auditLogs: db.auditLogs,
      kasTransactions: getKasTransactions(),
      citizenDues: getCitizenDues(),
      onlineNiks: getOnlineNiks()
    });
  }

  // --- AUTH LOGIN ---
  if (req.method === 'POST' && pathname === '/api/auth/login') {
    try {
      const { nik, password } = await parseBody(req);
      const user = db.users.find((u) => u.nik === String(nik || '').trim());
      if (!user) return sendJSON(res, 404, { error: 'NIK tidak terdaftar dalam sistem RT-Ku.' });
      if (!verifyPassword(String(password || ''), user.passwordHash || user.password)) {
        return sendJSON(res, 401, { error: 'Kata sandi yang Anda masukkan salah.' });
      }
      if (user.status === 'Fictional') {
        return sendJSON(res, 403, { error: 'Akses ditolak: Data kependudukan Anda ditandai sebagai FIKTIF.' });
      }
      const safeUser = sanitizeUser(user);
      const token = signToken({ nik: user.nik, role: user.role, iat: Date.now() });
      return sendJSON(res, 200, { user: safeUser, token });
    } catch {
      return sendJSON(res, 400, { error: 'Permintaan login tidak valid.' });
    }
  }

  // --- AUTH REGISTER ---
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    try {
      const { nik, name, rtrw, password, title } = await parseBody(req);
      const cleanNik = String(nik || '').trim();
      const cleanName = String(name || '').trim();
      const cleanRtrw = String(rtrw || '').trim();

      if (!/^\d{16}$/.test(cleanNik)) {
        return sendJSON(res, 400, { error: 'NIK harus terdiri dari tepat 16 digit angka.' });
      }
      if (!cleanName || !cleanRtrw || !password || String(password).length < 4) {
        return sendJSON(res, 400, { error: 'Harap lengkapi semua kolom pendaftaran.' });
      }
      if (db.users.some((u) => u.nik === cleanNik)) {
        return sendJSON(res, 409, { error: 'NIK ini sudah terdaftar sebelumnya.' });
      }

      const newUser = {
        nik: cleanNik,
        name: cleanName,
        rtrw: cleanRtrw,
        passwordHash: hashPassword(String(password)),
        role: 'citizen',
        title: title ? String(title).trim() : 'Warga RT',
        status: 'Active',
        bio: `Warga RT ${cleanRtrw}`
      };

      db.users.push(newUser);
      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        time: nowTime(),
        actor: cleanName,
        action: `Registrasi warga baru (NIK: ${cleanNik})`
      });
      saveKvState();

      sqlite.prepare(`
        INSERT OR IGNORE INTO citizen_dues (nik, month, amount, status, updatedAt)
        VALUES (?, 'Oktober 2026', 50000, 'UNPAID', '-')
      `).run(cleanNik);

      broadcastEvent('users:update', {
        users: db.users.map(sanitizeUser),
        auditLogs: db.auditLogs,
        citizenDues: getCitizenDues()
      });
      return sendJSON(res, 201, { user: sanitizeUser(newUser) });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal memproses pendaftaran.' });
    }
  }

  // --- CHAT MESSAGES ---
  if (req.method === 'POST' && pathname === '/api/messages') {
    try {
      const { channel, topic, senderNik, senderName, senderRole, text, replyTo, recipientNik } = await parseBody(req);
      if (!text || !senderNik) return sendJSON(res, 400, { error: 'Pesan tidak boleh kosong.' });

      const msg = {
        id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        channel: channel || 'group-rt',
        recipientNik: recipientNik || null,
        topic: topic || 'Umum',
        senderNik,
        senderName: senderName || 'Warga',
        senderRole: senderRole || 'citizen',
        text: String(text).trim(),
        time: nowTime(),
        pinned: false,
        replyTo: replyTo || null,
        reactions: {}
      };
      db.messages.push(msg);
      saveKvState();
      broadcastEvent('message:new', msg);
      return sendJSON(res, 201, { message: msg });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal mengirim pesan.' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/messages/react') {
    try {
      const { messageId, emoji, nik } = await parseBody(req);
      const msg = db.messages.find((m) => m.id === messageId);
      if (!msg) return sendJSON(res, 404, { error: 'Pesan tidak ditemukan.' });
      if (!msg.reactions) msg.reactions = {};
      if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

      const idx = msg.reactions[emoji].indexOf(nik);
      if (idx === -1) msg.reactions[emoji].push(nik);
      else msg.reactions[emoji].splice(idx, 1);

      saveKvState();
      broadcastEvent('message:update', msg);
      return sendJSON(res, 200, { message: msg });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal memperbarui reaksi.' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/messages/pin') {
    try {
      const { messageId } = await parseBody(req);
      const msg = db.messages.find((m) => m.id === messageId);
      if (!msg) return sendJSON(res, 404, { error: 'Pesan tidak ditemukan.' });
      msg.pinned = !msg.pinned;
      saveKvState();
      broadcastEvent('message:update', msg);
      return sendJSON(res, 200, { message: msg });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal menyematkan pesan.' });
    }
  }

  // --- COMMUNITY FEED POSTS ---
  if (req.method === 'POST' && pathname === '/api/posts') {
    try {
      const { authorNik, authorName, authorTitle, authorRole, category, title, content, pollOptions, pollQuestion } = await parseBody(req);
      if (!title || !content) return sendJSON(res, 400, { error: 'Judul dan isi wajib diisi.' });
      let poll = null;
      if (pollQuestion && Array.isArray(pollOptions) && pollOptions.length >= 2) {
        poll = {
          question: String(pollQuestion).trim(),
          options: pollOptions.map((opt, idx) => ({ id: `opt_${Date.now()}_${idx}`, text: String(opt).trim(), votes: [] }))
        };
      }
      const newPost = {
        id: `post_${Date.now()}`,
        authorNik,
        authorName,
        authorTitle: authorTitle || 'Warga RT',
        authorRole: authorRole || 'citizen',
        category: category || 'Diskusi Warga',
        title: String(title).trim(),
        content: String(content).trim(),
        createdAt: `Hari ini, ${nowTime()}`,
        pinned: authorRole === 'admin',
        likes: [],
        poll,
        comments: []
      };
      db.posts.unshift(newPost);
      saveKvState();
      broadcastEvent('posts:update', { posts: db.posts });
      return sendJSON(res, 201, { post: newPost });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal membuat kiriman.' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/posts/interact') {
    try {
      const { postId, action, nik, authorName, text, optionId } = await parseBody(req);
      const post = db.posts.find((p) => p.id === postId);
      if (!post) return sendJSON(res, 404, { error: 'Kiriman tidak ditemukan.' });

      if (action === 'like') {
        const idx = post.likes.indexOf(nik);
        if (idx === -1) post.likes.push(nik);
        else post.likes.splice(idx, 1);
      } else if (action === 'comment' && text) {
        post.comments.push({
          id: `cmt_${Date.now()}`,
          authorNik: nik,
          authorName: authorName || 'Warga',
          text: String(text).trim(),
          time: nowTime()
        });
      } else if (action === 'vote' && post.poll && optionId) {
        post.poll.options.forEach((opt) => {
          opt.votes = opt.votes.filter((v) => v !== nik);
          if (opt.id === optionId) opt.votes.push(nik);
        });
      }
      saveKvState();
      broadcastEvent('posts:update', { posts: db.posts });
      return sendJSON(res, 200, { post });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal memproses interaksi.' });
    }
  }

  // --- FOCUS #1: TRANSPARENT KAS & CITIZEN DUES (SQLITE NATIVE) ---
  if (req.method === 'POST' && pathname === '/api/finance/transaction') {
    try {
      const { type, category, description, amount, actorName } = await parseBody(req);
      const cleanAmount = Math.abs(Number(amount) || 0);
      if (!description || cleanAmount <= 0) {
        return sendJSON(res, 400, { error: 'Keterangan dan nominal mutasi kas harus valid.' });
      }
      const id = `tx_${Date.now()}`;
      const date = todayDate();
      const txType = type === 'OUT' ? 'OUT' : 'IN';

      sqlite.prepare(`
        INSERT INTO kas_transactions (id, date, type, category, description, amount, actorName)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, date, txType, category || 'Umum', String(description).trim(), cleanAmount, actorName || 'Pengurus RT');

      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        time: nowTime(),
        actor: actorName || 'Pengurus RT',
        action: `Mencatat mutasi Kas [${txType}] Rp ${cleanAmount.toLocaleString('id-ID')} — ${description}`
      });
      saveKvState();

      const payload = {
        kasTransactions: getKasTransactions(),
        citizenDues: getCitizenDues(),
        auditLogs: db.auditLogs
      };
      broadcastEvent('finance:update', payload);
      return sendJSON(res, 201, payload);
    } catch {
      return sendJSON(res, 400, { error: 'Gagal menyimpan transaksi kas.' });
    }
  }

  if (req.method === 'POST' && pathname === '/api/finance/dues-toggle') {
    try {
      const { nik, actorName } = await parseBody(req);
      const existing = sqlite.prepare('SELECT * FROM citizen_dues WHERE nik = ?').get(nik);
      const nextStatus = existing && existing.status === 'PAID' ? 'UNPAID' : 'PAID';
      const updatedDate = nextStatus === 'PAID' ? todayDate() : '-';

      sqlite.prepare(`
        INSERT INTO citizen_dues (nik, month, amount, status, updatedAt)
        VALUES (?, 'Oktober 2026', 50000, ?, ?)
        ON CONFLICT(nik) DO UPDATE SET status = excluded.status, updatedAt = excluded.updatedAt
      `).run(nik, nextStatus, updatedDate);

      const citizen = db.users.find((u) => u.nik === nik);
      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        time: nowTime(),
        actor: actorName || 'Pengurus RT',
        action: `Mengubah status iuran bulanan ${citizen ? citizen.name : nik} menjadi ${nextStatus}`
      });
      saveKvState();

      const payload = {
        kasTransactions: getKasTransactions(),
        citizenDues: getCitizenDues(),
        auditLogs: db.auditLogs
      };
      broadcastEvent('finance:update', payload);
      return sendJSON(res, 200, payload);
    } catch {
      return sendJSON(res, 400, { error: 'Gagal memperbarui status iuran warga.' });
    }
  }

  // --- ADMIN GOVERNANCE ---
  if (req.method === 'POST' && pathname === '/api/admin/citizen-status') {
    try {
      const { nik, status, actorName } = await parseBody(req);
      const target = db.users.find((u) => u.nik === nik);
      if (!target) return sendJSON(res, 404, { error: 'Warga tidak ditemukan.' });
      target.status = status;
      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        time: nowTime(),
        actor: actorName || 'Admin RT',
        action: `Mengubah status kependudukan ${target.name} (${target.nik}) menjadi ${status}`
      });
      saveKvState();
      broadcastEvent('users:update', {
        users: db.users.map(sanitizeUser),
        auditLogs: db.auditLogs,
        citizenDues: getCitizenDues()
      });
      return sendJSON(res, 200, { users: db.users.map(sanitizeUser), auditLogs: db.auditLogs });
    } catch {
      return sendJSON(res, 400, { error: 'Gagal memperbarui status warga.' });
    }
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/admin/citizen/')) {
    const nik = pathname.split('/').pop();
    const target = db.users.find((u) => u.nik === nik);
    if (!target) return sendJSON(res, 404, { error: 'Warga tidak ditemukan.' });
    db.users = db.users.filter((u) => u.nik !== nik);
    sqlite.prepare('DELETE FROM citizen_dues WHERE nik = ?').run(nik);
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      time: nowTime(),
      actor: 'Admin RT',
      action: `Menghapus permanen data ${target.name} (NIK: ${target.nik})`
    });
    saveKvState();
    broadcastEvent('users:update', {
      users: db.users.map(sanitizeUser),
      auditLogs: db.auditLogs,
      citizenDues: getCitizenDues()
    });
    return sendJSON(res, 200, { users: db.users.map(sanitizeUser), auditLogs: db.auditLogs });
  }

  if (req.method === 'POST' && pathname === '/api/admin/reset') {
    initDatabase(true);
    broadcastEvent('bootstrap:reset', {
      channels: db.channels,
      users: db.users.map(sanitizeUser),
      messages: db.messages,
      posts: db.posts,
      auditLogs: db.auditLogs,
      kasTransactions: getKasTransactions(),
      citizenDues: getCitizenDues()
    });
    return sendJSON(res, 200, { ok: true });
  }

  // --- STATIC ASSETS ---
  const filePath = pathname === '/' ? '/index.html' : pathname;
  const resolvedPath = path.normalize(path.join(__dirname, filePath));
  if (!resolvedPath.startsWith(__dirname) || resolvedPath.includes('data' + path.sep + 'private')) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
    const ext = path.extname(resolvedPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    fs.createReadStream(resolvedPath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[RT-Ku v0.3 SQLite-WAL Server] Aktif di http://${HOST}:${PORT}`);
});
