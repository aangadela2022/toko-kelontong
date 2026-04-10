// profileToko.js
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on the settings page
    const profileForm = document.getElementById('profile-form');
    
    if (profileForm) {
        // Elements
        const storeNameInput = document.getElementById('store-name');
        const storeAddressInput = document.getElementById('store-address');
        const storePhoneInput = document.getElementById('store-phone');
        const saveNotification = document.getElementById('save-notification');

        // Load existing profile from API
        try {
            const res = await window.api.getProfil();
            const currentProfile = res.data || {};
            
            storeNameInput.value = currentProfile.nama_toko || '';
            storeAddressInput.value = currentProfile.alamat || '';
            storePhoneInput.value = currentProfile.no_hp || '';
        } catch(e) {
            console.error('Gagal mengambil profil', e);
        }

        // Handle Save
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnSubmit = profileForm.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            const newProfile = {
                nama_toko: storeNameInput.value.trim(),
                alamat: storeAddressInput.value.trim(),
                no_hp: storePhoneInput.value.trim()
            };

            try {
                await window.api.updateProfil(newProfile);
                
                // Show notification
                saveNotification.style.display = 'block';
                setTimeout(() => {
                    saveNotification.style.display = 'none';
                }, 3000);
                
                // Update UI globally if a function for that exists (will implement in app.js)
                if (typeof App !== 'undefined' && App.updateStoreInfoUI) {
                    App.updateStoreInfoUI();
                }
            } catch(e) {
                alert('Gagal menyimpan profil: ' + e.message);
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }
});
