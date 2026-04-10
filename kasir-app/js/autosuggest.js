// autosuggest.js - Handle live product search and suggestion on POS

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('barcode-input');
    const suggestionContainer = document.getElementById('autosuggest-container');
    if (!searchInput || !suggestionContainer) return;

    let searchTimeout = null;

    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (keyword.length < 2) {
            suggestionContainer.classList.add('hidden');
            return;
        }

        // Debounce search slightly to not lag on every keystroke
        searchTimeout = setTimeout(async () => {
            try {
                const res = await window.api.searchProduk(keyword);
                const matches = (res.data || []).slice(0, 10);
                renderSuggestions(matches);
            } catch (err) {
                console.error(err);
            }
        }, 150);
    });

    function renderSuggestions(matches) {
        suggestionContainer.innerHTML = '';
        
        if (matches.length === 0) {
            suggestionContainer.innerHTML = `<div style="padding: 10px; color: var(--text-secondary); text-align:center;">Produk tidak ditemukan</div>`;
            suggestionContainer.classList.remove('hidden');
            return;
        }

        matches.forEach((product, index) => {
            const div = document.createElement('div');
            div.className = 'autosuggest-item';
            div.innerHTML = `
                <div>
                    <div style="font-weight: 600;">${product.nama}</div>
                    <small style="color: var(--text-secondary);">${product.barcode}</small>
                </div>
                <div style="text-align: right;">
                    <strong style="color: var(--primary-color)">${App.formatCurrency(product.harga)}</strong>
                    <div style="font-size: 0.8rem; color: ${product.stok > 0 ? 'var(--text-secondary)' : 'var(--danger-color)'}">Stok: ${product.stok}</div>
                </div>
            `;
            
            div.addEventListener('click', async () => {
                if(product.stok > 0) {
                    if (window.TransactionManager) {
                        await TransactionManager.addToCart(product.barcode);
                        searchInput.value = '';
                        searchInput.focus();
                        suggestionContainer.classList.add('hidden');
                    }
                } else {
                    alert('Stok produk habis!');
                }
            });

            suggestionContainer.appendChild(div);
        });

        suggestionContainer.classList.remove('hidden');
    }

    // Hide suggestion globally if clicked outside
    document.addEventListener('click', (e) => {
        if (!suggestionContainer.contains(e.target) && e.target !== searchInput) {
            suggestionContainer.classList.add('hidden');
        }
    });
});
