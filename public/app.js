// API Configuration
const API_BASE_URL = window.location.origin;

// State Management
let cart = [];
let settings = {
    storeName: 'Toko Saya',
    storeAddress: 'Jl. Contoh No. 123',
    storePhone: '081234567890'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateDateTime();
    renderCategories();
    renderMenu();
    renderCart();
    setupEventListeners();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
});

// API Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Load settings from API
async function loadSettings() {
    try {
        const data = await apiRequest('/settings');
        settings = {
            storeName: data.storeName || 'Toko Saya',
            storeAddress: data.storeAddress || '',
            storePhone: data.storePhone || ''
        };
        
        document.getElementById('storeName').value = settings.storeName;
        document.getElementById('storeAddress').value = settings.storeAddress;
        document.getElementById('storePhone').value = settings.storePhone;
    } catch (error) {
        console.error('Error loading settings:', error);
        // Use default settings if API fails
    }
}

// Save settings to API
async function saveSettings() {
    try {
        settings.storeName = document.getElementById('storeName').value || 'Toko Saya';
        settings.storeAddress = document.getElementById('storeAddress').value || '';
        settings.storePhone = document.getElementById('storePhone').value || '';
        
        await apiRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
        
        alert('Pengaturan berhasil disimpan!');
        closeModal();
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Terjadi kesalahan saat menyimpan pengaturan');
    }
}

// Update Date Time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('id-ID', options);
}

// State untuk kategori aktif
let activeCategory = 'all';

// Render Categories
function renderCategories() {
    const categoriesContainer = document.getElementById('menuCategories');
    categoriesContainer.innerHTML = '';
    
    menuCategories.forEach(category => {
        const categoryBtn = document.createElement('button');
        categoryBtn.className = `category-btn ${activeCategory === category.id ? 'active' : ''}`;
        categoryBtn.textContent = category.name;
        categoryBtn.addEventListener('click', () => {
            activeCategory = category.id;
            renderCategories();
            renderMenu();
        });
        categoriesContainer.appendChild(categoryBtn);
    });
}

// Render Menu
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';
    
    // Filter menu berdasarkan kategori
    const filteredMenu = activeCategory === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === activeCategory);
    
    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px;">Tidak ada menu di kategori ini</p>';
        return;
    }
    
    filteredMenu.forEach(item => {
        const menuItem = document.createElement('button');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-price">Rp ${formatNumber(item.price)}</div>
        `;
        menuItem.addEventListener('click', () => addToCart(item));
        menuGrid.appendChild(menuItem);
    });
}

// Add to Cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    renderCart();
}

// Remove from Cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    renderCart();
}

// Update Quantity
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            renderCart();
        }
    }
}

// Render Cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Keranjang kosong</p>';
        subtotalEl.textContent = 'Rp 0';
        totalEl.textContent = 'Rp 0';
        return;
    }
    
    cartItems.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">Rp ${formatNumber(item.price)} x ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-price">Rp ${formatNumber(itemTotal)}</div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    subtotalEl.textContent = `Rp ${formatNumber(subtotal)}`;
    totalEl.textContent = `Rp ${formatNumber(subtotal)}`;
}

// Clear Cart
function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Yakin ingin menghapus semua item dari keranjang?')) {
        cart = [];
        renderCart();
    }
}

// Checkout
async function checkout() {
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const transaction = {
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        total: total
    };
    
    try {
        // Save transaction to database
        const result = await apiRequest('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction)
        });
        
        // Add ID from server response
        transaction.id = result.transactionId;
        transaction.date = new Date().toISOString();
        
        // Print Receipt
        printReceipt(transaction);
        
        // Clear cart
        cart = [];
        renderCart();
    } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Terjadi kesalahan saat menyimpan transaksi. Silakan coba lagi.');
    }
}

// Print Receipt
function printReceipt(transaction) {
    const printArea = document.getElementById('printArea');
    const date = new Date(transaction.date);
    const dateStr = date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    let itemsHtml = '';
    transaction.items.forEach(item => {
        itemsHtml += `
            <div class="receipt-item">
                <div>
                    <div>${item.name}</div>
                    <div style="font-size: 9px;">${item.quantity} x Rp ${formatNumber(item.price)}</div>
                </div>
                <div>Rp ${formatNumber(item.subtotal)}</div>
            </div>
        `;
    });
    
    printArea.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h2>${settings.storeName}</h2>
                <p>${settings.storeAddress}</p>
                <p>Telp: ${settings.storePhone}</p>
            </div>
            <div class="receipt-date">
                ${dateStr}<br>
                ${timeStr}
            </div>
            <div class="receipt-items">
                ${itemsHtml}
            </div>
            <div class="receipt-total">
                <span>TOTAL:</span>
                <span>Rp ${formatNumber(transaction.total)}</span>
            </div>
            <div class="receipt-footer">
                Terima kasih atas kunjungan Anda!
            </div>
        </div>
    `;
    
    // Trigger print
    window.print();
}

// Format Number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Modal Functions
function openModal() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Setup Event Listeners
function setupEventListeners() {
    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearCart);
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', openModal);
    
    // Close modal
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // Save settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('settingsModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Make functions global for onclick handlers
window.updateQuantity = updateQuantity;
