// storage.js - Wrapper for LocalStorage Operations

const STORAGE_KEYS = {
    PRODUK: 'produk_list',
    TRANSAKSI: 'transaksi_list',
    CART: 'cart',
    PROFILE: 'store_profile',
    DASHBOARD: 'dashboard_data' // optional cache
};

class Storage {
    // Save data to localStorage
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage [${key}]:`, error);
            return false;
        }
    }

    // Get data from localStorage
    static get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage [${key}]:`, error);
            return defaultValue;
        }
    }

    // Delete data from localStorage
    static delete(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error deleting from localStorage [${key}]:`, error);
            return false;
        }
    }

    // Clear all app data
    static clearAll() {
        if(confirm('Anda yakin ingin menghapus semua data aplikasi?')) {
            localStorage.clear();
            return true;
        }
        return false;
    }
}

// Global initialization check
document.addEventListener('DOMContentLoaded', () => {
    // Initialize default profile if none exists
    if (!Storage.get(STORAGE_KEYS.PROFILE)) {
        Storage.save(STORAGE_KEYS.PROFILE, {
            nama_toko: "TOKO KELONTONG",
            alamat: "Alamat Toko Belum Diatur",
            no_hp: "-"
        });
    }

    // Initialize products list if empty
    if (!Storage.get(STORAGE_KEYS.PRODUK)) {
        Storage.save(STORAGE_KEYS.PRODUK, []);
    }
    
    // Initialize transaction list if empty
    if (!Storage.get(STORAGE_KEYS.TRANSAKSI)) {
        Storage.save(STORAGE_KEYS.TRANSAKSI, []);
    }
    
    // Clear cart on fresh load just to be safe
    Storage.delete(STORAGE_KEYS.CART);
});
