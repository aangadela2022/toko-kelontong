const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Tabel Profil Toko
        db.run(`CREATE TABLE IF NOT EXISTS profil_toko (
            id INTEGER PRIMARY KEY DEFAULT 1,
            nama_toko TEXT,
            alamat TEXT,
            no_hp TEXT
        )`);

        // Tabel Produk
        db.run(`CREATE TABLE IF NOT EXISTS produk (
            barcode TEXT PRIMARY KEY,
            nama TEXT NOT NULL,
            harga INTEGER NOT NULL,
            stok INTEGER NOT NULL DEFAULT 0,
            kategori TEXT,
            satuan TEXT DEFAULT 'Pcs'
        )`);

        // Tabel Transaksi
        db.run(`CREATE TABLE IF NOT EXISTS transaksi (
            id TEXT PRIMARY KEY,
            tanggal TEXT NOT NULL,
            bayar INTEGER NOT NULL,
            kembalian INTEGER NOT NULL,
            total INTEGER NOT NULL
        )`);

        // Tabel Transaksi Items
        db.run(`CREATE TABLE IF NOT EXISTS transaksi_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaksi_id TEXT,
            barcode TEXT,
            nama TEXT,
            harga INTEGER,
            qty INTEGER,
            subtotal INTEGER,
            satuan TEXT,
            FOREIGN KEY(transaksi_id) REFERENCES transaksi(id)
        )`);
        
        // Add columns if they do not exist (migration for older DBs)
        db.run(`ALTER TABLE produk ADD COLUMN satuan TEXT DEFAULT 'Pcs'`, (err) => {});
        db.run(`ALTER TABLE transaksi_items ADD COLUMN satuan TEXT`, (err) => {});
        
        // Insert default profile
        db.run(`INSERT OR IGNORE INTO profil_toko (id, nama_toko, alamat, no_hp) VALUES (1, 'Toko Kelontong', 'Alamat Belum Diatur', '-')`);

        console.log('Database tables initialized.');
    });
}

module.exports = db;
