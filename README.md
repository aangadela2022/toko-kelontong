# Aplikasi Kasir Toko Kelontong (MVP)

Aplikasi kasir sederhana berbasis web untuk pengelolaan toko kelontong. Project ini mencakup frontend HTML/JS dan backend Node.js sederhana dengan SQLite.

## Fitur Utama
- **Manajemen Produk**: Tambah, edit, hapus, dan import produk via CSV (mendukung kolom Satuan).
- **Transaksi Kasir**: Scan barcode, autosuggest produk, keranjang belanja, dan hitung kembalian.
- **Laporan Penjualan**: Dashboard grafik (Chart.js) dan export laporan ke Excel (SheetJS).
- **Cetak Struk**: Format struk belanja untuk thermal printer.

## Cara Menjalankan

### 1. Persiapan Backend
Pastikan Anda memiliki [Node.js](https://nodejs.org/) terinstal.
```bash
cd backend
npm install
node server.js
```
Server akan berjalan di `http://localhost:3000`.

### 2. Menjalankan Frontend
Setelah backend berjalan, buka file berikut di browser Anda:
`kasir-app/index.html`

## Struktur Project
- `kasir-app/`: Berisi file frontend (HTML, CSS, JS).
- `backend/`: API Express.js dan database SQLite.
- `blueprint.md`: Dokumentasi teknis aplikasi.

## Lisensi
MIT
