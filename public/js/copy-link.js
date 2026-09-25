document.addEventListener("DOMContentLoaded", () => {
    const copyLinkBtn = document.getElementById("copyLink");
    copyLinkBtn.addEventListener("click", async function () {
        try {
            this.classList.add("cursor-not-allowed");
            this.disabled = true;
            const link = this.dataset.link;
            await navigator.clipboard.writeText(link);
            this.textContent = 'Tautan berhasil disalin!';
        } catch (error) {
            this.textContent = "Tautan gagal disalin!";
        }
        setTimeout(() => {
            this.textContent = 'Salin Tautan';
            this.classList.remove("cursor-not-allowed");
            this.disabled = false;
        }, 1000);
    });
});