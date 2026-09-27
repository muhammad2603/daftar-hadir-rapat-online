import { PopUp } from "../cores/PopUp.js";

document.addEventListener("DOMContentLoaded", () => {
    const popUpQr = new PopUp(document.getElementById("qrCode"));
    const btnShowQr = document.getElementById("btnShowQrCode");
    const btnCloseQrCode = document.getElementById("btnCloseQrCode");
    btnShowQr.addEventListener("click", () => popUpQr.showPopUp());
    btnCloseQrCode.addEventListener("click", () => popUpQr.closePopUp());
    const btnEndSession = document.getElementById("btnEndSession");
    // __COMMENT__ Aksi untuk mengakhiri sesi tidak butuh Pop Up, aksi akan langsung dilakukan.
    btnEndSession.addEventListener("click", () => {
        console.log("Tombol akhiri sesi diklik.");
    });
});