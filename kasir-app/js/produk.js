// produk.js - CRUD Operations for Products using API

class ProductManager {
    static async getProducts() {
        try {
            const res = await window.api.getProduk();
            return res.data || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    static async addProduct(product) {
        try {
            // let the backend handle the duplicates
            const res = await window.api.addProduk(product);
            if(res.error) {
                alert('Gagal: ' + res.error);
                return false;
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    static async editProduct(barcode, updatedProduct) {
        try {
            const res = await window.api.updateProduk(barcode, updatedProduct);
            if(res.error) {
                alert('Gagal: ' + res.error);
                return false;
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    static async deleteProduct(barcode) {
        try {
            const res = await window.api.deleteProduk(barcode);
            if(res.error) {
                alert('Gagal: ' + res.error);
                return false;
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    
    static async clearAllProducts() {
        if(confirm('Penghapusan massal tidak didukung saat ini.')) {
            return false;
        }
        return false;
    }

    static async searchProduct(keyword) {
        try {
            const res = await window.api.searchProduk(keyword);
            return res.data || [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    static async findByBarcode(barcode) {
        try {
            const res = await window.api.getProdukByBarcode(barcode);
            return res.data || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

// UI Handling Specifics
document.addEventListener('DOMContentLoaded', () => {
    // Only run on produk.html
    const productTable = document.getElementById('product-list-table');
    if (!productTable) return;

    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const btnAdd = document.getElementById('btn-add-product');
    const btnClear = document.getElementById('btn-clear-product');
    const searchInput = document.getElementById('search-product');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');

    // State
    let isEditing = false;
    let oldBarcode = null;

    // Render Table
    const renderTable = async (products = null) => {
        productTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
        const data = products || await ProductManager.getProducts();
        productTable.innerHTML = '';

        if (data.length === 0) {
            productTable.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada data produk</td></tr>`;
            return;
        }

        data.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.barcode}</td>
                <td style="font-weight: 500;">${product.nama}</td>
                <td><span style="background:#eee; padding:3px 8px; border-radius:12px; font-size:0.8rem;">${product.kategori}</span></td>
                <td>${product.satuan || 'Pcs'}</td>
                <td>${App.formatCurrency(product.harga)}</td>
                <td><span style="color: ${product.stok < 10 ? 'red' : 'inherit'}; font-weight: bold;">${product.stok}</span></td>
                <td>
                    <button class="btn btn-icon btn-edit" data-barcode="${product.barcode}" style="color: var(--warning-color);"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-icon btn-delete" data-barcode="${product.barcode}" style="color: var(--danger-color);"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productTable.appendChild(tr);
        });

        // Attach event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.barcode));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.barcode));
        });
    };

    // Initial render
    renderTable();

    // Modal Handling
    const openModal = () => {
        modal.style.display = 'block';
    };

    const closeModals = () => {
        modal.style.display = 'none';
        form.reset();
        isEditing = false;
        oldBarcode = null;
        modalTitle.textContent = "Tambah Produk";
        document.getElementById('pd-barcode').disabled = false;
    };

    btnAdd.addEventListener('click', () => {
        isEditing = false;
        oldBarcode = null;
        modalTitle.textContent = "Tambah Produk";
        form.reset();
        document.getElementById('pd-barcode').disabled = false;
        openModal();
    });

    closeModalBtn.addEventListener('click', () => {
        if(window.AppScanner) {
            const readerContainer = document.getElementById("camera-reader-container-product");
            window.AppScanner.stopScanner(readerContainer);
        }
        closeModals();
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModals();
    });

    const openEditModal = async (barcode) => {
        const product = await ProductManager.findByBarcode(barcode);
        if (product) {
            isEditing = true;
            oldBarcode = barcode;
            modalTitle.textContent = "Edit Produk";
            
            document.getElementById('pd-barcode').value = product.barcode;
            document.getElementById('pd-barcode').disabled = true; // Barcode shouldn't change
            document.getElementById('pd-nama').value = product.nama;
            document.getElementById('pd-kategori').value = product.kategori;
            document.getElementById('pd-satuan').value = product.satuan || 'Pcs';
            document.getElementById('pd-harga').value = product.harga;
            document.getElementById('pd-stok').value = product.stok;
            
            openModal();
        }
    };

    const handleDelete = async (barcode) => {
        if (confirm(`Hapus produk dengan barcode ${barcode}?`)) {
            const success = await ProductManager.deleteProduct(barcode);
            if (success) {
                renderTable();
            }
        }
    };

    btnClear.addEventListener('click', async () => {
        await ProductManager.clearAllProducts();
    });

    // Form Submit (Add/Edit)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newProduct = {
            barcode: document.getElementById('pd-barcode').value.trim(),
            nama: document.getElementById('pd-nama').value.trim(),
            kategori: document.getElementById('pd-kategori').value.trim() || 'Umum',
            satuan: document.getElementById('pd-satuan').value.trim() || 'Pcs',
            harga: Number(document.getElementById('pd-harga').value),
            stok: Number(document.getElementById('pd-stok').value)
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        let success = false;
        if (isEditing) {
            success = await ProductManager.editProduct(oldBarcode, newProduct);
        } else {
            success = await ProductManager.addProduct(newProduct);
        }

        submitBtn.disabled = false;

        if (success) {
            closeModals();
            renderTable();
        }
    });

    // Search with Debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const keyword = e.target.value.trim();
        searchTimeout = setTimeout(async () => {
            if (keyword.length > 0) {
                const results = await ProductManager.searchProduct(keyword);
                renderTable(results);
            } else {
                renderTable();
            }
        }, 300);
    });

    // Expose render function for csvImport.js to use
    window.renderProductTable = renderTable;

    // Product Scanner Init
    const btnScanProd = document.getElementById('btn-scan-product');
    const btnCloseScanProd = document.getElementById('btn-close-camera-product');
    const readerContainerProd = document.getElementById('camera-reader-container-product');
    const barcodeInput = document.getElementById('pd-barcode');

    if(btnScanProd && window.AppScanner) {
        btnScanProd.addEventListener('click', () => {
             window.AppScanner.startScanner("reader-product", readerContainerProd, (decodedText) => {
                 barcodeInput.value = decodedText;
             });
        });
        
        btnCloseScanProd.addEventListener('click', () => {
             window.AppScanner.stopScanner(readerContainerProd);
        });
    }
});
