const updatePhotoBtn = document.getElementById('updatePhotoBtn');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const photoModal = document.getElementById('photoModal');
const passwordModal = document.getElementById('passwordModal');
const closePhotoModal = document.getElementById('closePhotoModal');
const closePasswordModal = document.getElementById('closePasswordModal');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const profileImage = document.getElementById('profileImage');
const photoUploadArea = document.getElementById('photoUploadArea');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const savePasswordBtn = document.getElementById('savePasswordBtn');

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api/v2';
let authToken = localStorage.getItem('authToken');

// Headers configuration
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
});

const getMultipartHeaders = () => ({
    'Authorization': `Bearer ${authToken}`
});

/**
 * 🎯 Utility Functions
 */
const showNotification = (message, type = 'success') => {
    // You can use a notification library or create a simple one
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
};

const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        logout();
    } else {
        showNotification(error.message || 'Something went wrong', 'error');
    }
};

const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
};

/**
 * 🔐 Authentication Check
 */
const checkAuth = () => {
    if (!authToken) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
};

/**
 * 📸 Photo Upload Functions
 */
photoUploadArea.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPEG, PNG, GIF)', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            photoPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

/**
 * 💾 Save Profile Photo
 */
savePhotoBtn.addEventListener('click', async () => {
    if (!checkAuth()) return;

    const file = photoInput.files[0];
    if (!file) {
        showNotification('Please select a photo to upload', 'error');
        return;
    }

    try {
        savePhotoBtn.disabled = true;
        savePhotoBtn.textContent = 'Uploading...';

        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
            method: 'PATCH',
            headers: getMultipartHeaders(),
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload photo');
        }

        // Update profile image on success
        profileImage.src = photoPreview.src;
        photoModal.style.display = 'none';
        
        // Clear the file input
        photoInput.value = '';
        
        showNotification('Profile photo updated successfully!');
        
        // Update user data in localStorage if needed
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.profileImage = data.data.profileImageUrl;
        localStorage.setItem('userData', JSON.stringify(userData));

    } catch (error) {
        handleApiError(error);
    } finally {
        savePhotoBtn.disabled = false;
        savePhotoBtn.textContent = 'Save Photo';
    }
});

/**
 * 🔑 Change Password Functionality
 */
savePasswordBtn.addEventListener('click', async () => {
    if (!checkAuth()) return;

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters long', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (currentPassword === newPassword) {
        showNotification('New password must be different from current password', 'error');
        return;
    }

    try {
        savePasswordBtn.disabled = true;
        savePasswordBtn.textContent = 'Updating...';

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }

        // Success
        passwordModal.style.display = 'none';
        showNotification('Password updated successfully!');

        // Clear the form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        // Optional: Force logout after password change for security
        setTimeout(() => {
            showNotification('Please login again with your new password', 'info');
            logout();
        }, 2000);

    } catch (error) {
        handleApiError(error);
    } finally {
        savePasswordBtn.disabled = false;
        savePasswordBtn.textContent = 'Update Password';
    }
});

/**
 * 👤 Load User Profile Data
 */
const loadUserProfile = async () => {
    if (!checkAuth()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: getHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to load profile');
        }

        // Update UI with user data
        updateProfileUI(data.data.user);

    } catch (error) {
        handleApiError(error);
    }
};

/**
 * 🎨 Update Profile UI
 */
const updateProfileUI = (userData) => {
    // Update profile image
    if (userData.profileImage) {
        profileImage.src = userData.profileImage;
    }

    // Update user info in the UI
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userRole').textContent = userData.role;
    document.getElementById('userPhone').textContent = userData.phone || 'Not provided';
    
    // Format dates
    if (userData.lastLoginAt) {
        const lastLogin = new Date(userData.lastLoginAt).toLocaleString();
        document.getElementById('lastLogin').textContent = lastLogin;
    }
};

/**
 * 🎯 Modal Management
 */
// Open modals
updatePhotoBtn.addEventListener('click', () => {
    if (!checkAuth()) return;
    photoModal.style.display = 'flex';
});

updatePasswordBtn.addEventListener('click', () => {
    if (!checkAuth()) return;
    passwordModal.style.display = 'flex';
});

// Close modals
closePhotoModal.addEventListener('click', () => {
    photoModal.style.display = 'none';
    photoInput.value = '';
});

closePasswordModal.addEventListener('click', () => {
    passwordModal.style.display = 'none';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === photoModal) {
        photoModal.style.display = 'none';
        photoInput.value = '';
    }
    if (e.target === passwordModal) {
        passwordModal.style.display = 'none';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        photoModal.style.display = 'none';
        passwordModal.style.display = 'none';
    }
});

/**
 * 🚀 Initialize the page
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    loadUserProfile();
    
    // Set up token refresh (optional)
    setupTokenRefresh();
});

/**
 * 🔄 Token Refresh (Optional)
 */
const setupTokenRefresh = () => {
    // Refresh token 5 minutes before expiry
    const tokenExpiry = JSON.parse(atob(authToken.split('.')[1])).exp * 1000;
    const refreshTime = tokenExpiry - Date.now() - 5 * 60 * 1000;
    
    if (refreshTime > 0) {
        setTimeout(refreshAuthToken, refreshTime);
    }
};

const refreshAuthToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include' // For httpOnly cookies
        });
        
        const data = await response.json();
        
        if (response.ok && data.data.token) {
            authToken = data.data.token;
            localStorage.setItem('authToken', authToken);
            setupTokenRefresh(); // Setup next refresh
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
};