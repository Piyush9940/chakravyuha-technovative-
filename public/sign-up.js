document.addEventListener('DOMContentLoaded', function() {
    // API base URL
    const API_BASE_URL = 'http://localhost:5000/api/v2';
    
    // DOM Elements
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const nextToStep2Btn = document.getElementById('nextToStep2');
    const backToStep1Btn = document.getElementById('backToStep1');
    const verifyOtpBtn = document.getElementById('verifyOtp');
    const goToLoginBtn = document.getElementById('goToLogin');
    const resendOtpBtn = document.getElementById('resendOtp');
    const profilePicture = document.getElementById('profilePicture');
    const profileImageInput = document.getElementById('profileImage');
    
    // Form data storage
    let userData = {};
    
    // OTP Inputs
    const otpInputs = [
        document.getElementById('otp1'),
        document.getElementById('otp2'),
        document.getElementById('otp3'),
        document.getElementById('otp4'),
        document.getElementById('otp5'),
        document.getElementById('otp6')
    ];
    
    // Form Validation
    function validateStep1() {
        let isValid = true;
        
        // Name validation
        const name = document.getElementById('fullName').value.trim();
        if (name.length < 2) {
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('nameError').style.display = 'none';
        }
        
        // Email validation
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('emailError').style.display = 'none';
        }
        
        // Phone validation
        const phone = document.getElementById('phone').value.trim();
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        if (!phoneRegex.test(phone)) {
            document.getElementById('phoneError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('phoneError').style.display = 'none';
        }
        
        // Role validation
        const role = document.getElementById('role').value;
        if (!role) {
            document.getElementById('roleError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('roleError').style.display = 'none';
        }
        
        // Password validation
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('passwordError').style.display = 'none';
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('confirmPasswordError').style.display = 'none';
        }
        
        return isValid;
    }
    
    // Step Navigation
    nextToStep2Btn.addEventListener('click', async function() {
        if (validateStep1()) {
            // Store user data
            userData = {
                name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                role: document.getElementById('role').value,
                phone: document.getElementById('phone').value.trim()
            };
            
            // Show loading state
            const originalText = nextToStep2Btn.innerHTML;
            nextToStep2Btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
            nextToStep2Btn.disabled = true;
            
            try {
                // Call registration API
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Registration successful, proceed to OTP step
                    step1.classList.remove('active');
                    step2.classList.add('active');
                    updateStepIndicator(2);
                    
                    // Auto-focus first OTP input
                    setTimeout(() => otpInputs[0].focus(), 300);
                    
                    showAlert('OTP sent to your email/phone!', 'success');
                } else {
                    // Registration failed
                    showAlert(data.message || 'Registration failed. Please try again.', 'error');
                }
                
            } catch (error) {
                console.error('Registration error:', error);
                showAlert('Network error. Please check your connection and try again.', 'error');
            } finally {
                // Reset button
                nextToStep2Btn.innerHTML = originalText;
                nextToStep2Btn.disabled = false;
            }
        }
    });
    
    backToStep1Btn.addEventListener('click', function() {
        step2.classList.remove('active');
        step1.classList.add('active');
        updateStepIndicator(1);
    });
    
    // OTP Verification
    verifyOtpBtn.addEventListener('click', async function() {
        const otp = otpInputs.map(input => input.value).join('');
        
        // OTP validation
        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            document.getElementById('otpError').style.display = 'block';
            document.getElementById('otpSuccess').style.display = 'none';
            return;
        }
        
        // Show loading state
        const originalText = verifyOtpBtn.innerHTML;
        verifyOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        verifyOtpBtn.disabled = true;
        
        try {
            // In a real implementation, you would verify OTP with your backend
            // For now, we'll simulate OTP verification
            // Replace this with actual OTP verification API call
            
            const otpResponse = await fetch(`${API_BASE_URL}/otp/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    otp: otp
                })
            });
            
            const otpData = await otpResponse.json();
            
            if (otpResponse.ok && otpData.success) {
                document.getElementById('otpError').style.display = 'none';
                document.getElementById('otpSuccess').style.display = 'block';
                
                // Proceed to success step
                setTimeout(() => {
                    step2.classList.remove('active');
                    step3.classList.add('active');
                    updateStepIndicator(3);
                    
                    // Auto-login after successful registration
                    autoLoginUser();
                }, 1000);
                
            } else {
                document.getElementById('otpError').style.display = 'block';
                document.getElementById('otpSuccess').style.display = 'none';
                showAlert(otpData.message || 'Invalid OTP. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('OTP verification error:', error);
            showAlert('OTP verification failed. Please try again.', 'error');
        } finally {
            // Reset button
            verifyOtpBtn.innerHTML = originalText;
            verifyOtpBtn.disabled = false;
        }
    });
    
    // Auto-login user after successful registration
    async function autoLoginUser() {
        try {
            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password
                })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.success) {
                // Store user data
                localStorage.setItem('authToken', loginData.data.token);
                localStorage.setItem('userRole', loginData.data.role);
                localStorage.setItem('userName', loginData.data.name);
                localStorage.setItem('userId', loginData.data.userId);
                
                showAlert('Registration completed successfully!', 'success');
            }
        } catch (error) {
            console.error('Auto-login error:', error);
            // User can still manually login later
        }
    }
    
    // Resend OTP
    resendOtpBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Show loading state
        const originalText = resendOtpBtn.innerHTML;
        resendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
        resendOtpBtn.disabled = true;
        
        try {
            // Call OTP resend API
            const response = await fetch(`${API_BASE_URL}/otp/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showAlert('A new OTP has been sent to your email/phone.', 'success');
                
                // Clear OTP inputs
                otpInputs.forEach(input => input.value = '');
                otpInputs[0].focus();
            } else {
                showAlert(data.message || 'Failed to resend OTP. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Resend OTP error:', error);
            showAlert('Failed to resend OTP. Please try again.', 'error');
        } finally {
            // Reset button
            resendOtpBtn.innerHTML = originalText;
            resendOtpBtn.disabled = false;
        }
    });
    
    // Profile Picture Upload (Optional - if you want to add profile pictures later)
    if (profilePicture && profileImageInput) {
        profilePicture.addEventListener('click', function() {
            profileImageInput.click();
        });
        
        profileImageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    profilePicture.innerHTML = `<img src="${event.target.result}" alt="Profile Picture">`;
                    // Store base64 image for later upload
                    userData.profilePicture = event.target.result;
                };
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
    
    // OTP Input Navigation
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            // Auto-verify when last digit is entered
            if (index === otpInputs.length - 1 && input.value.length === 1) {
                const fullOtp = otpInputs.map(input => input.value).join('');
                if (fullOtp.length === 6) {
                    verifyOtpBtn.click();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
                otpInputs[index - 1].focus();
            }
            
            // Allow paste event
            if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                setTimeout(() => {
                    handleOtpPaste();
                }, 0);
            }
        });
    });
    
    // Handle OTP paste
    function handleOtpPaste() {
        const pastedData = navigator.clipboard ? 
            navigator.clipboard.readText() : 
            Promise.resolve(''); // Fallback for browsers without clipboard API
        
        pastedData.then(text => {
            const otp = text.replace(/\D/g, '').substring(0, 6);
            if (otp.length === 6) {
                otp.split('').forEach((digit, index) => {
                    if (otpInputs[index]) {
                        otpInputs[index].value = digit;
                    }
                });
                verifyOtpBtn.click();
            }
        }).catch(err => {
            console.log('Paste failed:', err);
        });
    }
    
    // Step Indicator Update
    function updateStepIndicator(step) {
        const steps = document.querySelectorAll('.step');
        const stepLines = document.querySelectorAll('.step-line');
        
        steps.forEach((s, index) => {
            if (index + 1 < step) {
                s.classList.add('completed');
                s.classList.remove('active');
            } else if (index + 1 === step) {
                s.classList.add('active');
                s.classList.remove('completed');
            } else {
                s.classList.remove('active', 'completed');
            }
        });
        
        stepLines.forEach((line, index) => {
            if (index + 1 < step) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }
    
    // Go to Login
    goToLoginBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
    
    // Show alert message
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert-message alert-${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; margin-left:10px; cursor:pointer;">×</button>
        `;
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
            display: flex;
            justify-content: space-between;
            align-items: center;
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
    
    // Real-time password strength check
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthIndicator = document.getElementById('passwordStrength');
            
            if (strengthIndicator) {
                let strength = 0;
                let feedback = '';
                
                if (password.length >= 8) strength++;
                if (/[A-Z]/.test(password)) strength++;
                if (/[0-9]/.test(password)) strength++;
                if (/[^A-Za-z0-9]/.test(password)) strength++;
                
                switch(strength) {
                    case 0:
                    case 1:
                        feedback = 'Weak';
                        strengthIndicator.style.color = '#dc3545';
                        break;
                    case 2:
                        feedback = 'Fair';
                        strengthIndicator.style.color = '#ffc107';
                        break;
                    case 3:
                        feedback = 'Good';
                        strengthIndicator.style.color = '#28a745';
                        break;
                    case 4:
                        feedback = 'Strong';
                        strengthIndicator.style.color = '#20c997';
                        break;
                }
                
                strengthIndicator.textContent = feedback;
            }
        });
    }
});