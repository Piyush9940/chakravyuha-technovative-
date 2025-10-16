document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const roleSelect = document.getElementById('roleSelect');
    const loginContainer = document.querySelector('.login-container');
    
    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api/v2';
    
    // Change styling based on selected role
    roleSelect.addEventListener('change', function() {
        // Remove all role classes
        loginContainer.classList.remove('role-manager', 'role-driver', 'role-customer', 'role-operator', 'role-admin');
        
        // Add the selected role class
        if (roleSelect.value) {
            loginContainer.classList.add('role-' + roleSelect.value);
        }
    });
    
    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const role = roleSelect.value;
        const email = document.getElementById('username').value; // Changed from username to email
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!role || !email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        // Email validation
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = loginForm.querySelector('.btn-login');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        submitBtn.disabled = true;
        
        try {
            // API call to login endpoint
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                    // Note: Role is not needed for login as it's determined by the user record
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store token in localStorage or sessionStorage
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userRole', data.data.role);
                localStorage.setItem('userName', data.data.name);
                localStorage.setItem('userId', data.data.userId);
                
                showAlert('Login successful! Redirecting...', 'success');
                
                // Check if the logged-in user's role matches the selected role
                if (data.data.role.toLowerCase() !== role.toLowerCase()) {
                    showAlert(`You are logged in as ${data.data.role}, but selected ${role}. Please select the correct role.`, 'warning');
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Redirect based on role after short delay
                setTimeout(() => {
                    redirectToDashboard(data.data.role);
                }, 1000);
                
            } else {
                // Login failed
                showAlert(data.message || 'Login failed. Please try again.', 'error');
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showAlert('Network error. Please check your connection and try again.', 'error');
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Show alert message
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-message alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'warning' ? 'background: #ffc107; color: black;' : ''}
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Redirect based on role
    function redirectToDashboard(role) {
        switch(role.toLowerCase()) {
            case 'manager':
                window.location.href = 'manager-dashboard.html';
                break;
            case 'driver':
                window.location.href = 'driver-dashboard.html';
                break;
            case 'consumer': // Note: Changed from 'customer' to match your schema
                window.location.href = 'customer-dashboard.html';
                break;
            case 'operator':
                window.location.href = 'operator-dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            default:
                showAlert('Unknown user role', 'error');
        }
    }
    
    // Check if user is already logged in
    function checkExistingLogin() {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (token && userRole) {
            // Optional: Verify token is still valid with API
            // For now, auto-redirect based on stored role
            console.log('User already logged in, redirecting to dashboard...');
            // Uncomment the line below if you want auto-redirect
            // redirectToDashboard(userRole);
        }
    }
    
    // Add floating label functionality
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.querySelector('.floating-label').style.opacity = '1';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.querySelector('.floating-label').style.opacity = '0';
            }
        });
        
        // Initialize floating labels based on existing values
        if (input.value) {
            input.parentElement.querySelector('.floating-label').style.opacity = '1';
        }
    });
    
    // Check for existing login on page load
    checkExistingLogin();
});