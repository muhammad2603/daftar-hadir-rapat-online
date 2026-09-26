/**
 * Membuka Pop Up
 * 
 * @param {HTMLElement} popUpWindowEl
 * @param {string} message Pesan Pop Up
 * @return {Promise<{
 *  closed: Boolean|undefined,
 *  confirmed: Boolean|undefined
 * }>}
*/
function openPopUpConfirm(popUpWindowEl, message) {
    const btnClosePopUp = popUpWindowEl.querySelector(".btn-close-pop-up");
    const btnConfirmPopUp = popUpWindowEl.querySelector(".btn-confirm-pop-up");
    showPopUp(popUpWindowEl, message);
    return new Promise((resolve) => {
        btnClosePopUp.addEventListener("click", () => resolve({ closed: true }), { once: true });
        btnConfirmPopUp.addEventListener("click", () => resolve({ confirmed: true }), { once: true });
    });
}

/**
 * Menutup Pop Up
 * 
 * @param {HTMLElement} popUpWindowEl
 * @return {void}
 */
function closePopUp(popUpWindowEl) {
    popUpWindowEl.classList.remove("flex");
    popUpWindowEl.classList.add("hidden");
}

/**
 * Menampilkan Pop Up
 * 
 * @param {HTMLElement} popUpWindowEl
 * @return {void}
 */
function showPopUp(popUpWindowEl, message) {
    const popUpMessageEl = popUpWindowEl.querySelector(".message");
    popUpMessageEl.textContent = message;
    popUpWindowEl.classList.remove("hidden");
    popUpWindowEl.classList.add("flex");
}

export {
    openPopUpConfirm,
    closePopUp,
    showPopUp,
};