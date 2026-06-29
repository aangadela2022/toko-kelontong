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
     * Create control elements (camera selector and zoom slider)
     * @param {HTMLElement} readerDiv - Container div
     */
    createControlsElement(readerDiv) {
        const controlsDiv = document.createElement("div");
        controlsDiv.className = "scanner-controls";
        controlsDiv.style.marginTop = "10px";
        controlsDiv.style.display = "flex";
        controlsDiv.style.flexDirection = "column";
        controlsDiv.style.gap = "10px";
        controlsDiv.style.background = "#f9f9f9";
        controlsDiv.style.padding = "10px";
        controlsDiv.style.borderRadius = "8px";
        controlsDiv.style.border = "1px solid #eee";
        
        controlsDiv.innerHTML = `
            <div class="scanner-control-row scanner-camera-row" style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.85rem; font-weight: 600; color: #333; min-width: 70px;"><i class="fas fa-camera"></i> Kamera:</span>
                <select class="scanner-camera-select" style="flex: 1; padding: 6px 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 0.85rem; outline: none; background: white; cursor: pointer;"></select>
            </div>
            <div class="scanner-control-row scanner-zoom-row" style="display: none; align-items: center; gap: 10px;">
                <span style="font-size: 0.85rem; font-weight: 600; color: #333; min-width: 70px;"><i class="fas fa-search-plus"></i> Zoom:</span>
                <input type="range" class="scanner-zoom-slider" min="1" max="5" step="0.1" value="1" style="flex: 1; cursor: pointer; accent-color: var(--primary-color, #4f46e5);">
                <span class="scanner-zoom-value" style="font-size: 0.85rem; font-weight: 600; min-width: 35px; text-align: right; color: #666;">1.0x</span>
            </div>
        `;
        
        // Insert it before the first button (which is "Tutup Kamera")
        const closeBtn = readerDiv.querySelector("button");
        if (closeBtn) {
            readerDiv.insertBefore(controlsDiv, closeBtn);
        } else {
            readerDiv.appendChild(controlsDiv);
        }
        return controlsDiv;
    }

    /**
     * Setup zoom range slider based on track capabilities
     * @param {HTMLElement} readerDiv - Container div
     */
    setupZoomControl(readerDiv) {
        if (!this.html5QrCode) return;

        try {
            const trackCapabilities = this.html5QrCode.getRunningTrackCapabilities();
            
            let controlsDiv = readerDiv.querySelector(".scanner-controls");
            if (!controlsDiv) {
                controlsDiv = this.createControlsElement(readerDiv);
                const cameraRow = controlsDiv.querySelector(".scanner-camera-row");
                if (cameraRow) cameraRow.style.display = "none";
            }

            const zoomRow = controlsDiv.querySelector(".scanner-zoom-row");
            const zoomSlider = controlsDiv.querySelector(".scanner-zoom-slider");
            const zoomValueText = controlsDiv.querySelector(".scanner-zoom-value");

            if (trackCapabilities && trackCapabilities.zoom) {
                const minZoom = trackCapabilities.zoom.min || 1;
                const maxZoom = trackCapabilities.zoom.max || 5;
                const currentZoom = trackCapabilities.zoom.current || 1;

                zoomSlider.min = minZoom;
                zoomSlider.max = maxZoom;
                zoomSlider.step = ((maxZoom - minZoom) / 40).toFixed(1) || 0.1;
                zoomSlider.value = currentZoom;
                zoomValueText.textContent = `${Number(currentZoom).toFixed(1)}x`;

                zoomRow.style.display = "flex";

                zoomSlider.oninput = async () => {
                    const val = parseFloat(zoomSlider.value);
                    zoomValueText.textContent = `${val.toFixed(1)}x`;
                    try {
                        await this.html5QrCode.applyVideoConstraints({
                            advanced: [{ zoom: val }]
                        });
                    } catch (zoomErr) {
                        console.warn("Failed to apply zoom:", zoomErr);
                    }
                };
            } else {
                zoomRow.style.display = "none";
            }
        } catch (e) {
            console.warn("Zoom controls setup skipped or not supported:", e);
        }
    }

    /**
     * Fetch cameras and build switcher dropdown
     * @param {string} containerId - Element ID for video stream
     * @param {HTMLElement} readerDiv - Container div
     * @param {function} onResultCallback - Success callback
     * @param {object} config - Scanner config
     */
    async initializeControls(containerId, readerDiv, onResultCallback, config) {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length <= 1) {
                // Only 1 or no camera, don't show selector but check zoom support
                this.setupZoomControl(readerDiv);
                return;
            }

            let controlsDiv = readerDiv.querySelector(".scanner-controls");
            if (!controlsDiv) {
                controlsDiv = this.createControlsElement(readerDiv);
            }

            const selectEl = controlsDiv.querySelector(".scanner-camera-select");
            selectEl.innerHTML = "";

            cameras.forEach((camera, index) => {
                const option = document.createElement("option");
                option.value = camera.id;
                option.text = camera.label || `Kamera ${index + 1}`;
                selectEl.appendChild(option);
            });

            // Set running camera in dropdown (try to guess by scanning modes)
            const backCamera = cameras.find(c => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("environment") || c.label.toLowerCase().includes("belakang") || c.label.toLowerCase().includes("rear"));
            if (backCamera) {
                selectEl.value = backCamera.id;
            } else {
                selectEl.value = cameras[0].id;
            }

            // Handle switching
            selectEl.onchange = async () => {
                const selectedId = selectEl.value;
                await this.switchCamera(containerId, readerDiv, onResultCallback, selectedId, config);
            };

            this.setupZoomControl(readerDiv);
        } catch (e) {
            console.warn("Failed to initialize scanner controls:", e);
        }
    }

    /**
     * Switch camera stream dynamically
     */
    async switchCamera(containerId, readerDiv, onResultCallback, cameraId, config) {
        if (!this.html5QrCode) return;
        
        try {
            await this.html5QrCode.stop();
            
            await this.html5QrCode.start(
                cameraId,
                config,
                (decodedText) => {
                    this.stopScanner(readerDiv);
                    onResultCallback(decodedText);
                },
                (errorMessage) => {
                    // Suppress verbose scanner logs
                }
            );
            
            this.setupZoomControl(readerDiv);
        } catch (err) {
            console.error("Error switching camera:", err);
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
            
            // Limit formats to common grocery/product barcodes + QR codes for massive CPU optimization
            const formats = window.Html5QrcodeSupportedFormats ? [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.QR_CODE
            ] : undefined;

            this.html5QrCode = new Html5Qrcode(containerId, {
                formatsToSupport: formats,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            });
            
            // Highly sensitive config
            const config = { 
                fps: 60, // Maximum fps for fastest recognition
                disableFlip: false, // Allow scanning upside-down or mirrored barcodes
                qrbox: (width, height) => {
                    // Larger area to make scanning much easier without strict alignment
                    const boxWidth = Math.min(width * 0.95, 600);
                    const boxHeight = Math.min(height * 0.6, 400);
                    return { width: Math.floor(boxWidth), height: Math.floor(boxHeight) };
                }
            };

            // Strategy: Try multiple approaches to get back camera
            let started = false;

            // Approach 1: Find back camera by ID from device list
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length > 0) {
                    // Try to find back camera by label keywords
                    const backCamera = cameras.find(c => {
                        const label = (c.label || "").toLowerCase();
                        return label.includes("back") || 
                               label.includes("environment") || 
                               label.includes("belakang") || 
                               label.includes("rear") ||
                               label.includes("facing back") ||
                               label.includes("0, facing back");
                    });
                    
                    if (backCamera) {
                        await this.html5QrCode.start(
                            backCamera.id, 
                            config,
                            (decodedText) => {
                                this.stopScanner(readerDiv);
                                onResultCallback(decodedText);
                            },
                            () => {}
                        );
                        started = true;
                    } else if (cameras.length >= 2) {
                        // On most phones, the last camera is the back camera
                        await this.html5QrCode.start(
                            cameras[cameras.length - 1].id, 
                            config,
                            (decodedText) => {
                                this.stopScanner(readerDiv);
                                onResultCallback(decodedText);
                            },
                            () => {}
                        );
                        started = true;
                    }
                }
            } catch (e) {
                console.warn("Approach 1 (camera ID) failed:", e);
                started = false;
            }

            // Approach 2: Use facingMode exact constraint (strict)
            if (!started) {
                try {
                    await this.html5QrCode.start(
                        { facingMode: { exact: "environment" } }, 
                        config,
                        (decodedText) => {
                            this.stopScanner(readerDiv);
                            onResultCallback(decodedText);
                        },
                        () => {}
                    );
                    started = true;
                } catch (e) {
                    console.warn("Approach 2 (exact environment) failed:", e);
                }
            }

            // Approach 3: Use facingMode without exact (lenient fallback)
            if (!started) {
                await this.html5QrCode.start(
                    { facingMode: "environment" }, 
                    config,
                    (decodedText) => {
                        this.stopScanner(readerDiv);
                        onResultCallback(decodedText);
                    },
                    () => {}
                );
            }

            this.isScanning = true;
            console.log("Scanner started on", containerId);

            // Initialize custom camera and zoom controls after successful stream start
            await this.initializeControls(containerId, readerDiv, onResultCallback, config);
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
                if (readerDiv) {
                    readerDiv.classList.add("hidden");
                    const controls = readerDiv.querySelector(".scanner-controls");
                    if (controls) controls.remove();
                }
                console.log("Scanner stopped");
            } catch (err) {
                console.error("Error stopping scanner:", err);
                if (readerDiv) {
                    readerDiv.classList.add("hidden");
                    const controls = readerDiv.querySelector(".scanner-controls");
                    if (controls) controls.remove();
                }
                this.isScanning = false;
            }
        } else if (readerDiv) {
            readerDiv.classList.add("hidden");
            const controls = readerDiv.querySelector(".scanner-controls");
            if (controls) controls.remove();
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

