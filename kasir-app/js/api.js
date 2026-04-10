const API_BASE_URL = 'http://localhost:3000/api';

const api = {
    // ----------------------
    // Produk API
    // ----------------------
    getProduk: async () => {
        const response = await fetch(`${API_BASE_URL}/produk`);
        return response.json();
    },
    
    getProdukByBarcode: async (barcode) => {
        const response = await fetch(`${API_BASE_URL}/produk/${barcode}`);
        return response.json();
    },

    searchProduk: async (keyword) => {
        const response = await fetch(`${API_BASE_URL}/produk/search?q=${keyword}`);
        return response.json();
    },

    addProduk: async (data) => {
        const response = await fetch(`${API_BASE_URL}/produk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateProduk: async (barcode, data) => {
        const response = await fetch(`${API_BASE_URL}/produk/${barcode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteProduk: async (barcode) => {
        const response = await fetch(`${API_BASE_URL}/produk/${barcode}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // ----------------------
    // Transaksi API
    // ----------------------
    saveTransaksi: async (data) => {
        const response = await fetch(`${API_BASE_URL}/transaksi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    getRecentTransaksi: async () => {
        const response = await fetch(`${API_BASE_URL}/transaksi`);
        return response.json();
    },

    // ----------------------
    // Profil Toko API
    // ----------------------
    getProfil: async () => {
        const response = await fetch(`${API_BASE_URL}/profil`);
        return response.json();
    },

    updateProfil: async (data) => {
        const response = await fetch(`${API_BASE_URL}/profil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // ----------------------
    // Statistik API
    // ----------------------
    getStatistikHarian: async () => {
        const response = await fetch(`${API_BASE_URL}/statistik/harian`);
        return response.json();
    },

    getStatistikBulanan: async () => {
        const response = await fetch(`${API_BASE_URL}/statistik/bulanan`);
        return response.json();
    },

    getTopProduk: async () => {
        const response = await fetch(`${API_BASE_URL}/statistik/top-produk`);
        return response.json();
    }
};

window.api = api;
