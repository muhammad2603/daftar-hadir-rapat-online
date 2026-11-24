import SignaturePad from '/js/libs/signature_pad/dist/signature_pad.min.js';

document.addEventListener("DOMContentLoaded", () => {
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");
    /** @type {string} Slug kehadiran */
    const meetingSlugAttendance = document.querySelector('meta[name=meeting-slug-attendance]').getAttribute("content");
    const meetingInformationsEl = document.getElementById("meetingInformations");
    const openFormAttendanceBtn = document.getElementById("openFormAttendance");
    const formAttendanceEl = document.getElementById("formAttendance");
    const recordAttendanceBtn = document.getElementById("recordAttendance");
    /** @type {HTMLInputElement} */
    const namaLengkapInput = document.getElementById("namaLengkap");
    /** @type {HTMLInputElement} */
    const nomorHpInput = document.getElementById("nomorHp");
    /** @type {HTMLInputElement} */
    const jabatanInput = document.getElementById("jabatan");
    /** @type {HTMLInputElement} */
    const opdInput = document.getElementById("opd");
    const canvas = document.querySelector("canvas");
    const ttdText = document.getElementById("ttdText");
    const resetTtdBtn = document.getElementById("resetTtd");
    const disableSignaturePadAtEnd = () => {
        signaturePad.off();
        resetTtdBtn.classList.add("flex");
        resetTtdBtn.classList.remove("hidden");
        canvas.classList.remove("cursor-pen-tool");
    };
    const enableSignaturePad = () => {
        signaturePad.clear();
        canvas.classList.add("cursor-pen-tool");
        ttdText.classList.remove("hidden");
        signaturePad.on();
        resetTtdBtn.classList.remove("flex");
        resetTtdBtn.classList.add("hidden");
    };
    const signaturePad = new SignaturePad(canvas, {
        minWidth: 0.8
    });
    let signatureDataUrl = null;
    let lastWidth = 0;
    const resizeCanvas = () => {
        if (!canvas.offsetWidth) return;
        if (canvas.offsetWidth === lastWidth) return;
        lastWidth = canvas.offsetWidth;
        const data = signaturePad.toData();
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        signaturePad.clear();
        if (data.length) {
            signaturePad.fromData(data);
            signatureDataUrl = signaturePad.toDataURL();
        }
    }
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas);
    openFormAttendanceBtn.addEventListener("click", () => {
        meetingInformationsEl.classList.add("hidden");
        formAttendanceEl.classList.remove("hidden");
    });
    signaturePad.addEventListener("beginStroke", () => {
        ttdText.classList.add("hidden");
    });
    signaturePad.addEventListener("endStroke", () => {
        disableSignaturePadAtEnd();
        signatureDataUrl = signaturePad.toDataURL();
    });
    resetTtdBtn.addEventListener("click", () => {
        enableSignaturePad();
        signatureDataUrl = null;
    });
    recordAttendanceBtn.addEventListener("click", function () {
        const payload = {
            namaLengkap: namaLengkapInput.value.trim(),
            nomorHp: nomorHpInput.value.trim(),
            jabatan: jabatanInput.value.trim(),
            opd: opdInput.value.trim(),
        };
        if (
            payload.namaLengkap === '' ||
            payload.nomorHp === '' ||
            payload.jabatan === '' ||
            payload.opd === ''
        ) {
            return alert("Harap lengkapi data diri anda.")
        }
        if (signatureDataUrl === null) {
            return alert("Harap tanda tangan terlebih dahulu.")
        }
        const btn = this;
        btn.textContent = "Tunggu Sebentar...";
        btn.disabled = true;
        let isSaved = false;
        const signature = signatureDataUrl.split(",")[1];
        fetch(`/api/meetings/${meetingSlugAttendance}/attendance`, {
            method: "POST",
            headers: {
                "x-csrf-token": csrfToken,
                "content-type": 'application/json',
            },
            body: JSON.stringify({
                ...payload,
                signature
            })
        })
            .then(async resp => {
                if (!resp.ok) {
                    const response = await resp.json();
                    const error = new Error(response.error || "Terjadi kesalahan pada server.");
                    error.status = resp.status;
                    error.inputError = response.inputError;
                    throw error;
                }
                return await resp.json();
            })
            .then(res => {
                if (res.ok === true) {
                    alert("Kehadiran anda telah tersimpan. Terima kasih telah menggunakan aplikasi kami!");
                }
            })
            .catch(err => {
                return alert(err.message);
            })
            .finally(() => {
                btn.removeAttribute("disabled");
                btn.textContent = "Kirim & Konfirmasi Kehadiran";
            });
    });
});