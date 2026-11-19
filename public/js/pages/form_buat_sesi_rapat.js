const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

/**
 * Mengganti karakter Non-ASCII pada string
 * 
 * @param {Intl.Segmenter} segmenter
 * @param {string} str
 * @param {string} [replacedAs]
 */
function replaceNonAscii(segmenter, str, replacedAs = "") {
    const segments = Array.from(segmenter.segment(str), s => s.segment);
    const regex = /^[\x00-\x7F]$/;
    return segments
        .map(char => (regex.test(char) ? char : replacedAs))
        .join('')
        .trim();
}

const segmenter = new Intl.Segmenter("en", { granularity: 'grapheme' });

document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLButtonElement} */
    const btnCreate = document.getElementById("create");
    const backPage = document.getElementById("backPage");
    const textBtnCreateDefault = btnCreate.innerText;
    /** @type {HTMLInputElement} */
    const inputJudulRapat = document.getElementById("judulRapat");
    /** @type {HTMLInputElement} */
    const inputTanggalRapat = document.getElementById("tanggalRapat");
    /** @type {HTMLInputElement} */
    const inputRuangRapat = document.getElementById("ruangRapat");
    /** @type {HTMLInputElement} */
    const inputAgendaRapat = document.getElementById("agendaRapat");
    /** @type {HTMLInputElement} */
    const inputKopSuratRapat = document.getElementById("kopSurat");
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");

    const errorMessageEl = {
        judul: document.getElementById("judulRapatError"),
        tanggal: document.getElementById("tanggalRapatError"),
        ruang: document.getElementById("ruangRapatError"),
        agenda: document.getElementById("agendaRapatError"),
        fileKop: document.getElementById("fileKopError")
    };

    btnCreate.addEventListener("click", () => {
        backPage.classList.add("disabled", "pointer-events-none");
        let judul = inputJudulRapat.value.trim();
        const tanggal = inputTanggalRapat.value.trim();
        let ruang = inputRuangRapat.value.trim();
        let agenda = inputAgendaRapat.value.trim();
        /** @type {File} */
        const fileKop = inputKopSuratRapat.files[0];
        let isValid = true;
        const errors = {
            judul: null,
            tanggal: null,
            ruang: null,
            agenda: null,
            fileKop: null
        };
        if (judul === '') {
            errors.judul = "input tidak boleh kosong.";
            isValid = false;
        }
        const judulLength = judul.length;
        const isInvalidJudulLength = (judulLength < 15 || judulLength > 60);
        if (
            errors.judul === null &&
            isInvalidJudulLength
        ) {
            errors.judul = "Panjang input tidak boleh kurang dari 15 karakter dan tidak lebih dari 60 karakter.";
            isValid = false;
        }
        const isJudulInvalid = /[^A-Za-z\d\-\/\(\)\s]/.test(judul);
        if (errors.judul === null && isJudulInvalid) {
            errors.judul = "Input hanya mengandung huruf, angka, garis miring, tanda -, dan tanda kurung.";
            isValid = false;
        }
        if (tanggal === '') {
            errors.tanggal = "Pilih tanggal rapat.";
            isValid = false;
        }
        const tanggalToDate = new Date(tanggal).setHours(0, 0, 0);
        const currDate = new Date().setHours(0, 0, 0);
        if (errors.tanggal === null && tanggalToDate > currDate) {
            errors.tanggal = "Tanggal tidak boleh lebih dari hari ini.";
            isValid = false;
        }
        if (ruang === '') {
            errors.ruang = "Input tidak boleh kosong.";
            isValid = false;
        }
        const ruangLength = ruang.length;
        const isInvalidRuangLength = (ruangLength < 3 || ruangLength > 50);
        if (
            errors.ruang === null &&
            isInvalidRuangLength
        ) {
            errors.ruang = "Panjang input tidak boleh kurang dari 3 karakter dan tidak lebih dari 50 karakter.";
            isValid = false;
        }
        const isRuangInvalid = /[^A-Za-z\d\-\/\(\)\s.]/.test(ruang);
        if (errors.ruang === null && isRuangInvalid) {
            errors.ruang = "Input hanya boleh mengandung huruf, angka, garis miring, tanda -, tanda kurung, dan titik.";
            isValid = false;
        }
        const agendaLength = agenda.length;
        const isAgendaFilled = agendaLength > 0;
        const isAgendaInvalidLength = (agendaLength < 15 || agendaLength > 255);
        if (
            errors.agenda === null &&
            isAgendaFilled &&
            isAgendaInvalidLength
        ) {
            errors.agenda = "Panjang input tidak boleh kurang dari 15 karakter dan tidak lebih dari 255 karakter.";
            isValid = false;
        }
        if (fileKop) {
            const fileKopExt = fileKop.type;
            const fileKopAllowedExt = ['image/jpeg', 'image/png'];
            if (!fileKopAllowedExt.includes(fileKopExt)) {
                errors.fileKop = 'Ekstensi file yang diizinkan hanya JPG atau PNG.';
                isValid = false;
            }
            const MAX_FILE_SIZE = 5.0;
            const fileKopSize = fileKop.size;
            const fileKopSizeToMB = Number((fileKopSize / (1024 * 1024)).toFixed(1));
            if (errors.fileKop === null && fileKopSizeToMB > MAX_FILE_SIZE) {
                errors.fileKop = 'Ukuran file terlalu besar (maks. 5 MB).'
                isValid = false;
            }
        }
        Object.entries(errors).forEach(([error, message]) => {
            if (message !== null) {
                errorMessageEl[error].textContent = message;
            } else {
                errorMessageEl[error].textContent = '';
            }
        })
        if (!isValid) {
            return;
        };
        judul = replaceNonAscii(segmenter, judul);
        ruang = replaceNonAscii(segmenter, ruang);
        agenda = replaceNonAscii(segmenter, agenda);
        const formData = new FormData();
        formData.append("judul", judul);
        formData.append("ruang", ruang);
        formData.append("tanggal", tanggal);
        formData.append("agenda", agenda);
        formData.append("fileKop", fileKop);
        btnCreate.disabled = true;
        btnCreate.innerHTML = loadingSvg + "Sebentar";
        fetch("/api/meeting/save", {
            method: "POST",
            headers: {
                "x-csrf-token": csrfToken,
            },
            body: formData
        })
            .then(async resp => {
                const text = await resp.text();
                const response = text ? JSON.parse(text) : {};
                if (!resp.ok) {
                    const error = new Error(response.error || "Terjadi kesalahan pada server.");
                    error.status = resp.status;
                    error.inputError = response.inputError;
                    throw error;
                }
                return response;
            })
            .then(() => {
                alert("Sesi rapat berhasil ditambahkan!");
                window.location.assign("/dashboard/sesi-rapat/kelola");
                return;
            })
            .catch(err => {
                if (err.inputError && errorMessageEl[err.inputError]) {
                    errorMessageEl[err.inputError].textContent = err.message;
                } else {
                    alert(err.message || "Gagal menyimpan sesi rapat.");
                }
            })
            .finally(() => {
                btnCreate.innerText = textBtnCreateDefault;
                btnCreate.removeAttribute("disabled");
            });
    });
});