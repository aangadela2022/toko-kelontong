// cameraScanner.js - Wrapper for html5-qrcode library
// Updated to be more flexible for different pages/inputs

class CameraScanner {
    constructor() {
        this.html5QrcodeScanner = null;
        this.isScanning = false;
        
        // Auto-init for transaction page if elements exist
        this.initDefaultTransactionScanner();
    }

    initDefaultTransactionScanner() {
        const btnScan = document.getElementById("btn-scan-camera");
        const readerContainer = document.getElementById("camera-reader-container");
        const btnClose = document.getElementById("btn-close-camera");
        const searchInput = document.getElementById("barcode-input");

        if (btnScan && readerContainer && btnClose) {
            btnScan.addEventListener('click', () => {
                if (!this.isScanning) {
                    this.startScanner("reader", readerContainer, (decodedText) => {
                        if (searchInput) {
                            searchInput.value = decodedText;
                            this.handleTransactionScan(decodedText, searchInput);
                        }
                    });
                }
            });

            btnClose.addEventListener('click', () => {
                this.stopScanner(readerContainer);
            });
        }
    }

    // Generic start scanner
    startScanner(containerId, readerContainer, onResultCallback) {
        if (!window.Html5QrcodeScanner) {
            console.error("html5-qrcode library not loaded!");
            return;
        }

        readerContainer.classList.remove("hidden");
        
        if (!this.html5QrcodeScanner) {
            this.html5QrcodeScanner = new Html5QrcodeScanner(
                containerId, 
                { fps: 10, qrbox: { width: 250, height: 150 } },
                /* verbose= */ false
            );
        }

        this.html5QrcodeScanner.render((decodedText, decodedResult) => {
            // Stop on result
            this.stopScanner(readerContainer);
            onResultCallback(decodedText, decodedResult);
        }, (errorMessage) => {
            // Error ignored
        });
        
        this.isScanning = true;
    }

    stopScanner(readerContainer) {
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.clear().then(() => {
                if(readerContainer) readerContainer.classList.add("hidden");
                this.isScanning = false;
            }).catch(error => {
                console.error("Gagal stop scanner", error);
                if(readerContainer) readerContainer.classList.add("hidden");
                this.isScanning = false;
            });
        }
    }

    async handleTransactionScan(barcode, inputField) {
        const res = await window.api.getProdukByBarcode(barcode);
        const prod = res && res.data ? res.data : null;
        
        if (prod) {
            if (window.TransactionManager) {
                await TransactionManager.addToCart(prod.barcode);
                inputField.value = '';
            }
        } else {
            alert('Barcode tidak ditemukan di database produk!');
            inputField.value = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AppScanner = new CameraScanner();
});

