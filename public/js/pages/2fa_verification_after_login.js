document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLInputElement} */
    const codeInput = document.getElementById("codeVerification");
    /** @type {HTMLInputElement} */
    const trustDeviceCheckbox = document.getElementById("trustDevice");
    /** @type {HTMLButtonElement} */
    const submitCodeBtn = document.getElementById("submitCodeBtn");
    /** @type {HTMLButtonElement} */
    const resendCodeBtn = document.getElementById("resendCodeBtn");
    /** @type {HTMLDivElement} */
    const errorMessageEl = document.getElementById("errMessage");
    /** @type {HTMLDivElement} */
    const infoMessageEl = document.getElementById("infoMessage");
    const csrfToken = document.querySelector("meta[name=X-CSRF-TOKEN]").getAttribute("content");

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

    /**
     * Tampilkan pesan informasi
     * 
     * @param {string} message Pesan kesalahan
     */
    const showInfoMessage = (message) => {
        infoMessageEl.classList.remove("hidden");
        infoMessageEl.innerText = message;
    }

    /**
     * Hapus dan sembunyikan pesan informasi
     */
    const hideInfoMessage = () => {
        infoMessageEl.classList.add("hidden");
        infoMessageEl.innerText = '';
    }

    resendCodeBtn.addEventListener("click", async () => {
        hideErrorMessage();
        try {
            const resp = await fetch('/auth/security/2fa/resend', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    "x-csrf-token": csrfToken,
                    "Accept": 'application/json',
                },
            });
            if (!resp.ok) {
                const error = new Error();
                const errMessage = await resp.json();
                error.code = errMessage.code;
                if (resp.status === 429) {
                    const retryAfter = resp.headers.get('Retry-After');
                    if (retryAfter) {
                        const totalSeconds = parseInt(retryAfter, 10);
                        const minute = Math.floor(totalSeconds / 60);
                        const second = totalSeconds % 60;
                        const waitMessage = `Terlalu banyak percobaan, coba lagi dalam: ${minute} menit ${second} detik.`;
                        error.status = 429;
                        error.message = waitMessage;
                        throw error;
                    }
                }
                error.message = errMessage.error;
                throw error;
            }
            const { expiresIn } = await resp.json();
            const expiredToMinute = parseInt(expiresIn, 10) / 60;
            showInfoMessage(`Kode berhasil dikirim kembali, silakan cek email anda. Kode hanya berlaku selama ${expiredToMinute} menit.`);
            // Elemen info message akan disembunyikan dalam 6 detik
            setTimeout(() => hideInfoMessage(), 6000);
        } catch (err) {
            showErrorMessage(err.message);
        } finally {
            submitCodeBtn.disabled = false;
            resendCodeBtn.disabled = true;
        }
    });

    submitCodeBtn.addEventListener("click", async () => {
        hideInfoMessage();
        hideErrorMessage();
        const codeValue = codeInput.value.trim();
        const isCodeValidLength = (codeValue.length === 6);
        if (!isCodeValidLength) {
            showErrorMessage("Kode verifikasi tidak valid.")
            return;
        }
        const isCodeValidFormat = (/^\d+$/).test(codeValue);
        if (!isCodeValidFormat) {
            showErrorMessage("Kode verifikasi tidak valid.");
            return;
        }
        const trustDevice = trustDeviceCheckbox.checked;
        try {
            submitCodeBtn.disabled = true;
            const resp = await fetch('/auth/security/2fa/verify', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json; charset=utf-8',
                    "x-csrf-token": csrfToken,
                    "accept": 'application/json',
                },
                body: JSON.stringify({
                    code: codeValue,
                    trustDevice,
                }),
            });
            if (!resp.ok) {
                const error = new Error();
                const errMessage = await resp.json();
                error.code = errMessage.code;
                if (resp.status === 429) {
                    const retryAfter = resp.headers.get('Retry-After');
                    if (retryAfter) {
                        const totalSeconds = parseInt(retryAfter, 10);
                        const minute = Math.floor(totalSeconds / 60);
                        const second = totalSeconds % 60;
                        const waitMessage = `Terlalu banyak percobaan verifikasi, coba lagi dalam: ${minute} menit ${second} detik.`;
                        error.status = 429;
                        error.message = waitMessage;
                        throw error;
                    }
                }
                error.message = errMessage.error;
                throw error;
            }
            const { valid } = await resp.json();
            if (valid) {
                return window.location.assign('/dashboard');
            }
        } catch (err) {
            submitCodeBtn.disabled = false;
            if (err.code === "ERR_CHALLENGE_EXPIRED" || err.code === "ERR_CHALLENGE_SUPERSEDED") {
                submitCodeBtn.disabled = true;
                resendCodeBtn.disabled = false;
            }
            showErrorMessage(err.message);
            return;
        }
    });
});