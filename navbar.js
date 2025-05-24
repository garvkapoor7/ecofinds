// Function to show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Function to update navbar based on authentication state
function updateNavbar() {
    const navbarLinks = document.getElementById('navbar-links');
    const isLoggedIn = localStorage.getItem('access_token') !== null;

    if (isLoggedIn) {
        navbarLinks.innerHTML = `
            <a href="dashboard.html" class="me-2">Profile</a>
            <button class="btn position-relative" onclick="window.location.href='purchase.html'">
                <img src="https://img.icons8.com/material-outlined/24/000000/shopping-cart--v1.png"/>
                <span class="badge bg-danger rounded-pill cart-badge" id="cart-count">0</span>
            </button>
            <button class="btn btn-outline-danger ms-2" onclick="handleLogout()">Logout</button>
        `;
    } else {
        navbarLinks.innerHTML = `
            <a href="login.html" class="btn btn-outline-primary me-2">Login</a>
            <a href="login.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('access_token');
    updateNavbar();
    showNotification('Logged out successfully!');
    window.location.href = 'landingpage.html';
}

// Update navbar when page loads
document.addEventListener('DOMContentLoaded', updateNavbar); 