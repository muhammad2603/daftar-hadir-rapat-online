import { PopUp } from '../cores/PopUp.js';
import { Notification } from "../cores/Notification.js";
import { IconsNotification } from '../utils/notification/IconsNotification.js';

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

const notification = Notification();
const { octagonX } = IconsNotification;

document.addEventListener("DOMContentLoaded", () => {
    const popUpBtn = document.querySelectorAll(".pop-up-btn[data-pop-up-type]");
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");
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
                const sessionId = currBtn.dataset.sessionId;
                currBtn.disabled = true;
                currBtn.querySelector("svg").classList.add("hidden");
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
});