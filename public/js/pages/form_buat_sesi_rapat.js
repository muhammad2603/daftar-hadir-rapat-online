const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLButtonElement} */
    const btnCreate = document.getElementById("create");
    const textBtnCreateDefault = btnCreate.innerText;
    btnCreate.addEventListener("click", () => {
        // __COMMENT__ Animasi loading state
        btnCreate.disabled = true;
        btnCreate.innerHTML = loadingSvg + "Sebentar";
        console.log("Sedang membuat sesi rapat...");
        // __COMMENT__ State ketika telah mendapatkan response dari server
        /**
         * Saat server mengembalikan response OK, user akan diarahkan ke /dashboard/sesi-rapat/kelola.
         */
        setTimeout(() => {
            btnCreate.innerText = textBtnCreateDefault;
            btnCreate.removeAttribute("disabled");
            console.log("Sesi rapat telah ditambahkan.");
            window.location.assign("/dashboard/sesi-rapat/kelola");
        }, 5000);
    });
});