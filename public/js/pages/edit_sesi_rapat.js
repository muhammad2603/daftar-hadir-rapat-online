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
    const btnEditSesiRapat = document.getElementById("editSesiRapat");
    const textBtnEditDefault = btnEditSesiRapat.innerText;
    const backPage = document.getElementById("backPage");
    /** @type {HTMLInputElement} */
    const inputJudulRapat = document.getElementById("judulRapat");
    /** @type {HTMLInputElement} */
    const inputTanggalRapat = document.getElementById("tanggalRapat");
    /** @type {HTMLInputElement} */
    const inputRuangRapat = document.getElementById("ruangRapat");
    /** @type {HTMLInputElement} */
    const inputAgendaRapat = document.getElementById("agendaRapat");
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");
    /** @type {string} Token CSRF */
    const sessionId = document.querySelector('meta[name=SESSION-ID]').getAttribute("content");
    btnEditSesiRapat.addEventListener("click", function () {
        backPage.classList.add("disabled", "pointer-events-none");
        let judul = inputJudulRapat.value.trim();
        const tanggal = inputTanggalRapat.value.trim();
        let ruang = inputRuangRapat.value.trim();
        let agenda = inputAgendaRapat.value.trim();
        btnEditSesiRapat.disabled = true;
        btnEditSesiRapat.innerHTML = loadingSvg + "Sebentar";
        judul = replaceNonAscii(segmenter, judul);
        ruang = replaceNonAscii(segmenter, ruang);
        agenda = replaceNonAscii(segmenter, agenda);
        const formData = new FormData();
        formData.append("judul", judul);
        formData.append("ruang", ruang);
        formData.append("tanggal", tanggal);
        formData.append("agenda", agenda);
        fetch(`/api/meeting/${sessionId}`, {
            method: "PUT",
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
                alert("Sesi rapat berhasil diperbarui!");
                window.location.assign("/dashboard/sesi-rapat/kelola");
                return;
            })
            .catch(err => {
                alert(err.message || "Gagal menyimpan sesi rapat.");
            })
            .finally(() => {
                btnEditSesiRapat.innerText = textBtnEditDefault;
                btnEditSesiRapat.removeAttribute("disabled");
            });
    });
});