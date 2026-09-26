document.addEventListener("DOMContentLoaded", () => {
    const riwayatWrapper = document.getElementById("riwayatWrapper");
    const dropdownDetailBtn = riwayatWrapper.querySelectorAll(".btn-dropdown-detail");
    const dropdownElements = riwayatWrapper.querySelectorAll(".dropdown-detail");
    dropdownDetailBtn.forEach((btn, btnIdx) => {
        btn.addEventListener("click", function () {
            /** @type {HTMLElement} currBtn */
            const currBtn = this;
            const dropdownTarget = currBtn.nextElementSibling;
            // Reset semua dropdown yang sedang terbuka (kecuali state saat ini)
            dropdownElements.forEach((element, elementIdx) => {
                if (elementIdx === btnIdx) return;
                element.classList.add("h-0");
            });
            // Reset semua tombol dropdown (kecuali tombol yang sedang diklik)
            dropdownDetailBtn.forEach((btn, idx) => {
                if (idx === btnIdx) return;
                btn.classList.remove("active");
            });
            if (dropdownTarget.classList.contains("h-0")) {
                currBtn.classList.add("active");
                dropdownTarget.classList.remove("h-0");
            } else {
                dropdownTarget.classList.add("h-0");
                currBtn.classList.remove("active");
            }
        });
    });
});