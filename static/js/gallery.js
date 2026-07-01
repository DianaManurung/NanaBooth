const galleryGrid = document.getElementById("galleryGrid");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxDownload = document.getElementById("lightboxDownload");
const lightboxPrint = document.getElementById("lightboxPrint");

let activeFilename = null;

if (galleryGrid) {

    galleryGrid.addEventListener("click", (e) => {

        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const card = e.target.closest(".gallery-card");
        if (!card) return;

        const filename = card.dataset.filename;
        const action = btn.dataset.action;

        if (action === "preview") {
            openLightbox(filename);
        } else if (action === "download") {
            downloadPhoto(filename);
        } else if (action === "print") {
            printPhoto(filename);
        } else if (action === "delete") {
            deletePhoto(filename, card);
        }

    });

}

// ===== Lightbox =====
function openLightbox(filename) {

    activeFilename = filename;
    lightboxImg.src = `/static/uploads/${filename}`;
    lightbox.classList.add("active");

}

function closeLightbox() {
    lightbox.classList.remove("active");
    activeFilename = null;
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

if (lightboxDownload) {
    lightboxDownload.addEventListener("click", () => {
        if (activeFilename) downloadPhoto(activeFilename);
    });
}

if (lightboxPrint) {
    lightboxPrint.addEventListener("click", () => {
        if (activeFilename) printPhoto(activeFilename);
    });
}

// ===== Download (force-download via Flask route) =====
function downloadPhoto(filename) {

    const link = document.createElement("a");
    link.href = `/download/${filename}`;
    link.download = filename;
    link.click();

}

// ===== Print single strip via hidden iframe =====
function printPhoto(filename) {

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1500);
    };

    iframe.srcdoc = `
        <html>
            <head><title>Print NanaBooth Strip</title></head>
            <body style="margin:0;display:flex;align-items:center;justify-content:center;">
                <img src="/static/uploads/${filename}" style="max-width:100%;">
            </body>
        </html>
    `;

}

// ===== Delete =====
function deletePhoto(filename, cardEl) {

    if (!confirm("Hapus photostrip ini? Tindakan ini tidak bisa dibatalkan.")) {
        return;
    }

    fetch(`/delete-photo/${filename}`, { method: "POST" })
        .then(res => res.json())
        .then(data => {

            if (data.success) {

                cardEl.classList.add("removing");

                setTimeout(() => {
                    cardEl.remove();

                    if (galleryGrid.children.length === 0) {
                        location.reload();
                    }

                }, 350);

            } else {
                alert("Gagal menghapus foto.");
            }

        })
        .catch(err => {
            console.error(err);
            alert("Terjadi kesalahan saat menghapus foto.");
        });

}