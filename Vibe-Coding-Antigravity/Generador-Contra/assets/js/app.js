document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('generator-form');
    const lengthSlider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const passwordOutput = document.getElementById('password-output');
    
    const optUppercase = document.getElementById('opt-uppercase');
    const optLowercase = document.getElementById('opt-lowercase');
    const optNumbers = document.getElementById('opt-numbers');
    const optSymbols = document.getElementById('opt-symbols');
    
    const copyBtn = document.getElementById('copy-btn');
    const toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
    const eyeIcon = document.getElementById('eye-icon');
    const eyeSlashIcon = document.getElementById('eye-slash-icon');
    
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const notificationArea = document.getElementById('notification-area');

    // Character Sets
    const CHARS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    // Update length display on slider move
    lengthSlider.addEventListener('input', (e) => {
        lengthDisplay.textContent = e.target.value;
    });

    // Generate Password Event
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        handleGeneratePassword();
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const password = passwordOutput.value;
        if (!password) {
            showNotification('No hay contraseña para copiar', true);
            return;
        }

        navigator.clipboard.writeText(password).then(() => {
            showNotification('¡Contraseña copiada al portapapeles!', false);
        }).catch(() => {
            showNotification('Error al copiar la contraseña', true);
        });
    });

    // Toggle Password Visibility
    toggleVisibilityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = passwordOutput.type === 'password';
        
        if (isPassword) {
            passwordOutput.type = 'text';
            eyeIcon.classList.add('d-none');
            eyeSlashIcon.classList.remove('d-none');
        } else {
            passwordOutput.type = 'password';
            eyeSlashIcon.classList.add('d-none');
            eyeIcon.classList.remove('d-none');
        }
    });

    // Core Logic: Generate Password
    function handleGeneratePassword() {
        const length = parseInt(lengthSlider.value, 10);
        const useUpper = optUppercase.checked;
        const useLower = optLowercase.checked;
        const useNumbers = optNumbers.checked;
        const useSymbols = optSymbols.checked;

        if (!useUpper && !useLower && !useNumbers && !useSymbols) {
            showNotification('Selecciona al menos un tipo de carácter', true);
            return;
        }

        let charset = '';
        if (useUpper) charset += CHARS.uppercase;
        if (useLower) charset += CHARS.lowercase;
        if (useNumbers) charset += CHARS.numbers;
        if (useSymbols) charset += CHARS.symbols;

        let password = '';
        
        // Ensure at least one character from each selected set
        const requiredChars = [];
        if (useUpper) requiredChars.push(getRandomChar(CHARS.uppercase));
        if (useLower) requiredChars.push(getRandomChar(CHARS.lowercase));
        if (useNumbers) requiredChars.push(getRandomChar(CHARS.numbers));
        if (useSymbols) requiredChars.push(getRandomChar(CHARS.symbols));

        for (let i = 0; i < requiredChars.length; i++) {
            password += requiredChars[i];
        }

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += getRandomChar(charset);
        }

        // Shuffle password
        password = shuffleString(password);

        // Update UI
        passwordOutput.value = password;
        updateStrengthUI(password);
    }

    // Helper: Get random character from string
    function getRandomChar(str) {
        const randomIndex = Math.floor(Math.random() * str.length);
        return str[randomIndex];
    }

    // Helper: Shuffle string securely
    function shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array.join('');
    }

    // Core Logic: Calculate Strength
    function updateStrengthUI(password) {
        let score = 0;
        if (password.length > 8) score += 1;
        if (password.length > 12) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        let percent = 0;
        let text = '';
        let colorClass = '';
        let barColor = '';

        if (score <= 2) {
            percent = 25;
            text = 'Débil';
            colorClass = 'strength-text-weak';
            barColor = 'var(--strength-weak)';
        } else if (score <= 4) {
            percent = 50;
            text = 'Media';
            colorClass = 'strength-text-medium';
            barColor = 'var(--strength-medium)';
        } else if (score === 5) {
            percent = 75;
            text = 'Fuerte';
            colorClass = 'strength-text-strong';
            barColor = 'var(--strength-strong)';
        } else {
            percent = 100;
            text = 'Muy Fuerte';
            colorClass = 'strength-text-very-strong';
            barColor = 'var(--strength-very-strong)';
        }

        // Apply styles
        strengthBar.style.width = percent + '%';
        strengthBar.style.backgroundColor = barColor;
        
        // Remove previous color classes
        strengthText.className = 'ms-3 fs-5 fw-bold';
        strengthText.classList.add(colorClass);
        
        // Ensure no innerHTML, just textContent
        strengthText.textContent = text;
    }

    // Visual Feedback (No innerHTML, no alert)
    function showNotification(message, isError) {
        // Clear previous
        while (notificationArea.firstChild) {
            notificationArea.removeChild(notificationArea.firstChild);
        }

        const toast = document.createElement('div');
        toast.className = 'custom-toast text-center';
        if (isError) {
            toast.style.backgroundColor = 'var(--strength-weak)';
        }
        
        const textNode = document.createTextNode(message);
        toast.appendChild(textNode);
        
        notificationArea.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notificationArea.contains(toast)) {
                notificationArea.removeChild(toast);
            }
        }, 3000);
    }

    // Init: Generate one password on load
    handleGeneratePassword();
});
