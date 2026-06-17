const API_BASE = 'https://streamplaydrama-backend.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to index
    if (localStorage.getItem('drama_admin_token')) {
        window.location.href = 'index.html';
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');
    const errorBox = document.getElementById('errorMessage');

    // Reset UI
    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Authenticating...';

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store token
            localStorage.setItem('drama_admin_token', data.token);
            // Redirect
            window.location.href = 'index.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (err) {
        errorBox.textContent = '❌ ' + err.message;
        errorBox.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Login to Admin';
    }
});
