document.addEventListener("DOMContentLoaded", () => {
    const dropFileZone = document.getElementById("dropFileZone");
    const previewKopSuratWrapper = document.getElementById("previewKopSurat");
    const previewImgEl = document.getElementById("previewImg");
    const fileInput = document.getElementById("kopSuratDefault");
    const hapusKopSuratBtn = document.getElementById("hapusKopSurat");

    dropFileZone.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    dropFileZone.addEventListener("dragenter", () => {
        dropFileZone.classList.remove("border-gray-200");
        dropFileZone.classList.add("border-blue-700/70", "bg-gray-50");
    });

    dropFileZone.addEventListener("dragleave", () => {
        dropFileZone.classList.add("border-gray-200");
        dropFileZone.classList.remove("border-blue-700/70", "bg-gray-50");
    });

    dropFileZone.addEventListener("drop", (event) => {
        event.preventDefault();
        const [file] = event.dataTransfer.files;
        if (file) {
            if (!file.type.startsWith("image/")) return;
            dropFileZone.classList.add("hidden");
            previewKopSuratWrapper.classList.remove("hidden");
            const imageUrl = URL.createObjectURL(file);
            previewImgEl.src = imageUrl;
        }
        dropFileZone.classList.add("border-gray-200");
        dropFileZone.classList.remove("border-blue-700/70", "bg-gray-50");
    });

    fileInput.addEventListener("change", (event) => {
        const [file] = event.target.files;
        if (file) {
            dropFileZone.classList.add("hidden");
            previewKopSuratWrapper.classList.remove("hidden");
            const imageUrl = URL.createObjectURL(file);
            previewImgEl.src = imageUrl;
        }
    });

    hapusKopSuratBtn.addEventListener("click", () => {
        fileInput.value = '';
        previewImgEl.removeAttribute("src");
        previewKopSuratWrapper.classList.add("hidden");
        dropFileZone.classList.remove("hidden");
    });
});