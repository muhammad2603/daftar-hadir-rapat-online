/**
 * @typedef {Object} DragAndDropElements
 * @property {HTMLInputElement} inputFile Element input dengan tipe file
 * @property {HTMLElement} dropZoneEl Element zona drop file
 * @property {HTMLButtonElement | null} btnDeleteFile Element tombol untuk menghapus file dari input dan preview
 */

/**
 * @typedef {Object} DragAndDropEvents
 * Events handler
 * @property {function(): void} onDragOver Event drag over pada element drop zone
 * @property {function(): void} onDragEnter Event drag enter pada element drop zone
 * @property {function(): void} onDragLeave Event drag leave pada element drop zone
 * @property {(event: DragEvent) => void} onDrop Event drop pada element drop zone
 * @property {(event: Event) => void} onFileChange Event drop pada element input file
 * @property {function(): void} onFileDelete Event click pada element tombol delete file
 */

/**
 * Drag & Drop File
 * 
 * @param {DragAndDropElements} elements
 * @param {DragAndDropEvents} events
 */
export default function DragAndDrop(
    { inputFile, dropZoneEl, btnDeleteFile },
    { onDragOver, onDragEnter, onDragLeave, onDrop, onFileChange, onFileDelete }
) {
    dropZoneEl.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (onDragOver) onDragOver();
    });
    dropZoneEl.addEventListener("dragenter", onDragEnter);
    dropZoneEl.addEventListener("dragleave", onDragLeave);
    dropZoneEl.addEventListener("drop", (event) => {
        event.preventDefault();
        if (onDrop) onDrop(event);
    });
    inputFile.addEventListener("change", (event) => onFileChange(event));
    if (btnDeleteFile !== null) {
        btnDeleteFile.addEventListener("click", onFileDelete);
    }
}