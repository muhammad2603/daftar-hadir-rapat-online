document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLInputElement} */
    const usernameInput = document.getElementById("username");
    /** @type {HTMLInputElement} */
    const passwordInput = document.getElementById("password");
    /** @type {HTMLButtonElement} */
    const submitBtn = document.getElementById("submitBtn");
    /** @type {HTMLButtonElement} */
    const showPasswordBtn = document.getElementById("showPasswordBtn");
    /** @type {HTMLDivElement} */
    const errorMessageEl = document.getElementById("errorMessage");

    /**
     * Tampilkan pesan kesalahan input
     * 
     * @param {string} message Pesan kesalahan
     */
    const showErrorMessage = (message) => {
        errorMessageEl.classList.remove("hidden");
        errorMessageEl.innerText = message;
    }

    /**
     * Hapus dan sembunyikan pesan kesalahan input
     */
    const hideErrorMessage = () => {
        errorMessageEl.classList.add("hidden");
        errorMessageEl.innerText = '';
    }

    usernameInput.addEventListener("change", function () {
        const lowercase = this.value.toLowerCase().trim();
        this.value = lowercase;
    });

    showPasswordBtn.addEventListener("click", function () {
        /** @type {HTMLButtonElement} */
        const btn = this;
        const currShowState = (btn.dataset.showState === 'true');
        if (!currShowState) {
            passwordInput.type = 'text';
            btn.textContent = 'Hide Password';
            btn.title = 'Sembunyikan Password';
        } else {
            passwordInput.type = 'password';
            btn.textContent = 'Show Password'
            btn.title = 'Lihat Password';
        }
        // Negasi hasil state saat ini, cth: ("true" === "true") = false
        btn.dataset.showState = !currShowState;
        btn.classList.toggle("showed");
    });

    submitBtn.addEventListener("click", async () => {
        hideErrorMessage();
        const usernameValue = usernameInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        if (
            usernameValue === '' ||
            passwordValue === ''
        ) {
            showErrorMessage('Username dan password tidak boleh kosong.');
            return;
        }
        /** Username memiliki batas minimal 5 karakter dan maksimal 20 karakter */
        const isUsernameLengthValid = (usernameValue.length < 5 || usernameValue.length > 20);
        if (
            isUsernameLengthValid ||
            passwordValue.length < 8
        ) {
            showErrorMessage('Username atau password salah.');
            return;
        }
        const usernameRegex = /[^a-z_\d]/;
        if (usernameRegex.test(usernameValue)) {
            showErrorMessage("Username atau password salah.");
            return;
        }
        /**
         * Kombinasi Password: minimal 1 huruf kecil dan besar, 1 angka, dan satu simbol dari `@ # $ % ^ & *` (NOTE: Tidak dapat menggunakan selain dari simbol tersebut).
         * Panjang password minimal 8 karakter dan maksimal 20 karakter.
         */
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*]{8,20}$/;
        if (!passwordRegex.test(passwordValue)) {
            showErrorMessage("Username atau password salah.");
            return;
        }
        submitBtn.disabled = true;
        try {
            const fetchLoginAttemptConf = {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({
                    username: usernameValue,
                    password: passwordValue
                })
            };
            const attempt = await fetch('/login', fetchLoginAttemptConf);
            if (!attempt.ok) {
                const error = new Error();
                if (attempt.status === 429) {
                    const retryAfter = attempt.headers.get("Retry-After");
                    if (retryAfter) {
                        const totalSeconds = parseInt(retryAfter, 10);
                        const menit = Math.floor(totalSeconds / 60);
                        const second = totalSeconds % 60;
                        const waitMessage = `Terlalu banyak percobaan login, coba lagi dalam: ${menit} menit ${second} detik.`;
                        error.status = 429;
                        error.message = waitMessage;
                        throw error;
                    }
                }
                const errorMessage = await attempt.json();
                error.message = errorMessage.error || "Terjadi kesalahan pada server, coba lagi nanti.";
                throw error;
            }
            const response = await attempt.json();
            const isRequires2fa = response.requires2fa;
            if (isRequires2fa) {
                const redirectUrl = response.redirect || '/login/2fa-verification';
                window.location.replace(redirectUrl);
                return;
            }
            if (response.ok === true) {
                window.location.replace(response.redirect);
            }
        } catch (error) {
            if (error.status === 429) {
                showErrorMessage(error.message);
                return;
            }
            showErrorMessage(error.message);
        } finally {
            submitBtn.disabled = false;
        }
    });
});