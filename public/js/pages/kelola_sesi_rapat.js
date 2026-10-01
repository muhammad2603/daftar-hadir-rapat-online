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
                // __COMMENT__ Animasi loading state
                currBtn.disabled = true;
                currBtn.firstElementChild.classList.add("hidden");
                currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
                console.log("Sedang mengakhiri sesi...");
                // __COMMENT__ State saat server memberikan response
                /**
                 * Ketika server memberikan response OK, server harus mengirim list data yang baru.
                 */
                setTimeout(() => {
                    currBtn.firstElementChild.remove();
                    currBtn.firstElementChild.classList.remove("hidden")
                    currBtn.removeAttribute("disabled");
                    notification.success("Sesi telah berakhir.", octagonX);
                }, 5000);
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
            // __COMMENT__ Tombol setelah mulai sesi harus diberikan disabled agar tidak terjadi race condition disisi frontend UI
            nextBtn.disabled = true;
            // __COMMENT__ Animasi loading state
            currBtn.disabled = true;
            currBtn.firstElementChild.classList.add("hidden");
            currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
            // __COMMENT__ State ketika server telah memberikan response
            /**
             * Ketika server memberikan response OK, server juga harus memberikan list data yang baru.
             */
            setTimeout(() => {
                currBtn.firstElementChild.remove();
                currBtn.firstElementChild.classList.remove("hidden");
                currBtn.removeAttribute("disabled");
                nextBtn.removeAttribute("disabled");
                notification.success("Sesi telah dimulai!", clockCheck)
            }, 5000);
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
                // __COMMENT__ Tombol sebelum hapus sesi harus diberikan disabled agar tidak terjadi race condition disisi frontend UI
                previousBtn.disabled = true;
                // __COMMENT__ Animasi loading state
                currBtn.disabled = true;
                currBtn.firstElementChild.classList.add("hidden");
                currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
                console.log("Sedang menghapus sesi...");
                // __COMMENT__ State saat server memberikan response
                /**
                 * Ketika server memberikan response OK, server harus mengirim list data yang baru.
                 */
                setTimeout(() => {
                    currBtn.firstElementChild.remove();
                    currBtn.firstElementChild.classList.remove("hidden")
                    currBtn.removeAttribute("disabled");
                    previousBtn.removeAttribute("disabled");
                    notification.success(
                        "Sesi berhasil dihapus!",
                        trash
                    );
                }, 5000);
            }
        });
    });
});