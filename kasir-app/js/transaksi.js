// transaksi.js - Handle shopping cart and checkout processes

const TransactionManager = {
    cart: [],
    
    // Load cart from temp storage if exists, or init empty
    init: function() {
        this.cart = Storage.get(STORAGE_KEYS.CART) || [];
        this.renderCart();
        this.updateTotals();
    },

    addToCart: async function(barcode, qtyToAdd = 1) {
        // Fetch product from API
        let res;
        try {
            res = await window.api.getProdukByBarcode(barcode);
        } catch(e) {
            console.error(e);
            alert('Gagal mengambil data produk!');
            return false;
        }

        const product = res && res.data ? res.data : null;
        
        if (!product) {
             alert('Produk tidak ditemukan!');
             return false;
        }

        // Check if already in cart
        const existingItemIndex = this.cart.findIndex(item => item.barcode === barcode);
        
        if (existingItemIndex !== -1) {
             // Incremenent Qty
             const newQty = this.cart[existingItemIndex].qty + qtyToAdd;
             
             // Check stok
             if(newQty > product.stok) {
                 alert(`Stok tidak mencukupi! Sisa stok: ${product.stok}`);
                 return false;
             }
             
             this.cart[existingItemIndex].qty = newQty;
             this.cart[existingItemIndex].subtotal = newQty * product.harga;
        } else {
             // Add new
             if(qtyToAdd > product.stok) {
                 alert(`Stok tidak mencukupi! Sisa stok: ${product.stok}`);
                 return false;
             }

             this.cart.push({
                 barcode: product.barcode,
                 nama: product.nama,
                 harga: product.harga,
                 qty: qtyToAdd,
                 satuan: product.satuan || 'Pcs',
                 subtotal: product.harga * qtyToAdd
             });
        }

        Storage.save(STORAGE_KEYS.CART, this.cart);
        this.renderCart();
        this.updateTotals();
        
        // Show highlight
        if(window.ProductDisplay) {
             window.ProductDisplay.showTarget(product);
        }
        
        return true;
    },

    updateQty: async function(barcode, newQty) {
        const itemIndex = this.cart.findIndex(i => i.barcode === barcode);
        if (itemIndex === -1) return;

        if (newQty <= 0) {
            this.removeFromCart(barcode);
            return;
        }

        // Check against stok
        let res;
        try {
            res = await window.api.getProdukByBarcode(barcode);
        } catch(e) {
            alert('Gagal mengambil stok produk');
            return;
        }
        const product = res && res.data ? res.data : null;
        
        if(product && newQty > product.stok) {
            alert(`Stok tidak mencukupi! Sisa stok: ${product.stok}`);
            // Revert UI to max cart qty valid
            this.renderCart();
            return;
        }

        this.cart[itemIndex].qty = newQty;
        this.cart[itemIndex].subtotal = newQty * this.cart[itemIndex].harga;
        
        Storage.save(STORAGE_KEYS.CART, this.cart);
        this.renderCart();
        this.updateTotals();
    },

    removeFromCart: function(barcode) {
        this.cart = this.cart.filter(i => i.barcode !== barcode);
        Storage.save(STORAGE_KEYS.CART, this.cart);
        this.renderCart();
        this.updateTotals();
    },

    clearCart: function() {
        this.cart = [];
        Storage.delete(STORAGE_KEYS.CART);
        this.renderCart();
        this.updateTotals();
        if(window.ProductDisplay) {
            window.ProductDisplay.clearHighlight();
        }
    },

    getTotal: function() {
        return this.cart.reduce((total, item) => total + item.subtotal, 0);
    },

    updateTotals: function() {
        const total = this.getTotal();
        document.getElementById('subtotal-display').textContent = App.formatCurrency(total);
        document.getElementById('total-display').textContent = App.formatCurrency(total);
        
        this.calculateChange(); // Recalculate change if payment input has value
    },

    paymentAmount: 0,

    setPayment: function(amount) {
        this.paymentAmount = amount;
        document.getElementById('payment-input').value = amount;
        this.calculateChange();
    },

    calculateChange: function() {
        const input = document.getElementById('payment-input');
        if(!input) return;
        
        const payAmount = Number(input.value) || 0;
        this.paymentAmount = payAmount;
        
        const total = this.getTotal();
        const changeDisplay = document.getElementById('change-display');
        const btnPay = document.getElementById('btn-pay');
        
        if (this.cart.length === 0) {
            changeDisplay.textContent = '0';
            changeDisplay.style.color = 'var(--text-secondary)';
            btnPay.disabled = true;
            return;
        }

        if (payAmount >= total) {
            const change = payAmount - total;
            changeDisplay.textContent = App.formatCurrency(change);
            changeDisplay.style.color = 'var(--success-color)';
            btnPay.disabled = false;
        } else {
            changeDisplay.textContent = 'Kurang ' + App.formatCurrency(total - payAmount);
            changeDisplay.style.color = 'var(--danger-color)';
            btnPay.disabled = true;
        }
    },

    processCheckout: async function() {
        if(this.cart.length === 0) return false;
        
        const total = this.getTotal();
        if(this.paymentAmount < total) {
             alert('Uang pembayaran kurang!');
             return false;
        }

        const transaction = {
             items: [...this.cart],
             total: total,
             bayar: this.paymentAmount,
             kembalian: this.paymentAmount - total
        };

        const btnPay = document.getElementById('btn-pay');
        btnPay.disabled = true;
        btnPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

        try {
            const res = await window.api.saveTransaksi(transaction);
            if(res.error) {
                alert('Gagal memproses transaksi: ' + res.error);
                btnPay.disabled = false;
                btnPay.innerHTML = '<i class="fas fa-check"></i> Proses & Cetak';
                return false;
            }

            // Transaksi berhasil
            const idTrx = res.id || App.generateId('TRX');
            
            // Format object for printer
            const printObj = {
                 id: idTrx,
                 tanggal: new Date().toISOString().split('T')[0],
                 waktu: new Date().toLocaleTimeString('id-ID'),
                 items: [...this.cart],
                 total: total,
                 bayar: this.paymentAmount,
                 kembalian: this.paymentAmount - total
            };

            // 4. Print Receipt
            if(window.ThermalPrinter) {
                 window.ThermalPrinter.printReceipt(printObj);
            }

            // 5. Clear Cart & UI
            this.clearCart();
            document.getElementById('payment-input').value = '';
            this.paymentAmount = 0;
            this.calculateChange();
            
            alert('Transaksi berhasil disimpan!');
            btnPay.innerHTML = '<i class="fas fa-check"></i> Proses & Cetak';

        } catch(e) {
            console.error(e);
            alert('Terjadi kesalahan jaringan');
            btnPay.disabled = false;
            btnPay.innerHTML = '<i class="fas fa-check"></i> Proses & Cetak';
        }
        
        return true;
    },

    renderCart: function() {
        const tbody = document.getElementById('cart-items');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        if (this.cart.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--text-secondary); padding:30px;">Keranjang kosong</td></tr>`;
            return;
        }

        this.cart.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight:600">${item.nama}</div>
                    <small style="color:var(--text-secondary)">${item.barcode}</small>
                </td>
                <td>${App.formatCurrency(item.harga)}</td>
                <td>
                    <div class="qty-input-group">
                        <button onclick="TransactionManager.updateQty('${item.barcode}', ${item.qty - 1})">-</button>
                        <input type="number" value="${item.qty}" min="1" 
                               onchange="TransactionManager.updateQty('${item.barcode}', parseInt(this.value) || 1)"
                               onfocus="this.select()">
                        <button onclick="TransactionManager.updateQty('${item.barcode}', ${item.qty + 1})">+</button>
                    </div>
                    <div style="text-align: center; font-size: 0.8rem; color: #666; margin-top: 4px;">
                        ${item.satuan || 'Pcs'}
                    </div>
                </td>
                <td style="font-weight:600">${App.formatCurrency(item.subtotal)}</td>
                <td>
                    <button class="btn btn-icon btn-delete btn-sm" onclick="TransactionManager.removeFromCart('${item.barcode}')" style="color:var(--danger-color)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
};

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if on index page
    if(!document.getElementById('cart-items')) return;

    TransactionManager.init();

    // Payment Input Binding
    const paymentInput = document.getElementById('payment-input');
    if (paymentInput) {
        paymentInput.addEventListener('input', () => {
            TransactionManager.calculateChange();
        });
    }

    // Quick Cash Buttons
    document.querySelectorAll('.quick-cash-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amount = e.target.dataset.amount;
            if (amount === 'exact') {
                TransactionManager.setPayment(TransactionManager.getTotal());
            } else {
                TransactionManager.setPayment(Number(amount));
            }
        });
    });

    // Action Buttons
    const btnCancel = document.getElementById('btn-cancel');
    const btnPay = document.getElementById('btn-pay');

    if(btnCancel) {
        btnCancel.addEventListener('click', () => {
            if(TransactionManager.cart.length > 0) {
                if(confirm('Batalkan transaksi dan kosongkan keranjang?')) {
                    TransactionManager.clearCart();
                }
            }
        });
    }

    if(btnPay) {
        btnPay.addEventListener('click', () => {
            TransactionManager.processCheckout();
        });
    }

    // Barcode Scanner Listener
    const searchInput = document.getElementById('barcode-input');
    if(searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
             // Jika enter ditekan, usahakan add to cart baris pertama hasil pencarian
             if (e.key === 'Enter') {
                  e.preventDefault();
                  
                  // Jika ada autosuggest yang aktif
                  const container = document.getElementById('autosuggest-container');
                  if(!container.classList.contains('hidden')) {
                       // Do nothing, let autosuggest handle it, or force first
                       return;
                  }

                  const keyword = searchInput.value.trim();
                  // Fetch barcode directly
                  const res = await window.api.getProdukByBarcode(keyword);
                  
                  if(res && res.data) {
                       await TransactionManager.addToCart(res.data.barcode);
                       searchInput.value = '';
                  } else {
                       alert('Barcode tidak ditemukan!');
                  }
             }
        });
    }
});
