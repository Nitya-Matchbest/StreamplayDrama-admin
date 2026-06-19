(function() {
    // Immediate token check before page renders
    const token = localStorage.getItem('drama_admin_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const API_BASE = 'https://streamplaydrama-backend.onrender.com';

    // Verify token validity with backend
    fetch(`${API_BASE}/api/auth/verify`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            localStorage.removeItem('drama_admin_token');
            window.location.href = 'login.html';
        }
    })
    .catch(() => {
        // Network error, maybe allow them to stay if it's a transient issue
        console.warn('Could not verify token with backend.');
    });

    document.addEventListener('DOMContentLoaded', () => {
        const emailEl = document.getElementById('loggedInEmail');
        if (emailEl) {
            emailEl.textContent = localStorage.getItem('drama_admin_email') || 'Admin';
        }
    });
})();

// Function to attach token to headers for fetch requests
window.getAuthHeaders = function() {
    const token = localStorage.getItem('drama_admin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

window.getAuthHeadersForFormData = function() {
    const token = localStorage.getItem('drama_admin_token');
    return {
        'Authorization': `Bearer ${token}`
    };
};

// Global logout function
window.logoutAdmin = function() {
    localStorage.removeItem('drama_admin_token');
    window.location.href = 'login.html';
};
