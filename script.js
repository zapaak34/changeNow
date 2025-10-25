<script>
// ===== CONFIGURATION CONSTANTS =====
const SESSION_DURATION = 24 * 60 * 60 * 1000;
const COUNTDOWN_DURATION = 300;
const MAX_FILE_SIZE = 1048576;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];

// ===== ENHANCED AUTHENTICATION SYSTEM =====
class UserAuth {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.sessionTimeout = null;
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleUserDropdown();
            });
        }
    }

    setupSessionManagement() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        this.sessionTimeout = setTimeout(() => {
            if (this.currentUser) {
                this.logout();
                this.showNotification('Session expired. Please login again.', 'warning');
            }
        }, SESSION_DURATION);
    }

    checkLoginStatus() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                
                if (user.expiresAt && Date.now() > user.expiresAt) {
                    localStorage.removeItem('currentUser');
                    this.updateUI();
                    return;
                }
                
                this.currentUser = user;
                this.isAdmin = user.role === 'admin';
                this.setupSessionManagement();
                this.updateUI();
                
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('currentUser');
                this.updateUI();
            }
        } else {
            this.updateUI();
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (!email || !password) {
            this.showNotification('Please enter both email and password', 'error');
            return;
        }

        await this.login(email, password);
    }

    async handleSignup() {
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;
        const confirmPassword = document.getElementById('signup-confirm')?.value;
        
        if (!email || !password || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        await this.signup(email, password, confirmPassword);
    }

    login(email, password) {
        return new Promise((resolve, reject) => {
            this.showLoading(true);
            
            setTimeout(() => {
                const users = [
                    { 
                        id: 1, 
                        email: 'user@example.com', 
                        password: 'password', 
                        name: 'John Doe', 
                        role: 'user',
                        avatar: 'J',
                        expiresAt: Date.now() + SESSION_DURATION
                    },
                    { 
                        id: 2, 
                        email: 'admin@example.com', 
                        password: 'admin123', 
                        name: 'Admin User', 
                        role: 'admin',
                        avatar: 'A',
                        expiresAt: Date.now() + SESSION_DURATION
                    }
                ];

                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = user;
                    this.isAdmin = user.role === 'admin';
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.setupSessionManagement();
                    this.updateUI();
                    this.showNotification('Login successful!', 'success');
                    closeLoginOverlay();
                    
                    if (this.isAdmin) {
                        showSection('admin');
                    } else {
                        showSection('dashboard');
                    }
                    
                    resolve(user);
                } else {
                    this.showNotification('Invalid email or password', 'error');
                    reject(new Error('Invalid email or password'));
                }
                
                this.showLoading(false);
            }, 1000);
        });
    }

    signup(email, password, confirmPassword) {
        return new Promise((resolve, reject) => {
            this.showLoading(true);

            setTimeout(() => {
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const userExists = existingUsers.some(u => u.email === email);
                
                if (userExists) {
                    this.showNotification('User already exists', 'error');
                    this.showLoading(false);
                    reject(new Error('User already exists'));
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    email: email,
                    password: password,
                    name: email.split('@')[0],
                    role: 'user',
                    avatar: email.charAt(0).toUpperCase(),
                    expiresAt: Date.now() + SESSION_DURATION
                };

                existingUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(existingUsers));

                this.currentUser = newUser;
                this.isAdmin = false;
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                this.setupSessionManagement();
                this.updateUI();
                this.showNotification('Account created successfully!', 'success');
                closeLoginOverlay();
                showSection('dashboard');
                
                this.showLoading(false);
                resolve(newUser);
            }, 1000);
        });
    }

    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
        
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.showNotification('Logged out successfully', 'info');
        showSection('home');
    }

    updateUI() {
        this.updateAuthUI();
    }

    updateAuthUI() {
        const connectBtn = document.getElementById('connect-btn');
        const userAvatar = document.getElementById('user-avatar');
        const userContainer = document.getElementById('user-container');
        const dashboardNav = document.getElementById('dashboard-nav');
        const adminNav = document.getElementById('admin-nav');
        
        const mobileDashboardNav = document.getElementById('mobile-dashboard-nav');
        const mobileAdminNav = document.getElementById('mobile-admin-nav');
        const mobileLogoutNav = document.getElementById('mobile-logout-nav');

        if (this.currentUser) {
            if (connectBtn) connectBtn.classList.add('hidden');
            if (userAvatar) {
                userAvatar.classList.remove('hidden');
                userAvatar.textContent = this.currentUser.avatar;
                userAvatar.setAttribute('title', this.currentUser.name);
            }
            if (userContainer) userContainer.classList.add('hidden');
            
            this.updateUserDropdownContent();
            
            if (dashboardNav) dashboardNav.classList.remove('hidden');
            if (mobileDashboardNav) mobileDashboardNav.classList.remove('hidden');
            if (mobileLogoutNav) mobileLogoutNav.classList.remove('hidden');
            
            if (this.isAdmin) {
                if (adminNav) adminNav.classList.remove('hidden');
                if (mobileAdminNav) mobileAdminNav.classList.remove('hidden');
            } else {
                if (adminNav) adminNav.classList.add('hidden');
                if (mobileAdminNav) mobileAdminNav.classList.add('hidden');
            }
        } else {
            if (connectBtn) connectBtn.classList.remove('hidden');
            if (userAvatar) userAvatar.classList.add('hidden');
            if (userContainer) userContainer.classList.add('hidden');
            if (dashboardNav) dashboardNav.classList.add('hidden');
            if (adminNav) adminNav.classList.add('hidden');
            if (mobileDashboardNav) mobileDashboardNav.classList.add('hidden');
            if (mobileAdminNav) mobileAdminNav.classList.add('hidden');
            if (mobileLogoutNav) mobileLogoutNav.classList.add('hidden');
        }
    }

    updateUserDropdownContent() {
        const adminMenuItem = document.getElementById('admin-menu-item');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (this.currentUser) {
            if (userName) userName.textContent = this.currentUser.name;
            if (userEmail) userEmail.textContent = this.currentUser.email;
            
            if (adminMenuItem) {
                adminMenuItem.style.display = this.isAdmin ? 'flex' : 'none';
            }
        }
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.custom-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `custom-notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${this.getNotificationClass(type)}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationClass(type) {
        switch (type) {
            case 'success': return 'bg-green-500 text-white';
            case 'error': return 'bg-red-500 text-white';
            case 'warning': return 'bg-yellow-500 text-black';
            case 'info': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading-overlay');
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }
}

// ===== GLOBAL AUTH INSTANCE =====
let auth = null;

// ===== GLOBAL LOGIN/SIGNUP FUNCTIONS =====
function login() {
    if (auth) {
        auth.handleLogin();
    } else {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        alert('System initializing, please try again in a moment');
    }
}

function signup() {
    if (auth) {
        auth.handleSignup();
    } else {
        const email = document.getElementById('signup-email')?.value;
        const password = document.getElementById('signup-password')?.value;
        const confirmPassword = document.getElementById('signup-confirm')?.value;
        
        if (!email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        alert('System initializing, please try again in a moment');
    }
}

// ===== USER DROPDOWN FUNCTIONS =====
function toggleUserDropdown() {
    if (!auth || !auth.currentUser) return;
    
    const userContainer = document.getElementById('user-container');
    const userAvatar = document.getElementById('user-avatar');
    
    if (!userContainer || !userAvatar) return;
    
    closeAllDropdowns();
    
    const isHidden = userContainer.classList.contains('hidden');
    userContainer.classList.toggle('hidden', !isHidden);
    
    updateUserDropdownContent();
    
    if (!userContainer.classList.contains('hidden')) {
        setTimeout(() => {
            document.addEventListener('click', closeUserDropdownOnClickOutside);
        }, 10);
    } else {
        document.removeEventListener('click', closeUserDropdownOnClickOutside);
    }
}

function updateUserDropdownContent() {
    if (!auth) return;
    
    const adminMenuItem = document.getElementById('admin-menu-item');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    if (auth.currentUser) {
        if (userName) userName.textContent = auth.currentUser.name;
        if (userEmail) userEmail.textContent = auth.currentUser.email;
        
        if (adminMenuItem) {
            adminMenuItem.style.display = auth.isAdmin ? 'flex' : 'none';
        }
    }
}

function closeUserDropdownOnClickOutside(event) {
    const userContainer = document.getElementById('user-container');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userContainer && userAvatar && 
        !userContainer.contains(event.target) && 
        !userAvatar.contains(event.target)) {
        closeUserDropdown();
    }
}

function closeUserDropdown() {
    const userContainer = document.getElementById('user-container');
    if (userContainer) {
        userContainer.classList.add('hidden');
    }
    document.removeEventListener('click', closeUserDropdownOnClickOutside);
}

function handleUserMenuClick(section) {
    closeUserDropdown();
    showSection(section);
}

// ===== MOBILE MENU FUNCTIONS =====
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
        
        closeUserDropdown();
        
        if (!mobileMenu.classList.contains('hidden')) {
            setTimeout(() => {
                document.addEventListener('click', closeMobileMenuOnClickOutside);
            }, 10);
        } else {
            document.removeEventListener('click', closeMobileMenuOnClickOutside);
        }
    }
}

function closeMobileMenuOnClickOutside(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    
    if (mobileMenu && mobileMenuToggle && 
        !mobileMenu.contains(event.target) && 
        !mobileMenuToggle.contains(event.target)) {
        closeMobileMenu();
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
    document.removeEventListener('click', closeMobileMenuOnClickOutside);
}

function toggleMobileSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    const arrow = document.getElementById(submenuId.replace('-submenu', '-arrow'));
    
    if (submenu && arrow) {
        submenu.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
    }
}

// ===== CORE APPLICATION DATA =====
let kycSubmissions = JSON.parse(localStorage.getItem('kycSubmissions') || '[]');
let countdownInterval = null;

// ===== UI FUNCTIONS =====
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
        
        if (sectionId === 'dashboard') {
            initializeDashboard();
        } else if (sectionId === 'admin') {
            initializeAdminPanel();
        }
    }
    
    closeMobileMenu();
    closeUserDropdown();
    
    window.scrollTo(0, 0);
}

function initializeDashboard() {
    addDashboardFooter();
    initializeTransactionsTable();
}

function addDashboardFooter() {
    const dashboardSection = document.getElementById('dashboard');
    if (!dashboardSection) return;
    
    if (document.getElementById('dashboard-footer')) return;
    
    const footer = document.createElement('footer');
    footer.id = 'dashboard-footer';
    footer.className = 'bg-gray-900 text-white py-8 mt-12';
    footer.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                    <p class="text-gray-400">&copy; 2024 CryptoExchange. All rights reserved.</p>
                </div>
                <div class="flex space-x-6">
                    <a href="#" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" class="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" class="text-gray-400 hover:text-white transition-colors">Support</a>
                </div>
            </div>
        </div>
    `;
    
    dashboardSection.appendChild(footer);
}

function initializeTransactionsTable() {
    const tableBody = document.getElementById('transactions-table-body');
    if (!tableBody) return;
    
    const mockTransactions = [
        { id: 1, type: 'Buy', asset: 'BTC', amount: '0.5', price: '$45,000', status: 'Completed', date: '2024-01-15' },
        { id: 2, type: 'Sell', asset: 'ETH', amount: '2.0', price: '$3,200', status: 'Completed', date: '2024-01-14' },
        { id: 3, type: 'Exchange', asset: 'BTC to ETH', amount: '0.1', price: 'Market', status: 'Pending', date: '2024-01-14' },
        { id: 4, type: 'Buy', asset: 'ADA', amount: '100', price: '$1.20', status: 'Completed', date: '2024-01-13' },
        { id: 5, type: 'Sell', asset: 'SOL', amount: '5.0', price: '$120', status: 'Failed', date: '2024-01-12' }
    ];
    
    tableBody.innerHTML = '';
    
    mockTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50 transition-colors';
        
        row.innerHTML = `
            <td class="py-3 px-4 text-center">${transaction.id}</td>
            <td class="py-3 px-4 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'Buy' ? 'bg-green-100 text-green-800' :
                    transaction.type === 'Sell' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                }">
                    ${transaction.type}
                </span>
            </td>
            <td class="py-3 px-4 text-center">${transaction.asset}</td>
            <td class="py-3 px-4 text-center">${transaction.amount}</td>
            <td class="py-3 px-4 text-center">${transaction.price}</td>
            <td class="py-3 px-4 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${transaction.status}
                </span>
            </td>
            <td class="py-3 px-4 text-center">${transaction.date}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function initializeAdminPanel() {
    initializeAdminTabs();
}

function initializeAdminTabs() {
    // Show default tab when admin panel loads
    const defaultTab = document.getElementById('admin-dashboard-tab');
    const defaultNav = document.querySelector('[onclick*="admin-dashboard"]');
    
    if (defaultTab && defaultNav) {
        showAdminTab('admin-dashboard', defaultNav);
    }
}

function showAdminTab(tabName, element) {
    if (!element) return;
    
    // Update navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active', 'bg-blue-600', 'text-white');
        item.classList.add('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
    });
    
    element.classList.add('active', 'bg-blue-600', 'text-white');
    element.classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
    
    // Hide all admin tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show the selected tab
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    // Special handling for specific tabs
    if (tabName === 'admin-kyc-tab') {
        updateKycTable();
    }
}

function showLoginOverlay() {
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'flex';
        document.getElementById('login-form')?.reset();
        document.getElementById('signup-form')?.reset();
    }
}

function closeLoginOverlay() {
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'none';
        document.getElementById('login-form')?.reset();
        document.getElementById('signup-form')?.reset();
    }
}

function showLoginTab(event, tabName) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.login-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        document.querySelectorAll('.login-tab').forEach(tab => {
            if (tab.textContent.toLowerCase().includes(tabName)) {
                tab.classList.add('active');
            }
        });
    }
    
    const targetContent = document.getElementById(`${tabName}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

function resetPassword() {
    const email = document.getElementById('reset-email')?.value;
    if (!email) {
        if (auth) {
            auth.showNotification('Please enter your email address', 'error');
        } else {
            alert('Please enter your email address');
        }
        return;
    }
    
    if (auth) {
        auth.showNotification(`Password reset instructions sent to ${email}`, 'info');
    } else {
        alert(`Password reset instructions sent to ${email}`);
    }
    
    showLoginTab(null, 'login');
    
    const resetForm = document.querySelector('#reset-content form');
    if (resetForm) resetForm.reset();
}

function logout() {
    if (auth) auth.logout();
}

// ===== HERO SECTION FUNCTIONS =====
function openExchangeModal() {
    if (!auth || !auth.currentUser) {
        showLoginOverlay();
        return;
    }
    openModal('exchange-modal');
}

function openBuyModal() {
    if (!auth || !auth.currentUser) {
        showLoginOverlay();
        return;
    }
    openModal('buy-modal');
}

function openSellModal() {
    if (!auth || !auth.currentUser) {
        showLoginOverlay();
        return;
    }
    openModal('sell-modal');
}

// ===== MODAL MANAGEMENT =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeExchangeModal() {
    closeModal('exchange-modal');
    stopCountdown();
}

function closeBuyModal() {
    closeModal('buy-modal');
}

function closeSellModal() {
    closeModal('sell-modal');
}

function completeExchange() {
    if (auth) auth.showNotification('Exchange completed successfully!', 'success');
    closeExchangeModal();
}

function completeBuy() {
    if (auth) auth.showNotification('Purchase completed successfully!', 'success');
    closeBuyModal();
}

function completeSell() {
    if (auth) auth.showNotification('Sale completed successfully!', 'success');
    closeSellModal();
}

// ===== EXCHANGE FUNCTIONS =====
function openCurrencyModal(type) {
    const currencyModal = document.getElementById('currency-modal');
    if (currencyModal) {
        currencyModal.style.display = 'flex';
        currencyModal.dataset.type = type;
    }
}

function closeCurrencyModal() {
    closeModal('currency-modal');
}

function selectCurrency(currency) {
    const currencyModal = document.getElementById('currency-modal');
    if (currencyModal) {
        const type = currencyModal.dataset.type;
        const targetElement = document.getElementById(`${type}-currency`);
        if (targetElement) {
            targetElement.textContent = currency;
            updateExchangeAmounts();
        }
    }
    closeCurrencyModal();
}

function swapCurrencies() {
    const sendCurrency = document.getElementById('send-currency');
    const receiveCurrency = document.getElementById('receive-currency');
    
    if (!sendCurrency || !receiveCurrency) return;
    
    const tempCurrency = sendCurrency.textContent;
    sendCurrency.textContent = receiveCurrency.textContent;
    receiveCurrency.textContent = tempCurrency;
    
    const sendAmount = document.getElementById('send-amount');
    const receiveAmount = document.getElementById('receive-amount');
    
    if (sendAmount && receiveAmount) {
        const tempAmount = sendAmount.value;
        sendAmount.value = receiveAmount.value;
        receiveAmount.value = tempAmount;
    }
}

function updateExchangeAmounts() {
    const rates = {
        'BTC': { 'ETH': 15.2, 'USD': 45000, 'EUR': 41000 },
        'ETH': { 'BTC': 0.065, 'USD': 3000, 'EUR': 2700 },
        'USD': { 'BTC': 0.000022, 'ETH': 0.00033, 'EUR': 0.85 },
        'EUR': { 'BTC': 0.000024, 'ETH': 0.00037, 'USD': 1.18 }
    };
    
    const sendCurrency = document.getElementById('send-currency')?.textContent;
    const receiveCurrency = document.getElementById('receive-currency')?.textContent;
    const sendAmount = document.getElementById('send-amount')?.value;
    
    if (sendCurrency && receiveCurrency && sendAmount && !isNaN(sendAmount) && sendAmount > 0) {
        const rate = rates[sendCurrency]?.[receiveCurrency];
        if (rate) {
            const receiveAmount = document.getElementById('receive-amount');
            if (receiveAmount) {
                receiveAmount.value = (sendAmount * rate).toFixed(6);
            }
        }
    }
}

function startCountdown() {
    let timeLeft = COUNTDOWN_DURATION;
    const countdownElement = document.getElementById('countdown');
    
    stopCountdown();
    
    countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (countdownElement) {
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft < 60) {
                countdownElement.className = 'text-red-400 font-bold';
            }
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            stopCountdown();
            closeExchangeModal();
            if (auth) auth.showNotification('Exchange time has expired. Please try again.', 'warning');
        }
    }, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// ===== DASHBOARD FUNCTIONS =====
function showDashboardTab(tabName, element = null) {
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    document.querySelectorAll('.dashboard-nav-item').forEach(item => {
        item.classList.remove('bg-[#ebecf0]', 'text-gray-800');
        item.classList.add('text-white');
    });
    
    if (element) {
        element.classList.add('bg-[#ebecf0]', 'text-gray-800');
        element.classList.remove('text-white');
    }
    
    const mobileSelect = document.querySelector('select[onchange*="showDashboardTab"]');
    if (mobileSelect) {
        mobileSelect.value = tabName;
    }
}

function showAddWalletModal() {
    openModal('add-wallet-modal');
}

function closeAddWalletModal() {
    closeModal('add-wallet-modal');
}

function addWallet() {
    const walletAddress = document.getElementById('wallet-address')?.value;
    const walletType = document.getElementById('wallet-type')?.value;
    
    if (!walletAddress) {
        if (auth) auth.showNotification('Please enter a wallet address', 'error');
        return;
    }
    
    if (!walletType) {
        if (auth) auth.showNotification('Please select a wallet type', 'error');
        return;
    }
    
    if (auth) auth.showNotification(`${walletType} wallet added successfully!`, 'success');
    closeAddWalletModal();
    
    const walletForm = document.querySelector('#add-wallet-modal form');
    if (walletForm) walletForm.reset();
}

// ===== KYC FUNCTIONS =====
function verifyKYC() {
    if (!auth || !auth.currentUser) {
        showLoginOverlay();
        return;
    }

    const documentType = document.querySelector('#kyc-form select')?.value;
    const fileInputs = document.querySelectorAll('#kyc-form input[type="file"]');
    const selfieFile = fileInputs[0]?.files[0];
    const frontPageFile = fileInputs[1]?.files[0];
    const backPageFile = fileInputs[2]?.files[0];
    
    if (!documentType) {
        if (auth) auth.showNotification('Please select a document type', 'error');
        return;
    }
    
    if (!selfieFile || !frontPageFile || !backPageFile) {
        if (auth) auth.showNotification('Please upload all required documents', 'error');
        return;
    }
    
    const allFiles = [selfieFile, frontPageFile, backPageFile];
    for (const file of allFiles) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            if (auth) auth.showNotification('Only PNG, JPG, JPEG, and PDF files are allowed', 'error');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            if (auth) auth.showNotification('Each file must be less than 1MB in size', 'error');
            return;
        }
    }
    
    const hasPendingSubmission = kycSubmissions.some(submission => 
        submission.email === auth.currentUser?.email && submission.status === 'Pending'
    );
    
    if (hasPendingSubmission) {
        if (auth) auth.showNotification('You already have a pending KYC verification. Please wait for it to be processed.', 'warning');
        return;
    }
    
    if (confirm('Are you sure you want to submit these documents for KYC verification?')) {
        const userData = auth.currentUser || { name: 'User', email: 'user@example.com' };
        
        const newSubmission = {
            id: Date.now(),
            number: kycSubmissions.length + 1,
            name: userData.name,
            email: userData.email,
            status: 'Pending',
            documentType: documentType,
            submissionDate: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };
        
        kycSubmissions.push(newSubmission);
        saveKYCSubmissions();
        
        const kycState = document.getElementById('kyc-state');
        if (kycState) kycState.classList.remove('hidden');
        
        updateKycTable();
        
        const kycForm = document.getElementById('kyc-form');
        if (kycForm) kycForm.reset();
        
        if (auth) auth.showNotification('KYC verification submitted successfully! You will be notified via email once your documents have been reviewed.', 'success');
    }
}

function updateKycTable() {
    const tableBody = document.getElementById('kyc-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const sortedSubmissions = [...kycSubmissions].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedSubmissions.forEach(submission => {
        const row = document.createElement('tr');
        row.className = 'border-b border-[#46475d] hover:bg-[#3e3e59] transition-colors kyc-row cursor-pointer';
        row.dataset.id = submission.id;
        
        row.innerHTML = `
            <td class="py-3 px-4">${submission.number}</td>
            <td class="py-3 px-4">${submission.name}</td>
            <td class="py-3 px-4">${submission.email}</td>
            <td class="py-3 px-4">
                <span class="${getKycStatusClass(submission.status)}">${submission.status}</span>
            </td>
            <td class="py-3 px-4">${submission.submissionDate}</td>
        `;
        
        row.addEventListener('click', function() {
            selectKycRow(this);
        });
        
        tableBody.appendChild(row);
    });
}

function getKycStatusClass(status) {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch(status) {
        case 'Approved': return `${baseClasses} bg-green-500/20 text-green-300`;
        case 'Pending': return `${baseClasses} bg-yellow-500/20 text-yellow-300`;
        case 'Cancelled': return `${baseClasses} bg-red-500/20 text-red-300`;
        default: return baseClasses;
    }
}

function selectKycRow(row) {
    document.querySelectorAll('.kyc-row').forEach(r => {
        r.classList.remove('selected', 'bg-[#4a4b6d]');
    });
    
    row.classList.add('selected', 'bg-[#4a4b6d]');
}

function saveKYCSubmissions() {
    localStorage.setItem('kycSubmissions', JSON.stringify(kycSubmissions));
}

function loadKYCSubmissions() {
    const saved = localStorage.getItem('kycSubmissions');
    if (saved) {
        kycSubmissions = JSON.parse(saved);
        updateKycTable();
        
        if (kycSubmissions.length > 0 && auth && auth.currentUser) {
            const kycState = document.getElementById('kyc-state');
            if (kycState) kycState.classList.remove('hidden');
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function closeAllDropdowns() {
    closeUserDropdown();
    closeMobileMenu();
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    auth = new UserAuth();
    auth.init();
    
    loadKYCSubmissions();
    initializeModals();
    
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                stopCountdown();
            }
        });
    });
    
    const sendAmountInput = document.getElementById('send-amount');
    if (sendAmountInput) {
        sendAmountInput.addEventListener('input', updateExchangeAmounts);
    }
    
    document.querySelectorAll('.currency-item').forEach(item => {
        item.addEventListener('click', function() {
            const currency = this.dataset.currency;
            selectCurrency(currency);
        });
    });
    
    document.querySelectorAll('.exchange-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            document.querySelectorAll('.exchange-tab').forEach(t => {
                t.classList.remove('active-tab');
                t.classList.add('text-[#aeb0bd]', 'bg-[#30303e]');
            });
            this.classList.add('active-tab');
            this.classList.remove('text-[#aeb0bd]', 'bg-[#30303e]');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(`${tabName}-tab-content`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#user-avatar') && !e.target.closest('#user-container')) {
            closeUserDropdown();
        }
        if (!e.target.closest('#mobile-menu-toggle') && !e.target.closest('#mobile-menu')) {
            closeMobileMenu();
        }
    });
    
    window.addEventListener('beforeunload', function() {
        saveKYCSubmissions();
    });
	
	// Initialize member animations
    initMemberAnimations();
	
	// Initialize contact manager
    initContactManager();
    
    // Initialize editable fields in admin panel
    initEditableFields();
});

function initializeModals() {
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
                stopCountdown();
            }
        });
    });
}

// Create loading overlay if it doesn't exist
if (!document.getElementById('loading-overlay')) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden';
    loadingOverlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="text-gray-700">Processing...</span>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
}
	   
	   
	   // Partners scrolling animation
function initPartnersScroll() {
    const scrollContainer = document.getElementById('partnersScroll');
    if (!scrollContainer) return;

    // Clone the partner items for seamless scrolling
    const partnerItems = scrollContainer.innerHTML;
    scrollContainer.innerHTML = partnerItems + partnerItems;

    let scrollPosition = 0;
    const scrollSpeed = 1;

    function scrollPartners() {
        scrollPosition -= scrollSpeed;
        if (Math.abs(scrollPosition) >= scrollContainer.scrollWidth / 2) {
            scrollPosition = 0;
        }
        scrollContainer.style.transform = `translateX(${scrollPosition}px)`;
        requestAnimationFrame(scrollPartners);
    }

    // Pause on hover
    scrollContainer.addEventListener('mouseenter', () => {
        scrollSpeed = 0;
    });

    scrollContainer.addEventListener('mouseleave', () => {
        scrollSpeed = 1;
    });

    scrollPartners();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPartnersScroll);
	   
	   
	   // Testimonials Carousel
function initTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicatorsContainer = document.getElementById('carouselIndicators');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    let autoPlayInterval;
    
    // Get number of slides to show based on screen size
    function getSlidesPerView() {
        if (window.innerWidth < 768) return 1;
        return 3;
    }
    
    // Create indicator dots
    function createIndicators() {
        const totalSlides = slides.length;
        const slidesPerView = getSlidesPerView();
        const totalIndicators = Math.ceil(totalSlides / slidesPerView);
        
        for (let i = 0; i < totalIndicators; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${i === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to testimonial group ${i + 1}`);
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
    }
    
    // Update carousel position
    function updateCarousel() {
        const slidesPerView = getSlidesPerView();
        const slideWidth = 100 / slidesPerView;
        const translateX = -currentIndex * slideWidth;
        track.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Update button states
        const maxIndex = Math.ceil(slides.length / slidesPerView) - 1;
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }
    
    // Go to next slide
    function nextSlide() {
        const slidesPerView = getSlidesPerView();
        const maxIndex = Math.ceil(slides.length / slidesPerView) - 1;
        
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop back to start
        }
        updateCarousel();
    }
    
    // Go to previous slide
    function prevSlide() {
        const slidesPerView = getSlidesPerView();
        const maxIndex = Math.ceil(slides.length / slidesPerView) - 1;
        
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex; // Loop to end
        }
        updateCarousel();
    }
    
    // Go to specific slide
    function goToSlide(index) {
        const slidesPerView = getSlidesPerView();
        const maxIndex = Math.ceil(slides.length / slidesPerView) - 1;
        currentIndex = Math.min(Math.max(index, 0), maxIndex);
        updateCarousel();
        resetAutoPlay();
    }
    
    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000); // Change every 5 seconds
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }
    
    // Pause auto-play on hover
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoPlay();
    });
    
    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoPlay();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (startX - endX > swipeThreshold) {
            nextSlide();
        } else if (endX - startX > swipeThreshold) {
            prevSlide();
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        updateCarousel();
    });
    
    // Initialize
    createIndicators();
    updateCarousel();
    startAutoPlay();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTestimonialCarousel);
	   
	   // Testimonials Loop Scrolling (like partners section)
function initTestimonialsScroll() {
    const scrollTrack = document.getElementById('testimonialsScroll');
    if (!scrollTrack) return;

    // Clone testimonials for seamless looping
    const testimonials = scrollTrack.innerHTML;
    scrollTrack.innerHTML = testimonials + testimonials;

    let animationId;
    let scrollSpeed = 1;
    let scrollPosition = 0;
    const baseSpeed = 0.5; // Adjust this value to control speed

    function animateScroll() {
        const trackWidth = scrollTrack.scrollWidth / 2; // Since we duplicated
        scrollPosition -= scrollSpeed * baseSpeed;
        
        // Reset position when scrolled one full set
        if (Math.abs(scrollPosition) >= trackWidth) {
            scrollPosition = 0;
        }
        
        scrollTrack.style.transform = `translateX(${scrollPosition}px)`;
        animationId = requestAnimationFrame(animateScroll);
    }

    // Pause on hover
    scrollTrack.addEventListener('mouseenter', () => {
        scrollSpeed = 0;
    });

    scrollTrack.addEventListener('mouseleave', () => {
        scrollSpeed = 1;
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animationId = requestAnimationFrame(animateScroll);
        }
    });

    // Start animation
    animateScroll();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTestimonialsScroll);
	   
	   // FAQ Accordion Functionality
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = this.nextElementSibling;
            const icon = this.querySelector('svg');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    const otherAnswer = item.querySelector('.faq-answer');
                    const otherIcon = item.querySelector('.faq-question svg');
                    otherAnswer.classList.remove('open');
                    otherAnswer.classList.add('hidden');
                    otherIcon.classList.remove('rotate-180');
                    item.querySelector('.faq-question').classList.remove('active');
                }
            });
            
            // Toggle current item
            const isOpen = answer.classList.contains('open');
            
            if (isOpen) {
                // Close current item
                answer.classList.remove('open');
                setTimeout(() => {
                    answer.classList.add('hidden');
                }, 300);
                icon.classList.remove('rotate-180');
                this.classList.remove('active');
            } else {
                // Open current item
                answer.classList.remove('hidden');
                setTimeout(() => {
                    answer.classList.add('open');
                }, 10);
                icon.classList.add('rotate-180');
                this.classList.add('active');
            }
        });
    });
    
    // Open first FAQ by default
    const firstFaq = document.querySelector('.faq-item');
    if (firstFaq) {
        const firstAnswer = firstFaq.querySelector('.faq-answer');
        const firstIcon = firstFaq.querySelector('.faq-question svg');
        const firstQuestion = firstFaq.querySelector('.faq-question');
        
        firstAnswer.classList.remove('hidden');
        setTimeout(() => {
            firstAnswer.classList.add('open');
        }, 10);
        firstIcon.classList.add('rotate-180');
        firstQuestion.classList.add('active');
    }
}

// Initialize FAQ accordion when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFAQAccordion();
});
	   
	   // Member Avatar +1 Animation
function initMemberAnimations() {
    const memberAvatars = document.querySelectorAll('.member-avatar');
    let animationInterval;
    
    function getRandomTime() {
        return Math.floor(Math.random() * 7000) + 3000; // 3-10 seconds
    }
    
    function triggerRandomAnimation() {
        if (memberAvatars.length === 0) return;
        
        // Get random avatar
        const randomIndex = Math.floor(Math.random() * memberAvatars.length);
        const randomAvatar = memberAvatars[randomIndex];
        const plusOne = randomAvatar.querySelector('.plus-one-animation');
        
        if (plusOne) {
            // Reset animation
            plusOne.classList.remove('active');
            
            // Trigger reflow
            void plusOne.offsetWidth;
            
            // Add active class to trigger animation
            plusOne.classList.add('active');
            
            // Add pulse effect to avatar
            randomAvatar.classList.add('pulse');
            setTimeout(() => {
                randomAvatar.classList.remove('pulse');
            }, 1000);
        }
        
        // Schedule next animation
        const nextTime = getRandomTime();
        animationInterval = setTimeout(triggerRandomAnimation, nextTime);
    }
    
    // Start the animation cycle
    function startAnimations() {
        const initialDelay = getRandomTime();
        animationInterval = setTimeout(triggerRandomAnimation, initialDelay);
    }
    
    // Stop animations (useful if you need to stop them later)
    function stopAnimations() {
        if (animationInterval) {
            clearTimeout(animationInterval);
        }
    }
    
    // Initialize
    startAnimations();
    
    // Return functions for external control if needed
    return {
        start: startAnimations,
        stop: stopAnimations
    };
}
	   
	   
	   // Contact Buttons Management
class ContactManager {
    constructor() {
        this.companyData = this.loadCompanyData();
        this.init();
    }

    init() {
        this.updateContactButtons();
        this.setupEventListeners();
    }

    loadCompanyData() {
        const savedData = localStorage.getItem('companyContactData');
        if (savedData) {
            return JSON.parse(savedData);
        }
        
        // Default data
        return {
            whatsapp: '+14372766001',
            telegram: '@ChangeNowSupport',
            phone: '+1 (437) 276-6000',
            email: 'contact@changenow.com'
        };
    }

    saveCompanyData() {
        localStorage.setItem('companyContactData', JSON.stringify(this.companyData));
    }

    updateCompanyData(field, value) {
        this.companyData[field] = value;
        this.saveCompanyData();
        this.updateContactButtons();
    }

    setupEventListeners() {
        // Listen for changes in admin panel
        document.addEventListener('companyDataUpdated', (event) => {
            this.companyData = event.detail;
            this.updateContactButtons();
        });

        // WhatsApp button click
        document.getElementById('whatsapp-btn')?.addEventListener('click', (e) => {
            this.openWhatsApp();
        });

        // Telegram button click
        document.getElementById('telegram-btn')?.addEventListener('click', (e) => {
            this.openTelegram();
        });
    }

    formatWhatsAppNumber(number) {
        // Remove all non-digit characters except +
        return number.replace(/[^\d+]/g, '');
    }

    formatTelegramUsername(username) {
        // Remove @ if present and ensure proper format
        return username.replace('@', '');
    }

    openWhatsApp() {
        const phoneNumber = this.formatWhatsAppNumber(this.companyData.whatsapp || this.companyData.phone);
        const message = encodeURIComponent("Hi, I'd like to get more information about your services");
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    openTelegram() {
        const username = this.formatTelegramUsername(this.companyData.telegram);
        const url = `https://t.me/${username}`;
        
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    updateContactButtons() {
        const whatsappBtn = document.getElementById('whatsapp-btn');
        const telegramBtn = document.getElementById('telegram-btn');

        if (whatsappBtn) {
            const phoneNumber = this.formatWhatsAppNumber(this.companyData.whatsapp || this.companyData.phone);
            const message = encodeURIComponent("Hi, I'd like to get more information about your services");
            whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${message}`;
        }

        if (telegramBtn) {
            const username = this.formatTelegramUsername(this.companyData.telegram);
            telegramBtn.href = `https://t.me/${username}`;
        }
    }

    // Method to update from admin panel
    updateFromAdminPanel(data) {
        this.companyData = { ...this.companyData, ...data };
        this.saveCompanyData();
        this.updateContactButtons();
    }
}

// Initialize contact manager
let contactManager = null;

function initContactManager() {
    contactManager = new ContactManager();
}
	   
	   
	   // Update the save functionality in admin panel
function saveCompanyChanges() {
    const companyData = {
        email: document.querySelector('[data-field="email"] .field-value').textContent,
        phone: document.querySelector('[data-field="phone"] .field-value').textContent,
        whatsapp: document.querySelector('[data-field="whatsapp"] .field-value').textContent,
        telegram: document.querySelector('[data-field="telegram"] .field-value').textContent
    };

    // Save to localStorage
    localStorage.setItem('companyContactData', JSON.stringify(companyData));
    
    // Update contact manager
    if (contactManager) {
        contactManager.updateFromAdminPanel(companyData);
    }

    // Show success message
    showNotification('Company details updated successfully!', 'success');
}

// Update the editable fields functionality
function initEditableFields() {
    document.querySelectorAll('.editable-field').forEach(field => {
        const valueElement = field.querySelector('.field-value');
        const inputElement = field.querySelector('.field-input');
        const editButton = field.querySelector('.edit-btn');
        
        if (!valueElement || !inputElement || !editButton) return;

        editButton.addEventListener('click', function() {
            // Switch to edit mode
            valueElement.classList.add('hidden');
            inputElement.classList.remove('hidden');
            inputElement.focus();
            
            // Change edit button to save button
            editButton.innerHTML = '<i class="fas fa-check text-xs"></i>';
            editButton.onclick = function() {
                saveField(field);
            };
        });

        // Save on Enter key
        inputElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveField(field);
            }
        });

        // Save on blur (click outside)
        inputElement.addEventListener('blur', function() {
            setTimeout(() => {
                if (document.activeElement !== inputElement) {
                    saveField(field);
                }
            }, 100);
        });
    });
}

function saveField(field) {
    const valueElement = field.querySelector('.field-value');
    const inputElement = field.querySelector('.field-input');
    const editButton = field.querySelector('.edit-btn');
    const fieldType = field.dataset.field;

    // Update value
    valueElement.textContent = inputElement.value;
    
    // Switch back to view mode
    valueElement.classList.remove('hidden');
    inputElement.classList.add('hidden');
    
    // Change back to edit button
    editButton.innerHTML = '<i class="fas fa-edit text-xs"></i>';
    editButton.onclick = function() {
        valueElement.classList.add('hidden');
        inputElement.classList.remove('hidden');
        inputElement.focus();
        editButton.innerHTML = '<i class="fas fa-check text-xs"></i>';
        editButton.onclick = function() {
            saveField(field);
        };
    };

    // Save all changes
    saveCompanyChanges();
}
	   
	   
	// Notification configuration
const notificationConfig = {
    // Names pool
    names: [
        "Mike Andrew", "Sarah Johnson", "David Wilson", "Emma Thompson", "James Rodriguez",
        "Olivia Martinez", "Michael Brown", "Sophia Garcia", "Robert Taylor", "Isabella Lee",
        "William Anderson", "Mia Thomas", "Christopher Jackson", "Charlotte White", "Daniel Harris",
        "Amelia Martin", "Matthew Clark", "Harper Lewis", "Joseph Walker", "Evelyn Hall",
        "Joshua Young", "Abigail Allen", "Andrew King", "Emily Wright", "Ryan Scott",
        "Elizabeth Green", "Kevin Adams", "Avery Nelson", "Brian Baker", "Ella Carter"
    ],
    
    // Cities and countries pool
    locations: [
        {city: "Miami", country: "USA"},
        {city: "New York", country: "USA"},
        {city: "London", country: "UK"},
        {city: "Toronto", country: "Canada"},
        {city: "Sydney", country: "Australia"},
        {city: "Berlin", country: "Germany"},
        {city: "Paris", country: "France"},
        {city: "Tokyo", country: "Japan"},
        {city: "Singapore", country: "Singapore"},
        {city: "Dubai", country: "UAE"},
        {city: "Mumbai", country: "India"},
        {city: "São Paulo", country: "Brazil"},
        {city: "Mexico City", country: "Mexico"},
        {city: "Amsterdam", country: "Netherlands"},
        {city: "Seoul", country: "South Korea"},
        {city: "Hong Kong", country: "China"},
        {city: "Bangkok", country: "Thailand"},
        {city: "Rome", country: "Italy"},
        {city: "Madrid", country: "Spain"},
        {city: "Vancouver", country: "Canada"},
        {city: "Los Angeles", country: "USA"},
        {city: "Chicago", country: "USA"},
        {city: "Melbourne", country: "Australia"},
        {city: "Auckland", country: "New Zealand"},
        {city: "Stockholm", country: "Sweden"},
        {city: "Oslo", country: "Norway"},
        {city: "Copenhagen", country: "Denmark"},
        {city: "Zurich", country: "Switzerland"},
        {city: "Vienna", country: "Austria"},
        {city: "Brussels", country: "Belgium"}
    ],
    
    // Transaction types with brighter colors for better visibility
    types: [
        {name: "Deposit", color: "#00ff88", title: "Recent Deposit", cssClass: "notification-deposit"},
        {name: "Withdrawal", color: "#ff4444", title: "Recent Withdrawal", cssClass: "notification-withdrawal"},
        {name: "Exchange", color: "#4488ff", title: "Recent Exchange", cssClass: "notification-exchange"}
    ]
};

// Generate random amount with probability distribution
function generateRandomAmount() {
    const random = Math.random();
    
    // 70% probability for amounts between $1,500 and $100,000
    if (random <= 0.7) {
        return (Math.random() * (100000 - 1500) + 1500).toFixed(2);
    } 
    // 30% probability for amounts between $100,000 and $305,000
    else {
        return (Math.random() * (305000 - 100000) + 100000).toFixed(2);
    }
}

// Generate random notification
function generateNotification() {
    const randomName = notificationConfig.names[Math.floor(Math.random() * notificationConfig.names.length)];
    const randomLocation = notificationConfig.locations[Math.floor(Math.random() * notificationConfig.locations.length)];
    const randomType = notificationConfig.types[Math.floor(Math.random() * notificationConfig.types.length)];
    const amount = generateRandomAmount();
    
    const action = randomType.name.toLowerCase() === "withdrawal" ? "withdrew" : 
                   randomType.name.toLowerCase() === "deposit" ? "deposited" : "exchanged";
    
    return {
        title: randomType.title,
        message: `${randomName} from ${randomLocation.city}, ${randomLocation.country} ${action} sum of $${amount}`,
        color: randomType.color,
        cssClass: randomType.cssClass
    };
}

// Show notification
function showNotification() {
    const notification = generateNotification();
    const notificationBox = document.getElementById('notification-box');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIndicator = document.getElementById('notification-indicator');
    
    // Remove previous color classes
    notificationBox.classList.remove('notification-deposit', 'notification-withdrawal', 'notification-exchange');
    
    // Add current transaction type class
    notificationBox.classList.add(notification.cssClass);
    
    // Update notification content
    notificationTitle.textContent = notification.title;
    notificationMessage.textContent = notification.message;
    notificationIndicator.style.backgroundColor = notification.color;
    
    // Show notification with animation
    notificationBox.classList.remove('hidden');
    
    // Hide after 4 seconds
    setTimeout(() => {
        notificationBox.classList.add('hidden');
    }, 4000);
}

// Start notification cycle
function startNotificationCycle() {
    // Show first notification after 2 seconds
    setTimeout(showNotification, 2000);
    
    // Set up interval for subsequent notifications
    setInterval(() => {
        const randomInterval = Math.random() * (15000 - 5000) + 5000; // 5-15 seconds
        setTimeout(showNotification, randomInterval);
    }, 15000); // Check every 15 seconds for new notification
}

// Initialize notifications when page loads
document.addEventListener('DOMContentLoaded', function() {
    startNotificationCycle();
});
	   
	  // Utility Bar Functionality - Complete Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    // Google Translate
    const translateButton = document.getElementById('google-translate');
    const translateDropdown = document.getElementById('translate-dropdown');
    
    // Chatbot Elements
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotPanel = document.getElementById('chatbot-panel');
    
    // Telegram
    const telegramButton = document.getElementById('telegram-button');
    
    // Initialize Google Translate
    if (translateButton && translateDropdown) {
        translateButton.addEventListener('click', function(e) {
            e.stopPropagation();
            translateDropdown.classList.toggle('hidden');
            // Close other dropdowns
            if (chatbotPanel) chatbotPanel.classList.add('hidden');
        });
        
        // Language selection
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                // Simulate Google Translate functionality
                alert(`Page would be translated to ${this.textContent}`);
                translateDropdown.classList.add('hidden');
            });
        });
    }
    
    // Initialize Chatbot
    if (chatbotButton && chatbotPanel) {
        chatbotButton.addEventListener('click', function(e) {
            e.stopPropagation();
            chatbotPanel.classList.toggle('hidden');
            // Close other dropdowns
            if (translateDropdown) translateDropdown.classList.add('hidden');
            
            // Initialize chatbot FAQ when panel opens
            if (!chatbotPanel.classList.contains('hidden')) {
                setTimeout(initChatbotFAQ, 50);
            }
        });
        
        // Initialize chatbot FAQ functionality
        const initChatbotFAQ = () => {
            const chatbotFaqQuestions = document.querySelectorAll('#chatbot-panel .faq-question');
            
            chatbotFaqQuestions.forEach(question => {
                // Remove any existing event listeners to prevent duplicates
                question.replaceWith(question.cloneNode(true));
            });
            
            // Re-select questions after clone
            const freshChatbotFaqQuestions = document.querySelectorAll('#chatbot-panel .faq-question');
            
            freshChatbotFaqQuestions.forEach(question => {
                question.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // Find the answer for this question
                    const faqItem = this.closest('.faq-item');
                    const answer = faqItem ? faqItem.querySelector('.faq-answer') : null;
                    
                    if (!answer) {
                        console.log('No answer found for this question');
                        return;
                    }
                    
                    // Toggle this answer
                    const isHidden = answer.classList.contains('hidden');
                    
                    if (isHidden) {
                        // Close all other answers first
                        document.querySelectorAll('#chatbot-panel .faq-answer').forEach(ans => {
                            ans.classList.add('hidden');
                        });
                        // Show this answer
                        answer.classList.remove('hidden');
                    } else {
                        answer.classList.add('hidden');
                    }
                });
            });
        };
        
        // Initialize chatbot FAQ on page load if panel is visible
        if (!chatbotPanel.classList.contains('hidden')) {
            initChatbotFAQ();
        }
    }
    
    // Initialize Telegram
    if (telegramButton) {
        telegramButton.addEventListener('click', function() {
            window.open('https://t.me/ChangeNowSupport', '_blank');
        });
    }
    
    // Homepage FAQ functionality (separate from chatbot)
    const homepageFaqQuestions = document.querySelectorAll('section:not(#chatbot-panel) .faq-question');
    homepageFaqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            if (answer && answer.classList) {
                const isHidden = answer.classList.contains('hidden');
                
                // Close all other answers on homepage
                document.querySelectorAll('section:not(#chatbot-panel) .faq-answer').forEach(ans => {
                    if (ans !== answer) {
                        ans.classList.add('hidden');
                    }
                });
                
                // Toggle current answer
                if (isHidden) {
                    answer.classList.remove('hidden');
                } else {
                    answer.classList.add('hidden');
                }
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        if (translateDropdown) translateDropdown.classList.add('hidden');
        if (chatbotPanel) chatbotPanel.classList.add('hidden');
    });
    
    // Prevent dropdowns from closing when clicking inside them
    if (translateDropdown) {
        translateDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    if (chatbotPanel) {
        chatbotPanel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Add attention animation to chatbot icon
    if (chatbotButton) {
        setTimeout(() => {
            chatbotButton.classList.add('attention-pulse');
            
            // Stop animation after 3 cycles
            setTimeout(() => {
                chatbotButton.classList.remove('attention-pulse');
            }, 6000);
        }, 2000);
    }
    
    console.log('Utility bar initialized successfully');
});
	   
	   
	   // FAQ Functionality
function initializeFAQ() {
    // FAQ toggle functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isOpen = answer.classList.contains('open');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.remove('open');
                ans.style.maxHeight = '0';
                ans.style.opacity = '0';
            });
            
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                q.querySelector('svg').style.transform = 'rotate(0deg)';
            });
            
            // Toggle current FAQ
            if (!isOpen) {
                this.classList.add('active');
                this.querySelector('svg').style.transform = 'rotate(180deg)';
                answer.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
            }
        });
    });
}

// Chatbot FAQ Functionality
function initializeChatbotFAQ() {
    // Chatbot FAQ toggle functionality
    const chatbotFaqQuestions = document.querySelectorAll('#chatbot-panel .faq-question');
    
    chatbotFaqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isOpen = answer.classList.contains('open');
            
            // Close all other FAQs in chatbot
            document.querySelectorAll('#chatbot-panel .faq-answer').forEach(ans => {
                ans.classList.remove('open');
                ans.style.maxHeight = '0';
                ans.style.opacity = '0';
            });
            
            document.querySelectorAll('#chatbot-panel .faq-question').forEach(q => {
                q.classList.remove('active');
                const arrow = q.querySelector('span:last-child');
                if (arrow) {
                    arrow.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current FAQ
            if (!isOpen) {
                this.classList.add('active');
                const arrow = this.querySelector('span:last-child');
                if (arrow) {
                    arrow.style.transform = 'rotate(180deg)';
                }
                answer.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = '1';
            }
        });
    });
}

// Initialize FAQ functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeFAQ();
    initializeChatbotFAQ();
});

// Re-initialize FAQ when switching sections (if using SPA navigation)
function showSection(sectionId) {
    // Your existing showSection code...
    
    // Re-initialize FAQ after a short delay to ensure DOM is ready
    setTimeout(() => {
        initializeFAQ();
        initializeChatbotFAQ();
    }, 100);
}
	   
	   
</script>