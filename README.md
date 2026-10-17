# RT-Ku v0.3 — Community OS, Real-Time Chat & Kas Warga Transparan

Platform komunikasi warga, musyawarah sosial, buku kas terbuka, dan tata kelola kependudukan RT/RW yang menggabungkan pola arsitektur dari repositori open-source bintang lima terbaik.

---

## 🌟 Referensi Repositori Open-Source Bintang Lima yang Dipelajari

| Repositori | Bintang GitHub | Pola Terbaik yang Diadopsi ke RT-Ku |
| :--- | :--- | :--- |
| **[Discourse](https://github.com/discourse/discourse)** | ~48.000+ ⭐ | Struktur kategori diskusi komunitas, sistem *trust/status* anggota (`Active`, `Pending`, `Fictional`), dan log audit moderasi. |
| **[Rocket.Chat](https://github.com/RocketChat/Rocket.Chat)** | ~46.000+ ⭐ | Tata letak *Omnichannel Workspace*, indikator kehadiran (*online presence*), reaksi emoji (`👍 ❤️ 🙏 🔥 ✅`), dan sematan pesan (*pinned messages*). |
| **[Mattermost](https://github.com/mattermost/mattermost)** | ~30.000+ ⭐ | Navigasi multi-saluran (*Public Channels* & *Direct Messages*), pencarian instan (`Ctrl+K`), serta efisiensi backend tinggi. |
| **[Zulip](https://github.com/zulip/zulip)** | ~22.000+ ⭐ | Pengorganisasian pesan berbasis **Topik (*Topic Tags*)** dan kutipan balasan berulir (**Threaded Replies**). |
| **[HumHub](https://github.com/humhub/humhub) / Meta Workplace** | ~6.500+ ⭐ | **Beranda Sosial Komunitas (*Community Feed*)**, pengumuman resmi tersemat, komentar musyawarah, serta **E-Voting / Polling Warga** real-time. |

---

## 🗺️ 4 Pilar Scope Pembelajaran Publik (Roadmap Iteratif)

1. ✅ **Pilar 1 — Modul Kas & Iuran Warga Transparan (Fokus Aktif v0.3)**:
   - Buku Kas RT Terbuka (*Pemasukan* vs *Pengeluaran*) tersimpan di tabel relasional `kas_transactions` (`node:sqlite` WAL Mode).
   - Pelacakan Status Iuran Bulanan Warga (`citizen_dues`: *Lunas* / *Belum Bayar*) dengan kalkulasi persentase kepatuhan otomatis dan sinkronisasi real-time via SSE.
2. 🔜 **Pilar 2 — Modul E-Surat Pengantar RT/RW (Target v0.4)**:
   - Pengajuan surat pengantar domisili/KTP/SKCK mandiri oleh warga dan persetujuan digital Ketua RT.
3. 🔜 **Pilar 3 — Modul Jadwal Ronda & Panic Button Darurat (Target v0.5)**:
   - Penjadwalan giliran Siskamling malam dan tombol siaga darurat real-time ke seluruh warga.
4. 🔜 **Pilar 4 — Integrasi Asisten AI Pengurus RT (Target v0.6)**:
   - Tanya-jawab otomatis peraturan RT dan ringkasan musyawarah menggunakan API Key yang diamankan di `.env`.

---

## 🏗️ Arsitektur & Efisiensi Teknologi (Zero-Dependency Node.js + Native SQLite)

```mermaid
flowchart LR
  subgraph Client["Client-Side (Browser SPA)"]
    UI["4-Pane Workspace UI\n(Chat, Meta Feed, Kas RT, Direktori, Admin)"]
    Engine["Hybrid Reactive Engine\n(script.js)"]
    Local["Fallback: LocalStorage +\nBroadcastChannel Sync"]
  end

  subgraph Server["Server-Side (Pure Node.js v24)"]
    HTTP["HTTP/REST Router +\nStatic Asset Server"]
    SSE["Real-Time EventBus\n(Server-Sent Events /api/events)"]
    Auth["Crypto Scrypt Hash +\nHMAC-SHA256 Token"]
    SQLite[("Native node:sqlite (WAL Mode)\ndata/private/rtku.sqlite")]
  end

  UI <--> Engine
  Engine <-->|"REST + SSE (<1ms push)"| HTTP
  Engine <-->|"EventSource Stream"| SSE
  Engine -.->|"Mode Offline / Statis"| Local
  HTTP --> Auth
  HTTP <--> SQLite
  SSE <--> SQLite
```

### Mengapa Stack Ini Sangat Efisien?
- **Zero External Dependencies (`node_modules` = 0 MB)**: Hanya menggunakan modul bawaan **Node.js v24** (`node:sqlite`, `node:http`, `node:crypto`, `node:fs`).
- **Native SQLite dengan WAL Mode (`PRAGMA journal_mode = WAL`)**: Baca/tulis konkurensi tinggi dalam 1 file database lokal (`data/private/rtku.sqlite`) dengan latensi query `< 0.5 ms`.
- **Dual-Mode Hybrid**: Berjalan penuh dengan `node server.js` (SQLite + SSE Real-Time) maupun dibuka statis langsung di browser/XAMPP (`LocalStorage` + `BroadcastChannel`).

---

## 🔒 Keamanan & Kerahasiaan Publik (`.gitignore`)

- File sensitif (`.env`, `*api_key*`, `*secret*`, `.pem`, `.gemini/`, `*.sqlite`, `data/private/`) diblokir penuh di [`.gitignore`](.gitignore).
- Gunakan [`.env.example`](.env.example) sebagai acuan konfigurasi variabel lingkungan lokal tanpa membocorkan kunci rahasia ke publik.
