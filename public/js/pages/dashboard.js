import { PopUp } from '../cores/PopUp.js';

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

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
                // __COMMENT__ Loading state yang sedang menunggu response
                currBtn.disabled = true;
                currBtn.querySelector("svg").classList.add("hidden");
                currBtn.insertAdjacentHTML("afterbegin", loadingSvg);
                console.log("Sedang mengakhiri sesi...");
                // __COMMENT__ State saat request telah mendapatkan response dari server
                /**
                 * Server akan memberikan response OK dan list sesi yang telah diperbarui
                */
                setTimeout(() => {
                    currBtn.firstElementChild.remove();
                    currBtn.querySelector("svg").classList.remove("hidden");
                    currBtn.removeAttribute("disabled");
                    console.log("Sesi telah berakhir.");
                }, 5000);
            }
        });
    });
});