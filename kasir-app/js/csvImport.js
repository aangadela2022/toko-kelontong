// csvImport.js - Handle CSV Import

document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on produk page (check for the button)
    const btnImport = document.getElementById('btn-import-csv');
    const fileInput = document.getElementById('csv-file');

    if (!btnImport || !fileInput) return;

    btnImport.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi ekstensi
        if (file.name.split('.').pop().toLowerCase() !== 'csv') {
            alert('Harap upload file CSV!');
            fileInput.value = '';
            return;
        }

        // Parsing menggunakan PapaParse
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                const data = results.data;
                if (data && data.length > 0) {
                    await processCSVData(data);
                } else {
                    alert('File CSV kosong atau format tidak sesuai.');
                }
                fileInput.value = ''; // Reset input
            },
            error: function(error) {
                alert('Gagal membaca file CSV: ' + error.message);
                fileInput.value = '';
            }
        });
    });

    async function processCSVData(csvRows) {
        let successCount = 0;
        let updateCount = 0;
        let errorCount = 0;

        let currentProducts = [];
        try {
            const res = await window.api.getProduk();
            currentProducts = res.data || [];
        } catch (e) {
            console.error(e);
            alert('Gagal mengambil daftar produk lama');
        }

        for (let i = 0; i < csvRows.length; i++) {
            const row = csvRows[i];
            const barcode = row.barcode ? String(row.barcode).trim() : null;
            const nama = row.nama ? row.nama.trim() : null;
            
            const harga = row.harga ? Number(String(row.harga).replace(/[^0-9.-]+/g,"")) : 0;
            const stok = row.stok ? Number(String(row.stok).replace(/[^0-9.-]+/g,"")) : 0;
            const kategori = row.kategori ? row.kategori.trim() : 'Umum';
            const satuan = row.satuan ? row.satuan.trim() : 'Pcs';

            if (!barcode || !nama) {
                errorCount++;
                continue;
            }

            const existingIndex = currentProducts.findIndex(p => p.barcode === barcode);
            
            const newProduct = {
                barcode: barcode,
                nama: nama,
                harga: isNaN(harga) ? 0 : harga,
                stok: isNaN(stok) ? 0 : stok,
                kategori: kategori,
                satuan: satuan
            };

            if (existingIndex !== -1) {
                try {
                    const res = await window.api.updateProduk(barcode, newProduct);
                    if(!res.error) updateCount++; else errorCount++;
                } catch(e) { errorCount++; }
            } else {
                try {
                    const res = await window.api.addProduk(newProduct);
                    if(!res.error) successCount++; else errorCount++;
                } catch(e) { errorCount++; }
            }
        }

        alert(`Import Selesai!\n- Produk Baru: ${successCount}\n- Produk Diupdate: ${updateCount}\n- Gagal/Lewat: ${errorCount}`);
        
        // Render ulang tabel
        if (window.renderProductTable) {
            window.renderProductTable();
        }
    }
});
