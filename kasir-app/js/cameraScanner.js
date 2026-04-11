// cameraScanner.js - Wrapper for html5-qrcode library
// Refactored to use Html5Qrcode for better control over camera selection (facing back)

class CameraScanner {
    constructor() {
        this.html5QrCode = null;
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

    /**
     * Generic start scanner using Html5Qrcode for better camera control
     * @param {string} containerId - Element ID for the video stream
     * @param {HTMLElement} readerDiv - Container div to show/hide
     * @param {function} onResultCallback - Callback when barcode found
     */
    async startScanner(containerId, readerDiv, onResultCallback) {
        if (!window.Html5Qrcode) {
            console.error("html5-qrcode library not loaded!");
            return;
        }

        try {
            if (this.isScanning) {
                await this.stopScanner(null);
            }

            readerDiv.classList.remove("hidden");
            this.html5QrCode = new Html5Qrcode(containerId);
            
            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0
            };

            // Start scanning with prioritized back camera (environment)
            await this.html5QrCode.start(
                { facingMode: "environment" }, 
                config,
                (decodedText) => {
                    // Success callback
                    this.stopScanner(readerDiv);
                    onResultCallback(decodedText);
                },
                (errorMessage) => {
                    // Verbose error logs removed to avoid console spam
                }
            );

            this.isScanning = true;
            console.log("Scanner started on", containerId);
        } catch (err) {
            console.error("Error starting scanner:", err);
            alert("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
            readerDiv.classList.add("hidden");
            this.isScanning = false;
        }
    }

    async stopScanner(readerDiv) {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode.clear();
                this.html5QrCode = null;
                this.isScanning = false;
                if (readerDiv) readerDiv.classList.add("hidden");
                console.log("Scanner stopped");
            } catch (err) {
                console.error("Error stopping scanner:", err);
                // Fallback
                if (readerDiv) readerDiv.classList.add("hidden");
                this.isScanning = false;
            }
        } else if (readerDiv) {
            readerDiv.classList.add("hidden");
        }
    }

    async handleTransactionScan(barcode, inputField) {
        if (!window.api) return;
        
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

