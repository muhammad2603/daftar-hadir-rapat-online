document.addEventListener("DOMContentLoaded", () => {
    const dropFileZoneEl = document.getElementById("dropFileZone");
    const previewKopSuratWrapper = document.getElementById("previewKopSurat");
    const previewImgEl = document.getElementById("previewImg");
    const fileInput = document.getElementById("kopSuratDefault");
    const labelDropZoneFile = dropFileZoneEl.querySelector("label");

    dropFileZoneEl.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    dropFileZoneEl.addEventListener("dragenter", () => {
        // __COMMENT__ Matikan events label ketika dragenter terpicu
        labelDropZoneFile.classList.add("pointer-events-none");
        dropFileZoneEl.classList.remove("border-gray-200");
        dropFileZoneEl.classList.add("border-blue-700/70", "bg-gray-50");
    });

    dropFileZoneEl.addEventListener("dragleave", () => {
        // __COMMENT__ Kembalikan events label ketika dragleave terpicu
        labelDropZoneFile.classList.remove("pointer-events-none");
        dropFileZoneEl.classList.add("border-gray-200");
        dropFileZoneEl.classList.remove("border-blue-700/70", "bg-gray-50");
    });

    dropFileZoneEl.addEventListener("drop", (event) => {
        event.preventDefault();
        const [file] = event.dataTransfer.files;
        if (file) {
            if (!file.type.startsWith("image/")) return;
            dropFileZoneEl.classList.add("hidden");
            previewKopSuratWrapper.classList.remove("hidden");
            const imageUrl = URL.createObjectURL(file);
            previewImgEl.src = imageUrl;
        }
    });

    fileInput.addEventListener("change", (event) => {
        const [file] = event.target.files;
        if (file) {
            dropFileZoneEl.classList.add("hidden");
            previewKopSuratWrapper.classList.remove("hidden");
            const imageUrl = URL.createObjectURL(file);
            previewImgEl.src = imageUrl;
        }
    });
});