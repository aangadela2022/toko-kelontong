Blueprint Sistem Aplikasi Kasir Toko Kelontong (Web Based MVP)
1. Tujuan Sistem

Aplikasi kasir ini dibuat sebagai MVP (Minimum Viable Product) dengan karakteristik:

Frontend only

Tidak menggunakan server/backend

Semua data disimpan di LocalStorage browser

Tujuan MVP:

validasi konsep aplikasi

digunakan oleh toko kecil

mudah dikembangkan ke versi backend nantinya

2. Arsitektur Sistem

Arsitektur aplikasi:

Browser
   │
   │
Frontend Web App
(HTML + CSS + JavaScript)
   │
   │
LocalStorage

Karakteristik:

tidak perlu instal database

bisa dijalankan offline

cukup membuka file index.html

3. Teknologi Sistem

Frontend:

HTML

CSS

JavaScript

Library tambahan:

html5-qrcode → scan barcode kamera HP

Chart.js → grafik penjualan

SheetJS → export Excel

PapaParse → import CSV

Penyimpanan:

LocalStorage (MVP)

IndexedDB (opsional upgrade)

4. Struktur Project
kasir-app/
│
├── index.html
├── produk.html
├── laporan.html
├── dashboard.html
├── pengaturan.html
│
├── css/
│   ├── style.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── produk.js
│   ├── transaksi.js
│   ├── laporan.js
│   ├── dashboard.js
│   ├── autosuggest.js
│   ├── barcode.js
│   ├── cameraScanner.js
│   ├── csvImport.js
│   ├── excelExport.js
│   ├── productDisplay.js
│   └── profileToko.js
│
├── printer/
│   └── thermalPrinter.js
│
├── assets/
│   ├── icon/
│   └── sound/
│
└── data/
    └── sample-produk.csv
5. Penyimpanan Data (LocalStorage)

Semua data disimpan di browser menggunakan LocalStorage.

Key yang digunakan:

produk_list
transaksi_list
cart
store_profile

Contoh penyimpanan:

localStorage.setItem("produk_list", JSON.stringify(data))

Contoh mengambil data:

let produk = JSON.parse(localStorage.getItem("produk_list"))
6. Struktur Data Sistem
Data Produk
{
  barcode: "899886660001",
  nama: "Indomie Goreng",
  harga: 3500,
  stok: 50,
  kategori: "Mie Instan",
  satuan: "Pcs"
}
Data Transaksi
{
  id: "TRX001",
  tanggal: "2026-03-14",
  items: [
    {
      barcode: "899886660001",
      nama: "Indomie Goreng",
      harga: 3500,
      qty: 2,
      satuan: "Pcs",
      subtotal: 7000
    }
  ],
  total: 7000,
  bayar: 10000,
  kembalian: 3000
}
Profil Toko
{
  nama_toko: "TOKO MAJU JAYA",
  alamat: "Jl. Merdeka No 10",
  no_hp: "08123456789"
}
7. Modul Sistem
7.1 Modul Profil Toko

Halaman: pengaturan.html

Fitur:

input nama toko

input alamat

input nomor HP

Layout:

Profil Toko

Nama Toko
[____________]

Alamat
[____________]

No HP
[____________]

[ Simpan ]

Data disimpan pada:

store_profile
7.2 Modul Manajemen Produk

Halaman: produk.html

Fitur:

tambah produk

edit produk

hapus produk

pencarian produk

import produk CSV

barcode produk

Layout:

Manajemen Produk

[ Import CSV ] [ Tambah Produk ]

Barcode | Nama | Harga | Stok | Aksi
Import Produk CSV

Format CSV:

barcode,nama,harga,stok,kategori,satuan
899886660001,Indomie Goreng,3500,50,Mie Instan,Pcs
899886660002,Indomie Soto,3500,40,Mie Instan,Pcs

Flow:

Upload CSV
↓
Parse CSV
↓
Validasi data
↓
Simpan ke LocalStorage
7.3 Modul Transaksi Penjualan

Halaman: index.html

Fitur utama:

scan barcode

scan kamera HP

autosuggest produk

tampilan harga besar

keranjang belanja

total pembayaran besar

input pembayaran

hitung kembalian

cetak struk

8. Autosuggest Produk

Autosuggest muncul ketika kasir mengetik nama atau barcode.

Input Produk

> ind

Indomie Goreng
Indomie Soto
Indomie Ayam Bawang
9. Tampilan Produk Setelah Scan
PRODUK TERPILIH

Indomie Goreng

Rp 3.500

Stok : 50

CSS:

.product-price{
font-size:64px;
font-weight:bold;
color:#27ae60;
}
10. Keranjang Belanja
Produk            Qty      Harga
----------------------------------
Indomie Goreng     2       7000
Aqua 600ml         1       4000
11. Total Pembayaran Besar
TOTAL BELANJA

Rp 11.000

CSS:

.total-display{
font-size:56px;
font-weight:bold;
}
12. Scan Barcode Menggunakan Kamera HP

Kasir dapat scan barcode menggunakan kamera HP.

Library:

html5-qrcode

Flow:

Klik tombol scan
↓
Kamera aktif
↓
Barcode terbaca
↓
Cari produk
↓
Produk masuk keranjang
13. Responsive Design (HP Friendly)

Aplikasi dapat digunakan di HP menggunakan responsive layout.

Teknologi:

CSS Flexbox

CSS Grid

Media Query

Contoh:

@media (max-width:768px){
.product-price{
font-size:48px;
}
}
14. Flow Transaksi Lengkap
Kasir membuka halaman kasir
↓
Kasir scan barcode / input produk
↓
Autosuggest muncul
↓
Produk ditemukan
↓
Harga produk muncul besar
↓
Produk masuk keranjang
↓
Kasir scan produk lain
↓
Total belanja dihitung
↓
Kasir input pembayaran
↓
Sistem menghitung kembalian
↓
Transaksi disimpan ke LocalStorage
↓
Cetak struk
15. Cetak Struk Thermal Printer

Struk mengambil data dari profil toko.

Contoh:

TOKO MAJU JAYA
Jl. Merdeka No 10
HP: 08123456789

--------------------------
Indomie Goreng   2   7000
Aqua 600ml       1   4000
--------------------------

TOTAL        11000
BAYAR        20000
KEMBALIAN     9000

14-03-2026
Terima Kasih
16. Modul Laporan

Halaman: laporan.html

Fitur:

laporan penjualan harian

laporan bulanan

barang paling laku

export Excel

17. Export Laporan Excel

Menggunakan SheetJS

Output:

laporan-penjualan.xlsx
18. Dashboard Grafik Penjualan

Halaman: dashboard.html

Grafik:

penjualan harian

penjualan bulanan

produk terlaris

Library:

Chart.js
19. Struktur JavaScript
storage.js
saveData()
getData()
deleteData()
produk.js
addProduk()
editProduk()
deleteProduk()
searchProduk()
findProdukByBarcode()
transaksi.js
addToCart()
removeFromCart()
calculateTotal()
processPayment()
saveTransaction()
autosuggest.js
searchProduk()
renderSuggestion()
selectSuggestion()
cameraScanner.js
startCameraScanner()
stopScanner()
handleBarcodeResult()
laporan.js
getMonthlyReport()
getTopSellingProducts()
excelExport.js
exportSalesReport()
dashboard.js
loadSalesChart()
loadMonthlyChart()
loadTopProductsChart()
profileToko.js
saveProfile()
getProfile()
updateProfile()