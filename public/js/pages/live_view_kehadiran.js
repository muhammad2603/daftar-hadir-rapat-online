import { PopUp } from "../cores/PopUp.js";
import SignaturePad from '/js/libs/signature_pad/dist/signature_pad.min.js';

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", () => {
    const popUpQr = new PopUp(document.getElementById("qrCode"));
    const btnShowQr = document.getElementById("btnShowQrCode");
    const btnCloseQrCode = document.getElementById("btnCloseQrCode");
    btnShowQr.addEventListener("click", () => popUpQr.showPopUp());
    btnCloseQrCode.addEventListener("click", () => popUpQr.closePopUp());
    const btnEndSession = document.getElementById("btnEndSession");
    // __COMMENT__ Aksi untuk mengakhiri sesi tidak butuh Pop Up, aksi akan langsung dilakukan.
    btnEndSession.addEventListener("click", function () {
        // __COMMENT__ Animasi loading state
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        const defaultTextBtn = currBtn.textContent;
        currBtn.innerHTML = loadingSvg;
        currBtn.disabled = true;
        console.log("Sedang mengakhiri sesi...");
        // __COMMENT__ State ketika request telah mendapat response dari server
        /**
         * Setelah mendapat response OK dari server, user akan diarahkan ke uri /dashboard/sesi-rapat/riwayat.
         * User tidak dapat kembali ke-halaman ini setelah diarahkan ke uri tersebut karena sesi telah berakhir.
         */
        setTimeout(() => {
            currBtn.innerText = defaultTextBtn;
            currBtn.removeAttribute("disabled");
            console.log("Sesi telah berakhir.")
            window.location.replace('/dashboard/sesi-rapat/riwayat');
        }, 5000);
    });
    const popUpTtdEl = document.getElementById("popUpTtdImage");
    const popUpTtdImage = new PopUp(popUpTtdEl);
    /** @type {NodeListOf<HTMLImageElement>} */
    const ttdImages = document.querySelectorAll("table td img.ttd-image");
    const btnCloseTtdImage = document.getElementById('btnCloseTtdImage');
    ttdImages.forEach((img) => {
        img.addEventListener("click", function () {
            const tbRow = this.closest("tr");
            const rowParticipantName = tbRow.querySelector("p.participant-name");
            const rowTimePresence = tbRow.querySelector("td.time-presence");
            const popUpImgEl = popUpTtdEl.querySelector("img");
            const participantName = popUpTtdEl.querySelector("span#participantName");
            const timePresence = popUpTtdEl.querySelector("span#timePresence");
            popUpImgEl.src = this.src;
            participantName.textContent = rowParticipantName.textContent;
            timePresence.textContent = rowTimePresence.textContent;
            popUpTtdImage.showPopUp();
        });
    });
    btnCloseTtdImage.addEventListener("click", () => popUpTtdImage.closePopUp());
    const canvas = document.querySelector("canvas");
    const ttdText = document.getElementById("ttdText");
    const resetTtdBtn = document.getElementById("resetTtd");

    const disableSignaturePadAtEnd = () => {
        signaturePad.off();
        resetTtdBtn.classList.add("flex");
        resetTtdBtn.classList.remove("hidden");
        canvas.classList.remove("cursor-pen-tool");
    };

    const enableSignaturePad = () => {
        signaturePad.clear();
        canvas.classList.add("cursor-pen-tool");
        ttdText.classList.remove("hidden");
        signaturePad.on();
        resetTtdBtn.classList.remove("flex");
        resetTtdBtn.classList.add("hidden");
    };

    const signaturePad = new SignaturePad(canvas, {
        minWidth: 0.8
    });
    let lastWidth = 0;

    const resizeCanvas = () => {
        if (!canvas.offsetWidth) return;
        if (canvas.offsetWidth === lastWidth) return;
        lastWidth = canvas.offsetWidth;
        const data = signaturePad.toData();
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        signaturePad.clear();
        if (data.length) {
            signaturePad.fromData(data);
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    signaturePad.addEventListener("beginStroke", () => {
        ttdText.classList.add("hidden");
    });

    signaturePad.addEventListener("endStroke", () => {
        disableSignaturePadAtEnd();
    });

    resetTtdBtn.addEventListener("click", () => {
        enableSignaturePad();
    });

    const configurationsPanel = document.getElementById("configurationsPanel");
    const btnOpenConfig = document.getElementById("openConfig");
    const btnSavedConfig = document.getElementById("saveAsConfig");
    const inputsConfig = configurationsPanel.querySelectorAll("input:not([type='checkbox'])");
    const btnCloseConfigurationsPanel = document.getElementById("closeConfigurationsPanel");
    const savedConfigPanel = document.getElementById("savedConfigPanel");

    btnOpenConfig.addEventListener("click", function () {
        const isSavedConfigPanelOpened = !savedConfigPanel.classList.contains("hidden");
        if (isSavedConfigPanelOpened) {
            btnOpenSavedConfig.classList.remove("pointer-events-none");
            savedConfigPanel.classList.add("hidden");
        }
        this.classList.add("pointer-events-none");
        configurationsPanel.classList.remove("hidden");
    });

    btnCloseConfigurationsPanel.addEventListener("click", function () {
        btnOpenConfig.classList.remove("pointer-events-none");
        configurationsPanel.classList.add("hidden");
    });

    const setPersonChargeFromConfig = function () {
        /** @type {HTMLInputElement} */
        const inputEl = this;
        inputEl.classList.remove("invalid");
        const getInputId = inputEl.getAttribute("id");
        const getReferenceEl = document.querySelector(`[data-input-id='${getInputId}']`);
        let inputValue = inputEl.value.trim();
        if (inputEl.type === 'date') {
            const parseDatePublish = new Date(inputValue);
            const dateFormatted = Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(parseDatePublish);
            inputValue = dateFormatted;
        }
        getReferenceEl.textContent = inputValue;
    }

    /** @type {HTMLInputElement[]} Input penanggung jawab */
    const inputsConfigEl = [];

    inputsConfig.forEach(input => {
        if (input.classList.contains("input-config")) {
            inputsConfigEl.push(input);
        }
        input.addEventListener("change", setPersonChargeFromConfig);
    });

    const btnOpenSavedConfig = document.getElementById("openSavedConfig");
    const btnCloseSavedConfigPanel = document.getElementById("closeSavedConfigPanel");

    btnOpenSavedConfig.addEventListener("click", function () {
        const isInputsConfigPanelOpened = !configurationsPanel.classList.contains("hidden");
        if (isInputsConfigPanelOpened) {
            btnOpenConfig.classList.remove("pointer-events-none");
            configurationsPanel.classList.add("hidden");
        }
        this.classList.add("pointer-events-none");
        savedConfigPanel.classList.remove("hidden");
    });

    btnCloseSavedConfigPanel.addEventListener("click", () => {
        btnOpenSavedConfig.classList.remove("pointer-events-none");
        savedConfigPanel.classList.add("hidden");
    });

    const keySavedConfigOnLocalStorage = "daftar_hadir:config:penanggung_jawab";
    const getConfig = localStorage.getItem(keySavedConfigOnLocalStorage);
    const MAX_CONFIG_SAVED = 8;

    /**
     * @type {Array<{
     *  personChargePosition: string,
     *  personChargeName: string,
     *  personChargeRank: string,
     *  personChargeIdNumber: string,
     * }>}
     * Konfigurasi dari Local Storage Browser
     */
    const configArray = JSON.parse(getConfig ?? '[]');

    const sameAsMeetingDateCheckbox = document.getElementById("sameAsMeetingDate");
    /** @type {HTMLInputElement} */
    const inputDatePublish = document.getElementById("datePublish");
    /** @type {HTMLSpanElement} */
    const datePublishSpan = document.querySelector("span[data-input-id='datePublish']");
    const getMeetingDate = datePublishSpan.dataset.meetingDate;

    sameAsMeetingDateCheckbox.addEventListener("change", function () {
        const isChecked = this.checked;
        if (isChecked) {
            inputDatePublish.value = '';
            inputDatePublish.disabled = true;
            datePublishSpan.textContent = getMeetingDate;
        } else {
            inputDatePublish.removeAttribute("disabled");
        }
    });

    /** @type {HTMLSelectElement} */
    const configSavedSelectEl = document.getElementById("configSelect");
    const configOptionFragmet = document.createDocumentFragment();

    if (configArray.length > 0) {
        configArray.forEach(config => configOptionFragmet.appendChild(new Option(`${config.personChargeName} - ${config.personChargeIdNumber}`, config.personChargeIdNumber)));
        configSavedSelectEl.appendChild(configOptionFragmet);
    } else {
        btnOpenSavedConfig.disabled = true;
    }

    // Terapkan konfigurasi yang terpilih dibagian "Yang Mengetahui"
    configSavedSelectEl.addEventListener("change", function () {
        const selectedIdNumber = this.value.trim();
        const findConfig = configArray.find(config => config.personChargeIdNumber === selectedIdNumber);
        if (findConfig) {
            Object.entries(findConfig).forEach(([inputId, val]) => {
                document.getElementById(inputId).value = val;
                document.querySelector(`[data-input-id='${inputId}']`).textContent = val;
            })
        }
    });

    btnSavedConfig.addEventListener("click", function () {
        const configLength = configArray.length;
        if (configLength >= MAX_CONFIG_SAVED) {
            return alert(`Tidak dapat menambahkan informasi penanggung jawab (Maks. ${MAX_CONFIG_SAVED})!`);
        }
        const createRow = {};
        for (let i = 0; i < inputsConfigEl.length; i++) {
            const inputEl = inputsConfigEl[i];
            const inputValue = inputEl.value.trim();
            // Cek apakah NIP telah tersimpan diconfig
            if (configLength > 0 && inputEl.id === "personChargeIdNumber") {
                const isPersonIdNumberExist = configArray.some(config => config.personChargeIdNumber === inputValue);
                if (isPersonIdNumberExist) {
                    const findPersonByIdNumber = configArray.find(config => config.personChargeIdNumber === inputValue);
                    return alert(`Tidak dapat menyimpan informasi penanggung jawab, NIP telah tersedia sebagai: ${findPersonByIdNumber.personChargeName}`);
                }
            }
            if (inputValue === '') {
                inputsConfigEl.forEach(input => {
                    if (input.value.trim() === '') {
                        input.classList.add("invalid");
                    }
                });
                alert("Mohon isi informasi penanggung jawab secara lengkap!");
                return;
            }
            const inputId = inputEl.id;
            createRow[inputId] = inputValue;
        }
        if (configArray.length === 1) {
            btnOpenSavedConfig.removeAttribute("disabled");
        }
        configArray.push(createRow);
        localStorage.setItem(keySavedConfigOnLocalStorage, JSON.stringify(configArray));
        configSavedSelectEl.appendChild(new Option(`${createRow.personChargeName} - ${createRow.personChargeIdNumber}`, createRow.personChargeIdNumber));
        alert("Informasi penanggung jawab berhasil disimpan!");
    });
});