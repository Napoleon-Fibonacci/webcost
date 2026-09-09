# Product Requirements Document (PRD)
## Website Profil COST (Club of Science and Technology)

**Versi:** 1.0
**Tanggal:** 9 September 2026
**Disusun oleh:** Guru Pembimbing COST
**Status:** Draft untuk review

---

## 1. Latar Belakang

COST (Club of Science and Technology) adalah ekstrakurikuler sekolah yang saat ini belum memiliki website resmi. Ketiadaan website membuat profil, kegiatan, dan prestasi klub sulit diakses oleh pihak luar (calon anggota, sekolah, sponsor, atau publik umum). Dibutuhkan sebuah website profil/portofolio yang menampilkan identitas, kegiatan, dan pencapaian COST.

## 2. Tujuan Produk

- Menyediakan wadah digital resmi untuk memperkenalkan COST kepada publik.
- Menampilkan dokumentasi kegiatan dan prestasi klub secara terpusat.
- Memudahkan calon anggota baru mengenal COST sebelum bergabung.
- Menjadi media promosi klub ke pihak sekolah maupun eksternal.

## 3. Target Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Calon anggota (siswa) | Info kegiatan, cara bergabung, kesan klub |
| Anggota aktif | Melihat dokumentasi & update terbaru |
| Pihak sekolah/guru | Bukti aktivitas & prestasi eskul |
| Publik/sponsor | Profil klub, pencapaian, kontak |

## 4. Pengelola Website

Website akan dikelola oleh **pengurus inti COST (siswa)** setelah rilis. Karena itu, sistem harus:
- Mudah digunakan tanpa keahlian teknis mendalam (idealnya ada panel admin sederhana atau struktur konten yang gampang diedit).
- Disertai panduan singkat cara update konten (teks & foto) untuk pengurus baru tiap tahun (regenerasi kepengurusan).

## 5. Lingkup Fitur (Scope)

### 5.1 Fitur Wajib (Must Have) — untuk rilis <2 minggu
1. **Bagian Beranda (Home)**
   - Nama klub, logo, tagline singkat
   - Ringkasan singkat tentang COST
2. **Bagian Tentang Kami (About)**
   - Sejarah singkat, visi & misi
   - Struktur pengurus (nama, jabatan, foto opsional)
3. **Bagian Kegiatan/Program Kerja**
   - Daftar kegiatan rutin/proker klub
   - Foto/dokumentasi kegiatan
4. **Bagian Prestasi**
   - Daftar penghargaan/kompetisi yang pernah diikuti/dimenangkan
5. **Bagian Kontak**
   - Media sosial (Instagram, dsb.), email, atau form kontak sederhana
6. **Desain Responsif**
   - Bisa diakses baik dari HP maupun laptop/komputer

### 5.2 Fitur Tambahan (Nice to Have) — bisa menyusul setelah rilis awal
- Galeri foto/video terpisah
- Blog/berita update kegiatan
- Form pendaftaran anggota baru online
- Bagian testimoni anggota

### 5.3 Di Luar Lingkup (Out of Scope) untuk versi ini
- Sistem manajemen internal (absensi, tugas, manajemen proyek anggota)
- Login/akun untuk anggota
- Fitur pendaftaran otomatis dengan database kompleks

## 6. Kebutuhan Konten (Content Checklist)

Sebelum development, pengurus perlu menyiapkan:
- [ ] Logo COST (format PNG/vector)
- [ ] Teks profil klub (sejarah, visi, misi)
- [ ] Daftar & foto pengurus inti
- [ ] Daftar kegiatan/proker beserta foto
- [ ] Daftar prestasi/penghargaan
- [ ] Akun media sosial & kontak resmi

## 7. Timeline (Target <2 Minggu)

| Tahap | Durasi | Keterangan |
|---|---|---|
| Pengumpulan konten & aset | 2-3 hari | Pengurus menyiapkan teks & foto |
| Desain & pengembangan | 5-7 hari | Setup halaman sesuai scope |
| Review & revisi | 2 hari | Guru pembimbing & pengurus cek isi |
| Rilis (go-live) | 1 hari | Publikasi ke domain/hosting |

## 8. Kriteria Sukses (Success Metrics)

- Website live dan bisa diakses dalam waktu <2 minggu.
- Seluruh fitur "Must Have" berfungsi dengan baik di HP & laptop.
- Pengurus inti bisa melakukan update konten dasar secara mandiri.

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Konten (foto/teks) telat dikumpulkan | Tetapkan deadline pengumpulan konten di hari ke-3 |
| Pengurus belum familiar kelola website | Sediakan panduan singkat/video tutorial update konten |
| Kebutuhan berubah di tengah jalan | Fokuskan dulu ke fitur "Must Have", fitur lain masuk fase 2 |

## 10. Stack Teknis

- **Frontend:** HTML/CSS/JavaScript vanilla, satu halaman (one-page) dengan navigasi anchor. Tanpa framework.
- **Hosting:** Vercel (deploy statis dari repo Git).
- **Database:** Supabase (PostgreSQL). Tabel untuk pengurus, kegiatan, prestasi, dan kontak.
- **Kredensial:** `SUPABASE_URL` dan `SUPABASE_ANON_KEY` disimpan sebagai Environment Variables di Project Settings Vercel, bukan di dalam kode. Build script menuliskannya ke `js/config.js` saat deploy.
- **Akses data:** Bagian publik membaca isi tabel lewat supabase-js (anon key) dengan Row Level Security mode baca-untuk-semua.
- **Panel admin:** Tidak membuat sistem admin sendiri. Pengurus inti membuat akun Supabase (email/password), lalu mengedit konten lewat Supabase Dashboard (Table Editor). Tertulis 1–2 halaman panduan sebagai syarat butir 4.

## 11. Catatan Tambahan

Dokumen ini adalah draft awal dan bisa disesuaikan setelah diskusi lebih lanjut mengenai platform yang akan digunakan (misalnya: website builder seperti WordPress/Wix untuk kecepatan, atau custom code jika ada pengurus yang bisa coding).
