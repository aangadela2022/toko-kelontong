// cameraScanner.js - Wrapper for html5-qrcode library

class CameraScanner {
    constructor() {
        this.html5QrcodeScanner = null;
        this.containerId = "reader";
        this.readerContainer = document.getElementById("camera-reader-container");
        this.btnScan = document.getElementById("btn-scan-camera");
        this.btnClose = document.getElementById("btn-close-camera");
        this.searchInput = document.getElementById("barcode-input");
        this.isScanning = false;
        
        if(this.btnScan && this.readerContainer) {
            this.initListeners();
        }
    }

    initListeners() {
        this.btnScan.addEventListener('click', () => {
            if(!this.isScanning) {
                this.startScanner();
            }
        });

        this.btnClose.addEventListener('click', () => {
             this.stopScanner();
        });
    }

    startScanner() {
        this.readerContainer.classList.remove("hidden");
        
        if (!this.html5QrcodeScanner) {
             this.html5QrcodeScanner = new Html5QrcodeScanner(
                 this.containerId, 
                 { fps: 10, qrbox: {width: 250, height: 150} },
                 /* verbose= */ false
             );
        }

        this.html5QrcodeScanner.render(
            this.handleBarcodeResult.bind(this),
            this.handleBarcodeError.bind(this)
        );
        this.isScanning = true;
    }

    stopScanner() {
        if (this.html5QrcodeScanner) {
             this.html5QrcodeScanner.clear().then(() => {
                 this.readerContainer.classList.add("hidden");
                 this.isScanning = false;
             }).catch(error => {
                 console.error("Gagal stop scanner", error);
             });
        }
    }

    handleBarcodeResult(decodedText, decodedResult) {
         // Stop scanner on success to prevent multiple rapid scans of same item
         this.stopScanner();
         
         // Trigger search input
         if(this.searchInput) {
             this.searchInput.value = decodedText;
             // manually trigger enter logic defined in transaksi.js
             const products = Storage.get(STORAGE_KEYS.PRODUK) || [];
             const prod = products.find(p => p.barcode === decodedText);
             
             if(prod) {
                 if(window.TransactionManager) {
                     TransactionManager.addToCart(prod.barcode);
                     this.searchInput.value = '';
                 }
             } else {
                 alert('Barcode tidak ditemukan di database produk!');
                 this.searchInput.value = '';
             }
         }
    }

    handleBarcodeError(errorMessage) {
        // Ignored, library throws error continuously until a barcode is found
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AppScanner = new CameraScanner();
});
