const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ==========================================
// API PRODUK
// ==========================================

// Get all products
app.get('/api/produk', (req, res) => {
    db.all("SELECT * FROM produk", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Search products
app.get('/api/produk/search', (req, res) => {
    const term = req.query.q;
    if (!term) return res.json({ data: [] });

    db.all("SELECT * FROM produk WHERE nama LIKE ? OR barcode LIKE ?", [`%${term}%`, `%${term}%`], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get product by barcode
app.get('/api/produk/:barcode', (req, res) => {
    db.get("SELECT * FROM produk WHERE barcode = ?", [req.params.barcode], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: row });
    });
});

// Add product
app.post('/api/produk', (req, res) => {
    const { barcode, nama, harga, stok, kategori, satuan } = req.body;
    db.run(
        'INSERT INTO produk (barcode, nama, harga, stok, kategori, satuan) VALUES (?, ?, ?, ?, ?, ?)',
        [barcode, nama, harga, stok, kategori, satuan || 'Pcs'],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.status(201).json({ message: "Produk berhasil ditambahkan", barcode });
        }
    );
});

// Update product
app.put('/api/produk/:barcode', (req, res) => {
    const { nama, harga, stok, kategori, satuan } = req.body;
    db.run(
        'UPDATE produk SET nama = ?, harga = ?, stok = ?, kategori = ?, satuan = ? WHERE barcode = ?',
        [nama, harga, stok, kategori, satuan || 'Pcs', req.params.barcode],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: "Produk berhasil diperbarui", changes: this.changes });
        }
    );
});

// Delete product
app.delete('/api/produk/:barcode', (req, res) => {
    db.run('DELETE FROM produk WHERE barcode = ?', [req.params.barcode], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "Produk berhasil dihapus", changes: this.changes });
    });
});

// ==========================================
// API TRANSAKSI
// ==========================================

// Add Transaction (and reduce stock)
app.post('/api/transaksi', (req, res) => {
    const { items, total, bayar, kembalian } = req.body;
    
    // Generate transaction ID: TRX + YYYYMMDD + random 4 digits
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `TRX${dateStr}${randomNum}`;
    const tanggal = date.toISOString().split('T')[0];

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'INSERT INTO transaksi (id, tanggal, bayar, kembalian, total) VALUES (?, ?, ?, ?, ?)',
            [id, tanggal, bayar, kembalian, total],
            (err) => {
                if(err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }
            }
        );

        items.forEach(item => {
            // Insert item detail
            db.run(
                'INSERT INTO transaksi_items (transaksi_id, barcode, nama, harga, qty, subtotal, satuan) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, item.barcode, item.nama, item.harga, item.qty, item.subtotal, item.satuan || 'Pcs'],
                (err) => {
                    if(err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }
                }
            );

            // Update Stock
            db.run('UPDATE produk SET stok = stok - ? WHERE barcode = ?', [item.qty, item.barcode]);
        });

        db.run('COMMIT', (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Transaksi berhasil", id: id });
        });
    });
});

// Get recent transactions
app.get('/api/transaksi', (req, res) => {
    db.all("SELECT * FROM transaksi ORDER BY id DESC LIMIT 50", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

// ==========================================
// API PROFIL TOKO
// ==========================================

// Get profile
app.get('/api/profil', (req, res) => {
    db.get("SELECT * FROM profil_toko WHERE id = 1", [], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: row });
    });
});

// Update profile
app.put('/api/profil', (req, res) => {
    const { nama_toko, alamat, no_hp } = req.body;
    db.run(
        'UPDATE profil_toko SET nama_toko = ?, alamat = ?, no_hp = ? WHERE id = 1',
        [nama_toko, alamat, no_hp],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Profil berhasil diperbarui" });
        }
    );
});

// ==========================================
// API STATISTIK / DASHBOARD
// ==========================================

app.get('/api/statistik/harian', (req, res) => {
    const sql = `
        SELECT tanggal, SUM(total) as omset 
        FROM transaksi 
        GROUP BY tanggal 
        ORDER BY tanggal DESC 
        LIMIT 7
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows.reverse() }); // return in chronological order
    });
});

app.get('/api/statistik/bulanan', (req, res) => {
    const sql = `
        SELECT strftime('%Y-%m', tanggal) as bulan, SUM(total) as omset 
        FROM transaksi 
        GROUP BY bulan 
        ORDER BY bulan DESC 
        LIMIT 6
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows.reverse() });
    });
});

app.get('/api/statistik/top-produk', (req, res) => {
    const sql = `
        SELECT nama, SUM(qty) as total_terjual 
        FROM transaksi_items 
        GROUP BY barcode, nama 
        ORDER BY total_terjual DESC 
        LIMIT 5
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});


app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
