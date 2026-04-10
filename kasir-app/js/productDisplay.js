// productDisplay.js - Handle big highlight display for scanned item

const ProductDisplay = {
    element: null,

    init: function() {
        this.element = document.getElementById('product-highlight');
    },

    showTarget: function(product) {
        if (!this.element) this.init();
        if (!this.element) return;

        this.element.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: 500; color: var(--text-primary);">${product.nama}</div>
            <div class="product-price">${App.formatCurrency(product.harga)}</div>
            <div style="color: var(--text-secondary); margin-top: 5px;">Barcode: ${product.barcode} | Stok Sisa: <strong style="color: ${product.stok <= 5 ? 'var(--danger-color)' : 'inherit'}">${product.stok}</strong></div>
        `;
    },

    clearHighlight: function() {
        if (!this.element) this.init();
        if (!this.element) return;

        this.element.innerHTML = `<div class="empty-state" style="color:var(--text-secondary); font-size:1.1rem;">Belum ada produk terpilih</div>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ProductDisplay.init();
});
