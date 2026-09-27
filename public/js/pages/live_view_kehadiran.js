import { PopUp } from "../cores/PopUp.js";

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    const popUpQr = new PopUp(document.getElementById("qrCode"));
    const btnShowQr = document.getElementById("btnShowQrCode");
    const btnCloseQrCode = document.getElementById("btnCloseQrCode");
    btnShowQr.addEventListener("click", () => popUpQr.showPopUp());
    btnCloseQrCode.addEventListener("click", () => popUpQr.closePopUp());
    const btnEndSession = document.getElementById("btnEndSession");
    // __COMMENT__ Aksi untuk mengakhiri sesi tidak butuh Pop Up, aksi akan langsung dilakukan.
    btnEndSession.addEventListener("click", function () {
        // __COMMENT__ Animasi loading state
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        const defaultTextBtn = currBtn.textContent;
        currBtn.innerHTML = loadingSvg;
        currBtn.disabled = true;
        console.log("Sedang mengakhiri sesi...");
        // __COMMENT__ State ketika request telah mendapat response dari server
        /**
         * Setelah mendapat response OK dari server, user akan diarahkan ke uri /dashboard/sesi-rapat/riwayat.
         * User tidak dapat kembali ke-halaman ini setelah diarahkan ke uri tersebut karena sesi telah berakhir.
         */
        setTimeout(() => {
            currBtn.innerText = defaultTextBtn;
            currBtn.removeAttribute("disabled");
            console.log("Sesi telah berakhir.")
            window.location.replace('/dashboard/sesi-rapat/riwayat');
        }, 5000);
    });
    const popUpTtdImage = new PopUp(document.getElementById("popUpTtdImage"));
    const ttdImage = document.getElementById("ttdImage");
    const btnCloseTtdImage = document.getElementById('btnCloseTtdImage');
    ttdImage.addEventListener("click", () => popUpTtdImage.showPopUp());
    btnCloseTtdImage.addEventListener("click", () => popUpTtdImage.closePopUp())
});