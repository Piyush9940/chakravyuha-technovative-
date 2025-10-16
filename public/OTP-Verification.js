document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const otpInputs = document.querySelectorAll('.otp-input');
            const verifyBtn = document.getElementById('verifyBtn');
            const otpForm = document.getElementById('otpForm');
            const successContainer = document.getElementById('successContainer');
            const errorMessage = document.getElementById('errorMessage');
            const resendLink = document.getElementById('resendLink');
            const timerElement = document.getElementById('timer');
            const resetBtn = document.getElementById('resetBtn');
            
            // Timer variables
            let timerInterval;
            let timeLeft = 60;
            
            // Start the countdown timer
            startTimer();
            
            // OTP Input handling
            otpInputs.forEach((input, index) => {
                // Handle input
                input.addEventListener('input', function() {
                    const value = this.value;
                    
                    // Only allow numbers
                    if (!/^\d*$/.test(value)) {
                        this.value = '';
                        return;
                    }
                    
                    // If a digit is entered, move to next input
                    if (value.length === 1 && index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                    
                    // Update filled class
                    if (value.length === 1) {
                        this.classList.add('filled');
                    } else {
                        this.classList.remove('filled');
                    }
                    
                    // Check if all inputs are filled
                    checkOTPCompletion();
                });
                
                // Handle backspace
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace') {
                        if (this.value === '' && index > 0) {
                            otpInputs[index - 1].focus();
                        }
                    }
                });
                
                // Handle paste
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text');
                    const digits = pastedData.replace(/\D/g, '').split('');
                    
                    // Fill inputs with pasted digits
                    digits.forEach((digit, idx) => {
                        if (idx < otpInputs.length) {
                            otpInputs[idx].value = digit;
                            otpInputs[idx].classList.add('filled');
                        }
                    });
                    
                    // Focus on the next empty input or the last one
                    const nextEmptyIndex = digits.length < otpInputs.length ? digits.length : otpInputs.length - 1;
                    otpInputs[nextEmptyIndex].focus();
                    
                    checkOTPCompletion();
                });
            });
            
            // Check if all OTP inputs are filled
            function checkOTPCompletion() {
                const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
                verifyBtn.disabled = !allFilled;
            }
            
            // Form submission
            otpForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get the OTP value
                const otpValue = Array.from(otpInputs).map(input => input.value).join('');
                
                // For demo purposes, we'll consider "123456" as the correct OTP
                // In a real application, this would be validated against a backend
                if (otpValue === '123456') {
                    // Success - show animation
                    showSuccessAnimation();
                } else {
                    // Error - show error message
                    showErrorMessage();
                }
            });
            
            // Show success animation
            function showSuccessAnimation() {
                otpForm.style.display = 'none';
                successContainer.style.display = 'block';
                
                // Add bounce effect to the success message
                const successMessage = successContainer.querySelector('h3');
                successMessage.classList.add('bounce');
            }
            
            // Show error message
            function showErrorMessage() {
                errorMessage.style.display = 'block';
                
                // Shake animation for error
                otpForm.classList.add('shake');
                setTimeout(() => {
                    otpForm.classList.remove('shake');
                }, 500);
                
                // Clear inputs after error
                setTimeout(() => {
                    otpInputs.forEach(input => {
                        input.value = '';
                        input.classList.remove('filled');
                    });
                    otpInputs[0].focus();
                    verifyBtn.disabled = true;
                    errorMessage.style.display = 'none';
                }, 2000);
            }
            
            // Resend OTP functionality
            resendLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Only allow resend if timer has expired
                if (timeLeft > 0) return;
                
                // Reset timer
                resetTimer();
                
                // In a real application, this would make an API call to resend OTP
                alert('A new OTP has been sent to your device.');
            });
            
            // Reset button functionality
            resetBtn.addEventListener('click', function() {
                // Reset the form
                otpInputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('filled');
                });
                verifyBtn.disabled = true;
                
                // Show form, hide success
                otpForm.style.display = 'block';
                successContainer.style.display = 'none';
                
                // Focus on first input
                otpInputs[0].focus();
                
                // Reset timer
                resetTimer();
            });
            
            // Timer functions
            function startTimer() {
                clearInterval(timerInterval);
                timeLeft = 60;
                updateTimerDisplay();
                
                timerInterval = setInterval(() => {
                    timeLeft--;
                    updateTimerDisplay();
                    
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        timerElement.textContent = '';
                        resendLink.style.pointerEvents = 'auto';
                    }
                }, 1000);
            }
            
            function resetTimer() {
                startTimer();
                resendLink.style.pointerEvents = 'none';
            }
            
            function updateTimerDisplay() {
                timerElement.textContent = `(${timeLeft}s)`;
            }
            
            // Add shake animation CSS
            const style = document.createElement('style');
            style.textContent = `
                .shake {
                    animation: shake 0.5s;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        });