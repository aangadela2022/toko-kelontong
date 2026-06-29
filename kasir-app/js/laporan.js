// laporan.js - Handle reporting views

document.addEventListener('DOMContentLoaded', () => {
    const reportTable = document.getElementById('report-data');
    if (!reportTable) return;

    const filterMonthInput = document.getElementById('filter-month');
    const btnFilter = document.getElementById('btn-filter');
    const btnClear = document.getElementById('btn-clear-history');
    
    // Set default month to current month (YYYY-MM)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    filterMonthInput.value = currentMonth;

    async function renderReport(monthFilter = null) {
        reportTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
        
        let transactions = [];
        try {
            const res = await window.api.getRecentTransaksi();
            transactions = res.data || [];
        } catch(e) {
            console.error('Gagal mengambil data transaksi', e);
        }

        reportTable.innerHTML = '';
        
        let filteredData = transactions;
        
        if (monthFilter) {
            filteredData = transactions.filter(trx => trx.tanggal.startsWith(monthFilter));
        }

        if (filteredData.length === 0) {
            reportTable.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:20px; color:var(--text-secondary);">Tidak ada transaksi pada bulan ini</td></tr>`;
            document.getElementById('report-total-qty').textContent = '0';
            document.getElementById('report-total-amount').textContent = '0';
            document.getElementById('report-title').textContent = monthFilter ? `Laporan Penjualan - ${monthFilter}` : 'Semua Laporan Penjualan';
            return;
        }

        // Urutkan dari yang terbaru
        filteredData.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));

        let totalAmount = 0;
        let totalItems = 0;

        filteredData.forEach(trx => {
            const tr = document.createElement('tr');
            
            // Backend currently doesn't return items with getRecentTransaksi 
            // wait, we need to check if items array is available or if we need to sum qty from another way
            // For now if items is null, we set qty to 0. It seems the backend getRecentTransaksi only returns `SELECT * FROM transaksi`
            // and NOT the items. We will set qtyPerInvoice to "-" because we don't have the items data.
            const qtyPerInvoice = trx.items ? trx.items.reduce((sum, item) => sum + item.qty, 0) : "-";
            
            totalAmount += trx.total;

            tr.innerHTML = `
                <td><span style="font-family:monospace; background:#eee; padding:2px 5px; border-radius:4px;">${trx.id}</span></td>
                <td>${trx.tanggal}</td>
                <td>-</td>
                <td class="text-right">${qtyPerInvoice}</td>
                <td class="text-right font-bold text-success">${App.formatCurrency(trx.total)}</td>
            `;
            reportTable.appendChild(tr);
        });

        // Update footer totals
        document.getElementById('report-total-qty').textContent = "-";
        document.getElementById('report-total-amount').textContent = App.formatCurrency(totalAmount);
        
        document.getElementById('report-title').textContent = monthFilter ? `Laporan Penjualan - ${monthFilter}` : 'Semua Laporan Penjualan';
    }

    // Initial render
    renderReport(currentMonth);

    // Filter
    btnFilter.addEventListener('click', () => {
        renderReport(filterMonthInput.value);
    });

    // Clear History
    if (btnClear) {
        btnClear.addEventListener('click', () => {
             alert('Fitur hapus riwayat melalui frontend dinonaktifkan pada versi arsitektur database server.');
        });
    }
});
