import { PopUp } from "../cores/PopUp.js";
import { Notification } from "../cores/Notification.js";
import { IconsNotification } from "../utils/notification/IconsNotification.js";

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

const notification = Notification();

const { octagonX, clockCheck, trash } = IconsNotification;

document.addEventListener("DOMContentLoaded", () => {
    const btnEndSession = document.querySelectorAll(".btn-end-session[data-pop-up-type]");
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");
    btnEndSession.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLButtonElement} */
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
                const sessionId = currBtn.dataset.sessionId;
                currBtn.disabled = true;
                currBtn.firstElementChild.classList.add("hidden");
                currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
                fetch(`/api/meeting/${sessionId}/end-session`, {
                    method: "PATCH",
                    headers: {
                        "x-csrf-token": csrfToken,
                    },
                })
                    .then(async resp => {
                        const text = await resp.text();
                        const response = text ? JSON.parse(text) : {};
                        if (!resp.ok) {
                            const error = new Error(response.error || "Terjadi kesalahan pada server.");
                            error.status = resp.status;
                            throw error;
                        }
                        return response;
                    })
                    .then(() => {
                        notification.success("Sesi telah berakhir. Tunggu halaman selesai memuat ulang!", octagonX)
                        setTimeout(() => window.location.reload(), 3800);
                    })
                    .catch(err => {
                        notification.error(err.message);
                    })
                    .finally(() => {
                        currBtn.firstElementChild.remove();
                        currBtn.firstElementChild.classList.remove("hidden")
                        currBtn.removeAttribute("disabled");
                    });
            }
        });
    });
    const btnStartSession = document.querySelectorAll("button.btn-start-session");
    btnStartSession.forEach(btn => {
        btn.addEventListener("click", function () {
            /** @type {HTMLButtonElement} */
            const currBtn = this;
            /** @type {HTMLButtonElement} */
            const nextBtn = currBtn.nextElementSibling;
            const sessionId = currBtn.dataset.sessionId;
            nextBtn.disabled = true;
            currBtn.disabled = true;
            currBtn.firstElementChild.classList.add("hidden");
            currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
            fetch(`/api/meeting/${sessionId}/start-session`, {
                method: "PATCH",
                headers: {
                    "x-csrf-token": csrfToken,
                },
            })
                .then(async resp => {
                    const text = await resp.text();
                    const response = text ? JSON.parse(text) : {};
                    if (!resp.ok) {
                        const error = new Error(response.error || "Terjadi kesalahan pada server.");
                        error.status = resp.status;
                        throw error;
                    }
                    return response;
                })
                .then(() => {
                    notification.success("Sesi telah dimulai. Tunggu halaman selesai memuat ulang!", clockCheck)
                    setTimeout(() => window.location.reload(), 3800);
                })
                .catch(err => {
                    notification.error(err.message);
                })
                .finally(() => {
                    currBtn.firstElementChild.remove();
                    currBtn.firstElementChild.classList.remove("hidden");
                    currBtn.removeAttribute("disabled");
                    nextBtn.removeAttribute("disabled");
                });
        });
    });
    const btnDeleteSession = document.querySelectorAll(".btn-delete-session[data-pop-up-type]");
    btnDeleteSession.forEach(btn => {
        btn.addEventListener("click", async function () {
            /** @type {HTMLButtonElement} */
            const currBtn = this;
            /** @type {HTMLButtonElement} */
            const previousBtn = currBtn.previousElementSibling;
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
                const sessionId = currBtn.dataset.sessionId;
                previousBtn.disabled = true;
                currBtn.disabled = true;
                currBtn.firstElementChild.classList.add("hidden");
                currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
                fetch(`/api/meeting/${sessionId}`, {
                    method: "DELETE",
                    headers: {
                        "x-csrf-token": csrfToken,
                    },
                })
                    .then(async resp => {
                        const text = await resp.text();
                        const response = text ? JSON.parse(text) : {};
                        if (!resp.ok) {
                            const error = new Error(response.error || "Terjadi kesalahan pada server.");
                            error.status = resp.status;
                            throw error;
                        }
                        return response;
                    })
                    .then(() => {
                        notification.success("Sesi berhasil dihapus. Tunggu halaman selesai memuat ulang!", trash);
                        setTimeout(() => window.location.reload(), 3800);
                    })
                    .catch(err => {
                        notification.error(err.message);
                    })
                    .finally(() => {
                        currBtn.firstElementChild.remove();
                        currBtn.firstElementChild.classList.remove("hidden")
                        currBtn.removeAttribute("disabled");
                        previousBtn.removeAttribute("disabled");
                    });
            }
        });
    });
});