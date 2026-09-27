/**
 * @typedef {Object} PopUpMessages
 * 
 * @property {string} header
 * @property {string} body
 */

/** @class Membuat interaksi Pop Up */
export class PopUp {
    /**
     * @constructor
     * @param {HTMLElement} popUpWindowEl
     */
    constructor(popUpWindowEl) {
        this.popUpWindow = popUpWindowEl;
    }

    /**
     * Menampilkan Pop Up
     * 
     * @param {PopUpMessages} messages
     * @return {void}
     */
    showPopUp(messages) {
        const { header, body } = messages;
        this.popUpWindow.querySelector('.header-message').textContent = header;
        this.popUpWindow.querySelector('.body-message').textContent = body;
        this.popUpWindow.classList.remove("hidden");
        this.popUpWindow.classList.add("flex");
    }

    /**
     * Menutup Pop Up
     * @return {void}
     */
    closePopUp() {
        this.popUpWindow.classList.remove("flex");
        this.popUpWindow.classList.add("hidden");
    }

    /**
     * Membuka Pop Up
     * 
     * @param {PopUpMessages} messages
     * @return {Promise<{
     *  closed: Boolean|undefined,
     *  confirmed: Boolean|undefined
     * }>}
    */
    openPopUpConfirm(messages) {
        const btnClosePopUp = this.popUpWindow.querySelector(".btn-close-pop-up");
        const btnConfirmPopUp = this.popUpWindow.querySelector(".btn-confirm-pop-up");
        this.showPopUp(messages);
        return new Promise((resolve) => {
            btnClosePopUp.addEventListener("click", () => resolve({ closed: true }), { once: true });
            btnConfirmPopUp.addEventListener("click", () => resolve({ confirmed: true }), { once: true });
        });
    }
}