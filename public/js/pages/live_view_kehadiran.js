import { PopUp } from "../cores/PopUp.js";
import SignaturePad from '/js/libs/signature_pad/dist/signature_pad.min.js';

const loadingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon size-4 animate-spin">
<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
</svg>`;

document.addEventListener("DOMContentLoaded", async () => {
    const popUpQr = new PopUp(document.getElementById("qrCode"));
    const btnShowQr = document.getElementById("btnShowQrCode");
    const btnCloseQrCode = document.getElementById("btnCloseQrCode");
    /** @type {string} Token CSRF */
    const csrfToken = document.querySelector('meta[name=X-CSRF-TOKEN]').getAttribute("content");
    /** @type {string} Session ID */
    const sessionId = document.querySelector('meta[name=SESSION-ID]').getAttribute("content");
    btnShowQr.addEventListener("click", () => popUpQr.showPopUp());
    btnCloseQrCode.addEventListener("click", () => popUpQr.closePopUp());
    const btnEndSession = document.getElementById("btnEndSession");
    btnEndSession.addEventListener("click", function () {
        /** @type {HTMLButtonElement} */
        const currBtn = this;
        const sessionId = currBtn.dataset.sessionId;
        const defaultTextBtn = currBtn.textContent;
        currBtn.innerHTML = loadingSvg;
        currBtn.disabled = true;
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
            .then(() => window.location.reload())
            .catch(err => {
                console.error(err.message);
            })
            .finally(() => {
                currBtn.innerText = defaultTextBtn;
                currBtn.removeAttribute("disabled");
            });
    });
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

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas);

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

    const participantsWrapper = document.getElementById("participants");
    const participantsTableHead = participantsWrapper.querySelector("table thead");
    const participantsTableBody = participantsWrapper.querySelector("table tbody");
    const emptyAttendancesWrapper = document.getElementById("emptyAttendances");

    const renderedParticipantIds = new Set();
    const createParticipantRow = (row, idx) => {
        const cell = `<tr class="hover:bg-gray-50/50 transition-colors group">
        <td class="py-3 px-3 text-gray-400 text-sm print:hidden print:text-black/75">${idx}</td>
        <td class="py-3 px-3">
            <p class="participant-name font-medium text-gray-600 text-sm print:text-black/75">${row.nama_pegawai}</p>
        </td>
        <td class="py-3 px-3 text-gray-600 text-sm leading-snug max-w-40 print:text-black/75">${row.jabatan}</td>
        <td class="py-3 px-3 text-gray-600 text-sm print:text-black/75">${row.nama_opd}</td>
        <td class="py-3 px-3 text-gray-600 text-sm tracking-wider print:text-black/75">${row.nomor_hp}</td>
        <td class="py-3 px-3">
            <img src="/api/meeting/attendance/${row.id}/signature" alt="Tanda Tangan ${row.nama_pegawai}" class="ttd-image h-10 w-24 object-contain border border-gray-100 rounded bg-white cursor-pointer print:border-none" />
        </td>
        <td class="time-presence py-3 px-3 text-gray-500 text-sm print:hidden">${row.waktu_kehadiran}</td>
    </tr>`;
        participantsTableBody.insertAdjacentHTML("beforeend", cell);
    }

    const getParticipants = async () => {
        try {
            const resp = await fetch(`/api/meeting/${sessionId}/participants`);
            const participants = await resp.json();
            if (participants.totalParticipants > 0) {
                emptyAttendancesWrapper.classList.add("hidden");
                participantsTableHead.classList.remove("hidden");
                participants.listParticipants.forEach((row) => {
                    if (!renderedParticipantIds.has(row.id)) {
                        renderedParticipantIds.add(row.id);
                        const currentNumber = renderedParticipantIds.size;
                        createParticipantRow(row, currentNumber);
                    }
                });
            }
        } catch (error) {
            console.error("Gagal memuat data peserta:", error);
        }
    }

    getParticipants();
    setInterval(getParticipants, 3000);
});