// app.js - General layout & generic utilities
const App = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format Date / Time
    updateDateTime: () => {
        const datetimeElement = document.getElementById('datetime-display');
        if (datetimeElement) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            datetimeElement.textContent = now.toLocaleDateString('id-ID', options);
        }
    },

    // Update Store Info
    updateStoreInfoUI: async () => {
        const nameDisplay = document.getElementById('store-name-display');
        if (nameDisplay) {
            let profile = Storage.get(STORAGE_KEYS.PROFILE);
            
            // Try fetching from API to ensure it's up to date
            try {
                if (window.api && window.api.getProfil) {
                    const res = await window.api.getProfil();
                    if (res && res.data) {
                        profile = res.data;
                        Storage.save(STORAGE_KEYS.PROFILE, profile);
                    }
                }
            } catch(e) {
                console.error("Failed to fetch profile for UI", e);
            }

            if (profile && profile.nama_toko) {
                nameDisplay.textContent = profile.nama_toko;
            } else {
                nameDisplay.textContent = 'Kasir MVP';
            }
        }
    },
    
    // Generate UUID for Transactions/Products
    generateId: (prefix = 'ID') => {
        const now = new Date();
        const datePart = now.getFullYear().toString().substr(-2) + 
                        (now.getMonth() + 1).toString().padStart(2, '0') + 
                        now.getDate().toString().padStart(2, '0');
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${datePart}-${randomPart}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize global UI features
    App.updateDateTime();
    setInterval(App.updateDateTime, 60000); // update every minute
    
    App.updateStoreInfoUI();
});
