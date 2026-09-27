import { PopUp } from "../cores/PopUp.js";

document.addEventListener("DOMContentLoaded", () => {
    const btnEndSession = document.querySelectorAll(".btn-end-session[data-pop-up-type]");
    btnEndSession.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const popUpType = currBtn.dataset.popUpType;
            const messageText = currBtn.dataset.popUpMessage;
            const popUpWindowEl = document.getElementById(popUpType);
            const popUp = new PopUp(popUpWindowEl);
            const messagePopUp = `Sesi rapat dengan judul "${messageText}" akan berakhir.`;
            const { closed, confirmed } = await popUp.openPopUpConfirm({ header: 'Apakah Anda yakin ingin mengakhiri sesi?', body: messagePopUp });
            if (closed) {
                popUp.closePopUp(popUpWindowEl);
            }
            if (confirmed) {
                popUp.closePopUp(popUpWindowEl);
                console.log("Sesi telah berakhir.");
            }
        });
    });
    const btnDeleteSession = document.querySelectorAll(".btn-delete-session[data-pop-up-type]");
    btnDeleteSession.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLElement} */
            const currBtn = this;
            const popUpType = currBtn.dataset.popUpType;
            const messageText = currBtn.dataset.popUpMessage;
            const popUpWindowEl = document.getElementById(popUpType);
            const popUp = new PopUp(popUpWindowEl);
            const messagePopUp = `Sesi rapat dengan judul "${messageText}" akan dihapus secara permanen. Sesi tidak dapat dipulihkan!`;
            const { closed, confirmed } = await popUp.openPopUpConfirm({ header: 'Apakah Anda yakin ingin menghapus sesi?', body: messagePopUp });
            if (closed) {
                popUp.closePopUp(popUpWindowEl);
            }
            if (confirmed) {
                popUp.closePopUp(popUpWindowEl);
                console.log("Sesi telah terhapus.");
            }
        });
    });
});