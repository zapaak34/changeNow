// Navigation and Section Management
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active-section');
    
    // Update navigation state
    updateNavigationState(sectionId);
    
    // Close mobile menu if open
    closeMobileMenu();
}

function updateNavigationState(sectionId) {
    // Update active states in navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section link
    const currentLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.add('hidden');
}

function toggleMobileSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    const arrow = document.getElementById('services-arrow');
    
    submenu.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
}

// Login/User Management
function showLoginOverlay() {
    document.getElementById('login-overlay').style.display = 'flex';
}

function closeLoginOverlay() {
    document.getElementById('login-overlay').style.display = 'none';
}

function showLoginTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.login-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab
    document.querySelector(`.login-tab[onclick="showLoginTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate login success
    simulateLoginSuccess(email);
}

function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    if (!email || !password || !confirm) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    // Simulate signup success
    simulateLoginSuccess(email);
}

function resetPassword() {
    const email = document.getElementById('reset-email').value;
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    alert('Password reset instructions sent to ' + email);
    showLoginTab('login');
}

function simulateLoginSuccess(email) {
    // Update UI for logged in state
    document.getElementById('connect-btn').classList.add('hidden');
    document.getElementById('user-avatar').classList.remove('hidden');
    document.getElementById('user-container').classList.remove('hidden');
    
    // Update user info
    document.getElementById('user-name').textContent = email.split('@')[0];
    document.getElementById('user-email').textContent = email;
    
    // Show dashboard/admin links
    document.getElementById('dashboard-nav').classList.remove('hidden');
    document.getElementById('admin-nav').classList.remove('hidden');
    document.getElementById('mobile-dashboard-nav').classList.remove('hidden');
    document.getElementById('mobile-admin-nav').classList.remove('hidden');
    document.getElementById('mobile-logout-nav').classList.remove('hidden');
    
    // Close login overlay
    closeLoginOverlay();
    
    // Show success message
    showNotification('Login Successful', 'Welcome back to ChangeNow!', 'success');
}

function logout() {
    // Reset to logged out state
    document.getElementById('connect-btn').classList.remove('hidden');
    document.getElementById('user-avatar').classList.add('hidden');
    document.getElementById('user-container').classList.add('hidden');
    
    // Hide dashboard/admin links
    document.getElementById('dashboard-nav').classList.add('hidden');
    document.getElementById('admin-nav').classList.add('hidden');
    document.getElementById('mobile-dashboard-nav').classList.add('hidden');
    document.getElementById('mobile-admin-nav').classList.add('hidden');
    document.getElementById('mobile-logout-nav').classList.add('hidden');
    
    // Show home section
    showSection('home');
    
    // Show logout message
    showNotification('Logged Out', 'You have been successfully logged out.', 'info');
}

function toggleUserDropdown() {
    const userContainer = document.getElementById('user-container');
    userContainer.classList.toggle('active');
}

function handleUserMenuClick(action) {
    if (action === 'dashboard') {
        showSection('dashboard');
    } else if (action === 'admin') {
        showSection('admin');
    }
    toggleUserDropdown();
}

// Exchange Functions
function swapCurrencies() {
    const sendCurrency = document.getElementById('send-currency').textContent;
    const receiveCurrency = document.getElementById('receive-currency').textContent;
    const sendAmount = document.getElementById('send-amount').value;
    const receiveAmount = document.getElementById('receive-amount').value;
    
    // Swap currencies
    document.getElementById('send-currency').textContent = receiveCurrency;
    document.getElementById('receive-currency').textContent = sendCurrency;
    
    // Swap amounts (simplified)
    document.getElementById('send-amount').value = receiveAmount;
    document.getElementById('receive-amount').value = sendAmount;
}

function openCurrencyModal(type) {
    // This would open a modal for currency selection
    alert(`Open ${type} currency selection modal`);
}

function openExchangeModal() {
    // This would open the exchange confirmation modal
    alert('Open exchange confirmation modal');
}

function openBuyModal() {
    alert('Open buy crypto modal');
}

function openSellModal() {
    alert('Open sell crypto modal');
}

// Dashboard Functions
function showDashboardTab(tabName) {
    // Hide all dashboard tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Update navigation state
    updateDashboardNavState(tabName);
}

function updateDashboardNavState(tabName) {
    // Update active states in dashboard navigation
    document.querySelectorAll('.dashboard-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current tab
    const currentTab = document.querySelector(`[onclick="showDashboardTab('${tabName}')"]`);
    if (currentTab) {
        currentTab.classList.add('active');
    }
}

// Admin Functions
function showAdminTab(tabName) {
    // Hide all admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Update navigation state
    updateAdminNavState(tabName);
}

function updateAdminNavState(tabName) {
    // Update active states in admin navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current tab
    const currentTab = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (currentTab) {
        currentTab.classList.add('active');
    }
}

function openDepositModal() {
    alert('Open deposit modal');
}

function openWithdrawModal() {
    alert('Open withdraw modal');
}

function openLogoUploadModal() {
    alert('Open logo upload modal');
}

// KYC Functions
function verifyKYC() {
    const form = document.getElementById('kyc-form');
    const files = form.querySelectorAll('input[type="file"]');
    
    let allFilesSelected = true;
    files.forEach(file => {
        if (!file.files.length) {
            allFilesSelected = false;
        }
    });
    
    if (!allFilesSelected) {
        alert('Please upload all required documents');
        return;
    }
    
    // Show KYC state section
    document.getElementById('kyc-state').classList.remove('hidden');
    
    // Add KYC entry to table
    const tableBody = document.getElementById('kyc-table-body');
    const newRow = document.createElement('tr');
    newRow.className = 'kyc-row';
    newRow.innerHTML = `
        <td class="py-3 px-4">${tableBody.children.length + 1}</td>
        <td class="py-3 px-4">User Name</td>
        <td class="py-3 px-4">user@example.com</td>
        <td class="py-3 px-4"><span class="status-pending">Pending</span></td>
    `;
    tableBody.appendChild(newRow);
    
    alert('KYC verification submitted successfully! Our team will review your documents within 24 hours.');
}

// Notification System
function showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification-box';
    notification.className = `fixed top-4 right-4 bg-[#343443] border border-[#46475d] rounded-lg p-4 max-w-sm z-50`;
    notification.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-${getNotificationIcon(type)} text-${getNotificationColor(type)} text-lg"></i>
            </div>
            <div class="ml-3">
                <h3 id="notification-title" class="text-white font-medium">${title}</h3>
                <p id="notification-message" class="text-[#aeb0bd] text-sm mt-1">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-[#aeb0bd] hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '[#00c26f]',
        'error': '[#ff6654]',
        'warning': '[#ffc107]',
        'info': '[#3c6dd9]'
    };
    return colors[type] || '[#3c6dd9]';
}

// FAQ Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isOpen = answer.classList.contains('open');
            
            // Close all other FAQ answers
            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.remove('open');
            });
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
            });
            
            // Toggle current answer
            if (!isOpen) {
                answer.classList.add('open');
                this.classList.add('active');
            }
        });
    });
    
    // Initialize exchange tab functionality
    const exchangeTabs = document.querySelectorAll('.exchange-tab');
    
    exchangeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update tab active states
            exchangeTabs.forEach(t => {
                t.classList.remove('active-tab');
                t.classList.add('text-[#aeb0bd]', 'bg-[#30303e]');
            });
            this.classList.add('active-tab');
            this.classList.remove('text-[#aeb0bd]', 'bg-[#30303e]');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-tab-content`).classList.add('active');
        });
    });
    
    // Initialize member avatar animations
    const memberAvatars = document.querySelectorAll('.member-avatar');
    
    memberAvatars.forEach((avatar, index) => {
        // Add random animations
        setTimeout(() => {
            avatar.classList.add('float');
        }, index * 1000);
        
        // Add click handler for +1 animation
        avatar.addEventListener('click', function() {
            const plusOne = this.querySelector('.plus-one-animation');
            plusOne.classList.add('active');
            
            setTimeout(() => {
                plusOne.classList.remove('active');
            }, 600);
        });
    });
});

// Scroll to Buy Section
function scrollToBuySection() {
    const buySection = document.querySelector('.main-page-section');
    if (buySection) {
        buySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set home as active section
    showSection('home');
    
    // Initialize any other necessary functionality
    console.log('ChangeNow platform initialized');
});