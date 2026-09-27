import { PopUp } from '../cores/PopUp.js';

document.addEventListener("DOMContentLoaded", () => {
    const popUpBtn = document.querySelectorAll(".pop-up-btn[data-pop-up-type]");
    popUpBtn.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const popUpType = currBtn.dataset.popUpType;
            const messageText = currBtn.dataset.popUpMessage;
            const popUpWindowEl = document.getElementById(popUpType);
            const popUp = new PopUp(popUpWindowEl);
            const setMessagePopUp = `Sesi rapat dengan judul "${messageText}" akan berakhir.`;
            const { closed, confirmed } = await popUp.openPopUpConfirm({ header: "Apakah Anda yakin ingin mengakhiri sesi?", body: setMessagePopUp });
            if (closed) {
                popUp.closePopUp(popUpWindowEl);
            }
            if (confirmed) {
                popUp.closePopUp(popUpWindowEl);
                console.log("Sedang mengakhiri sesi...");
            }
        });
    });
});