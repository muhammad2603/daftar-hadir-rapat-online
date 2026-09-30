document.addEventListener("DOMContentLoaded", () => {
    const tabButton = document.querySelectorAll("button[data-tab-id]");
    const tabElementList = document.querySelectorAll("main > div.tab-id");
    tabButton.forEach((btn) => {
        btn.addEventListener("click", function () {
            /** @type {HTMLButtonElement} */
            const currBtn = this;
            /** @type {string} Document ID referensi Tab yang akan dibuka */
            const tabId = currBtn.dataset.tabId;
            /** @type {string} Jenis property display CSS yang digunakan parent Tab */
            const tabDisplayType = currBtn.dataset.displayType;
            /** @type {HTMLDivElement} Elemen Tab yang akan dibuka */
            const tabElement = document.getElementById(tabId);
            tabElementList.forEach(tab => {
                tab.classList.remove("block");
                tab.classList.remove("flex");
                tab.classList.remove("grid");
                if (!tab.classList.contains("hidden")) {
                    tab.classList.add("hidden");
                };
            });
            tabElement.classList.remove("hidden");
            tabElement.classList.add(tabDisplayType);
            tabButton.forEach(btn => {
                btn.classList.remove("bg-blue-900", "text-white", "shadow-sm", "pointer-events-none");
                currBtn.classList.add("text-slate-600", "hover:text-slate-800", "hover:bg-gray-100");
            });
            currBtn.classList.add("bg-blue-900", "text-white", "shadow-sm", "pointer-events-none");
            currBtn.classList.remove("text-slate-600", "hover:text-slate-800", "hover:bg-gray-100");
        });
    });
});