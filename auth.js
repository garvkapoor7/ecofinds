// Shared authentication functions
const backendUrl = 'http://127.0.0.1:8000';

// Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('access_token') !== null;
}

// Function to update navbar based on auth state
function updateNavbarAuthState() {
    const token = localStorage.getItem('access_token');
    const loginLinks = document.querySelectorAll('.login-link');
    const signupLinks = document.querySelectorAll('.signup-link');
    const profileLinks = document.querySelectorAll('.profile-link');
    const cartButtons = document.querySelectorAll('.cart-btn');
    const logoutLinks = document.querySelectorAll('.logout-link');

    if (token) {
        // User is logged in
        loginLinks.forEach(link => link.style.display = 'none');
        signupLinks.forEach(link => link.style.display = 'none');
        profileLinks.forEach(link => link.style.display = '');
        cartButtons.forEach(btn => btn.style.display = '');
        logoutLinks.forEach(link => link.style.display = '');
    } else {
        // User is logged out
        loginLinks.forEach(link => link.style.display = '');
        signupLinks.forEach(link => link.style.display = '');
        profileLinks.forEach(link => link.style.display = 'none');
        cartButtons.forEach(btn => btn.style.display = 'none');
        logoutLinks.forEach(link => link.style.display = 'none');
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('access_token');
    updateNavbarAuthState();
    // Redirect to landing page
    window.location.href = 'landingpage.html';
}

// Add event listeners to logout links
document.addEventListener('DOMContentLoaded', function() {
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });
    
    // Initial navbar state update
    updateNavbarAuthState();
});

// Function to handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:8000/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token
            localStorage.setItem('access_token', data.access_token);
            // Redirect to landing page instead of dashboard
            window.location.href = 'landingpage.html';
        } else {
            // Handle error
            alert(data.detail || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Function to handle signup
async function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Signup successful
            alert('Signup successful! Please login.');
            showLogin(); // Switch to login form
        } else {
            // Handle error
            alert(data.detail || 'Signup failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Function to toggle password visibility
function togglePassword(inputId, element) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        element.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    } else {
        input.type = 'password';
        element.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="8" ry="5"/><circle cx="12" cy="12" r="2.5"/></svg>';
    }
}

// Function to switch between login and signup forms
function showLogin() {
    document.getElementById('signup-box').style.display = 'none';
    document.getElementById('login-box').style.display = 'flex';
}

function showSignup() {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('signup-box').style.display = 'flex';
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add signup form submit handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Add login form submit handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}); 