import DragAndDrop from '../utils/DragAndDrop.js';

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLInputElement} */
    const kopSuratDefault = document.getElementById("kopSuratDefault");
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");
    const btnChangeKopSurat = document.getElementById("submitKopSurat");
    btnChangeKopSurat.addEventListener("click", function () {
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        const fileKop = kopSuratDefault.files[0];
        if (!fileKop) return;
        currBtn.disabled = true;
        currBtn.querySelector("svg").classList.add("hidden");
        currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
        const formData = new FormData();
        formData.append("fileKop", fileKop);
        fetch("/api/kop-default", {
            method: "POST",
            headers: {
                "x-csrf-token": csrfToken,
            },
            body: formData
        })
            .then(async resp => {
                return await resp.json();
            })
            .then(res => window.location.reload())
            .catch(err => console.error("Terjadi kesalahan pada server!"))
            .finally(() => {
                currBtn.firstElementChild.remove();
                currBtn.querySelector("svg").classList.remove("hidden");
                currBtn.removeAttribute("disabled");
            });
    });

    const kopSuratInputWrapper = document.getElementById("kopSuratInputWrapper");
    const btnDeleteFile = document.getElementById("hapusKopSurat");
    const dropZoneEl = document.getElementById("dropFileZone");
    const previewKopEl = document.getElementById("previewKopSurat");
    const previewImgEl = document.getElementById("previewImg");

    /**
     * Membuat object blob dari input file
     * @param {File} file Object File
     */
    const createObjectUrlFromFile = (file) => {
        return URL.createObjectURL(file);
    }
    /**
     * Tampilkan file gambar ke-preview dari sumber blob url
     * @param {File} file
     */
    const previewImageFile = (file) => {
        previewKopEl.classList.remove("hidden");
        previewImgEl.classList.remove("hidden");
        previewImgEl.src = createObjectUrlFromFile(file);
    }
    /**
     * Cek MIME File
     * 
     * @param {File} file
     * @param {string} mimeType
     * Tipe mime seperti "image/png" atau "image/" untuk mengizinkan semua ekstensi gambar.
     * @returns {boolean}
     * `true` jika valid.
     */
    const checkMimeFile = (file, mimeType) => {
        return file.type.startsWith(mimeType);
    }
    const dropZoneOnActive = () => {
        dropZoneEl.classList.remove("border-gray-200");
        dropZoneEl.classList.add("border-blue-700/70", "bg-gray-50");
    }
    const dropZoneDisactive = () => {
        dropZoneEl.classList.add("border-gray-200");
        dropZoneEl.classList.remove("border-blue-700/70", "bg-gray-50");
    }

    const onDragEnter = () => dropZoneOnActive();
    const onDragLeave = () => dropZoneDisactive();
    const onDrop = (event) => {
        const [file] = event.dataTransfer.files;
        dropZoneDisactive();
        if (!file || !checkMimeFile(file, "image/")) return;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        kopSuratDefault.files = dataTransfer.files;
        dropZoneEl.classList.add("hidden");
        previewImageFile(file);
        btnChangeKopSurat.classList.remove("hidden");
    };
    const onFileChange = (event) => {
        const [file] = event.target.files;
        if (!file || !checkMimeFile(file, "image/")) return event.target.value = '';
        dropZoneEl.classList.add("hidden");
        previewImageFile(file);
        btnChangeKopSurat.classList.remove("hidden");
    };
    const onFileDelete = () => {
        kopSuratDefault.value = '';
        kopSuratInputWrapper.classList.remove("hidden");
        previewImgEl.removeAttribute("src");
        previewKopEl.classList.add("hidden");
        dropZoneEl.classList.remove("hidden");
    };

    DragAndDrop({
        inputFile: kopSuratDefault,
        dropZoneEl,
        btnDeleteFile
    }, {
        onDragEnter,
        onDragLeave,
        onDrop,
        onFileChange,
        onFileDelete
    });
});