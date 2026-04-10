// thermalPrinter.js - Handle Receipt Generation & Web Printing

class Printer {
    static printReceipt(transaction) {
        const profile = Storage.get(STORAGE_KEYS.PROFILE) || {
            nama_toko: 'TOKO KELONTONG',
            alamat: 'Alamat belum disetting',
            no_hp: '-'
        };

        // Build Receipt HTML
        let receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Struk</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 12px;
                    width: 58mm; /* Thermal printer width */
                    margin: 0 auto;
                    padding: 0;
                    color: #000;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                
                .header { margin-bottom: 10px; }
                .header h3 { margin: 0; font-size: 16px; text-transform: uppercase; }
                .header p { margin: 2px 0; font-size: 11px;}
                
                .divider { border-top: 1px dashed #000; margin: 5px 0; }
                
                .info { margin-bottom: 10px; font-size: 11px; }
                .info div { display: flex; justify-content: space-between; }
                
                .items { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .items td { padding: 2px 0; vertical-align: top;}
                
                .summary { width: 100%; margin-top: 5px; }
                .summary tr td { padding: 2px 0; }
                
                .footer { margin-top: 15px; text-align: center; font-size: 11px; }
                
                /* Hide print button on print */
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header text-center">
                <h3>${profile.nama_toko}</h3>
                <p>${profile.alamat}</p>
                <p>HP: ${profile.no_hp}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="info">
                <div><span>Nota: ${transaction.id}</span></div>
                <div><span>Tgl: ${transaction.tanggal}</span> <span>${transaction.waktu}</span></div>
                <div><span>Kasir: Admin</span></div>
            </div>
            
            <div class="divider"></div>
            
            <table class="items">
        `;

        // Render Items
        transaction.items.forEach(item => {
            receiptHTML += `
                <tr>
                    <td colspan="3">${item.nama}</td>
                </tr>
                <tr>
                    <td>${item.qty} ${item.satuan || 'Pcs'} x ${item.harga}</td>
                    <td></td>
                    <td class="text-right">${item.subtotal}</td>
                </tr>
            `;
        });

        receiptHTML += `
            </table>
            
            <div class="divider"></div>
            
            <table class="summary">
                <tr class="font-bold">
                    <td>TOTAL</td>
                    <td class="text-right">${transaction.total}</td>
                </tr>
                <tr>
                    <td>BAYAR</td>
                    <td class="text-right">${transaction.bayar}</td>
                </tr>
                <tr>
                    <td>KEMBALI</td>
                    <td class="text-right">${transaction.kembalian}</td>
                </tr>
            </table>
            
            <div class="divider"></div>
            
            <div class="footer">
                <p>Terima Kasih</p>
                <p>Barang yang sudah dibeli<br>tidak dapat ditukar/dikembalikan.</p>
            </div>
            
            <div class="text-center no-print" style="margin-top:20px;">
                <button onclick="window.print()" style="padding:10px 20px; font-weight:bold; cursor:pointer;">CETAK SEKARANG</button>
                <button onclick="window.close()" style="padding:10px 20px; cursor:pointer;">TUTUP</button>
            </div>
            
            <script>
                // Auto print dialog when loaded
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
        `;

        // Open in new window
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.open();
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
    }
}

// Expose to window
window.ThermalPrinter = Printer;
