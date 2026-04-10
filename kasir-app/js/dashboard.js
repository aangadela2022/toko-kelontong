// dashboard.js - Render Dashboard Charts

document.addEventListener('DOMContentLoaded', async () => {
    // Only run on dashboard
    if (!document.getElementById('salesChart')) return;

    try {
        // --- 1. Calculate Summary Cards ---
        const [harianRes, topRes, produkRes] = await Promise.all([
            window.api.getStatistikHarian(),
            window.api.getTopProduk(),
            window.api.getProduk()
        ]);
        
        const harianData = harianRes.data || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todayStats = harianData.find(d => d.tanggal === todayStr);

        document.getElementById('stat-trx-today').textContent = (todayStats && todayStats.omset > 0) ? 'Banyak' : '0'; // Actually backend only returned 'omset', we can just show revenue
        document.getElementById('stat-revenue-today').textContent = App.formatCurrency(todayStats ? todayStats.omset : 0);
        document.getElementById('stat-total-products').textContent = (produkRes.data || []).length;


        // --- 2. Chart: Penjualan 7 Hari Terakhir ---
        const last7Days = [];
        const salesData = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days.push(dateStr);
            
            const match = harianData.find(x => x.tanggal === dateStr);
            salesData.push(match ? match.omset : 0);
        }

        const ctxSales = document.getElementById('salesChart').getContext('2d');
        new Chart(ctxSales, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Pendapatan (Rp)',
                    data: salesData,
                    backgroundColor: 'rgba(67, 97, 238, 0.2)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // --- 3. Chart: Produk Terlaris ---
        const topItems = topRes.data || [];
        const labelsTop = topItems.map(i => i.nama.substring(0, 15) + (i.nama.length > 15 ? '...' : ''));
        const dataTop = topItems.map(i => i.total_terjual);

        const ctxTopProducts = document.getElementById('topProductsChart').getContext('2d');
        new Chart(ctxTopProducts, {
            type: 'bar',
            data: {
                labels: labelsTop,
                datasets: [{
                    label: 'Terjual (Qty)',
                    data: dataTop,
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(67, 97, 238, 0.7)',
                        'rgba(243, 156, 18, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(52, 73, 94, 0.7)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch(e) {
        console.error('Failed to load dashboard data:', e);
    }
});
