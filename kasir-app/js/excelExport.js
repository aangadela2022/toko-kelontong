// excelExport.js - Handle Excel Export using SheetJS

document.addEventListener('DOMContentLoaded', () => {
    const btnExport = document.getElementById('btn-export-excel');
    if (!btnExport) return;

    btnExport.addEventListener('click', () => {
        const transactions = Storage.get(STORAGE_KEYS.TRANSAKSI) || [];
        const filterMonthInput = document.getElementById('filter-month');
        const monthFilter = filterMonthInput ? filterMonthInput.value : '';

        let dataToExport = transactions;
        if (monthFilter) {
            dataToExport = transactions.filter(trx => trx.tanggal.startsWith(monthFilter));
        }

        if (dataToExport.length === 0) {
            alert('Tidak ada data transaksi untuk diexport.');
            return;
        }

        // Format data for sheet
        const exportData = [];
        
        dataToExport.forEach(trx => {
            if (trx.items && trx.items.length > 0) {
                trx.items.forEach((item, index) => {
                    exportData.push({
                        "ID Transaksi": index === 0 ? trx.id : '',
                        "Tanggal": index === 0 ? trx.tanggal : '',
                        "Waktu": index === 0 ? trx.waktu : '',
                        "Barcode": item.barcode,
                        "Nama Item": item.nama,
                        "Harga Satuan": item.harga,
                        "Qty": item.qty,
                        "Satuan": item.satuan || 'Pcs',
                        "Subtotal": item.subtotal,
                        "Total Transaksi": index === 0 ? trx.total : ''
                    });
                });
            } else {
                // Fallback for empty items (should not happen in proper flow)
                exportData.push({
                    "ID Transaksi": trx.id,
                    "Tanggal": trx.tanggal,
                    "Waktu": trx.waktu,
                    "Total Transaksi": trx.total
                });
            }
        });

        // Generate workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

        // Styling widths
        const wscols = [
            {wch: 15}, // ID
            {wch: 12}, // Tanggal
            {wch: 10}, // Waktu
            {wch: 15}, // Barcode
            {wch: 25}, // Nama Item
            {wch: 12}, // Harga
            {wch: 5},  // Qty
            {wch: 8},  // Satuan
            {wch: 12}, // Subtotal
            {wch: 15}  // Total
        ];
        ws['!cols'] = wscols;

        // Save
        const fileName = `Laporan_Penjualan_${monthFilter || 'All'}.xlsx`;
        XLSX.writeFile(wb, fileName);
    });
});
