import { openPopUpConfirm, closePopUp } from '../cores/PopUp.js';

document.addEventListener("DOMContentLoaded", () => {
    const popUpBtn = document.querySelectorAll(".pop-up-btn[data-pop-up-type]");
    popUpBtn.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const popUpType = currBtn.dataset.popUpType;
            const messageText = currBtn.dataset.popUpMessage;
            const popUpWindowEl = document.getElementById(popUpType);
            const setMessagePopUp = `Sesi rapat dengan judul "${messageText}" akan berakhir.`;
            const { closed, confirmed } = await openPopUpConfirm(
                popUpWindowEl,
                setMessagePopUp
            );
            if (closed) {
                closePopUp(popUpWindowEl);
            }
            if (confirmed) {
                closePopUp(popUpWindowEl);
                console.log("Dikonfirmasi!");
            }
        });
    });
});