const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    const submitKopSuratDefault = document.getElementById("submitKopSurat");
    submitKopSuratDefault.addEventListener("click", function () {
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        // __COMMENT__ Loading state yang sedang menunggu response
        currBtn.disabled = true;
        currBtn.querySelector("svg").classList.add("hidden");
        currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
        console.log("Sedang mengupload kop surat default...")
        // __COMMENT__ State saat request telah mendapatkan response dari server
        /**
         * Server akan memberikan response OK dan preview harus disembunyikan kembali, reset juga value input:file kop surat defaultnya.
        */
        setTimeout(() => {
            currBtn.firstElementChild.remove();
            currBtn.querySelector("svg").classList.remove("hidden");
            currBtn.removeAttribute("disabled");
            console.log("Kop surat default berhasil diupload.");
        }, 5000);
    });
});