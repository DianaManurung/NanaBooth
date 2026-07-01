from flask import Flask, render_template, request, jsonify, send_from_directory, send_file, abort, url_for
import base64
import os
import sys
import glob
import shutil
import qrcode
from io import BytesIO
from datetime import datetime


def setup_base_dir():
    """
    Saat dijalankan biasa (python app.py) -> pakai folder project seperti biasa.
    Saat dibundle PyInstaller (.exe) -> templates/static ada di dalam bundle
    sementara (sys._MEIPASS) yang read-only & terhapus tiap keluar aplikasi.
    Maka sekali saja, salin templates & static ke sebelah file .exe supaya
    folder uploads (hasil foto) tersimpan permanen, tidak hilang tiap dibuka.
    """

    if getattr(sys, "frozen", False):

        bundle_dir = sys._MEIPASS
        exe_dir = os.path.dirname(sys.executable)

        for folder in ("templates", "static"):
            src = os.path.join(bundle_dir, folder)
            dst = os.path.join(exe_dir, folder)
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.copytree(src, dst)

        return exe_dir

    return os.path.abspath(".")


BASE_DIR = setup_base_dir()

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/save-photo", methods=["POST"])
def save_photo():

    data = request.json["image"]

    header, encoded = data.split(",", 1)

    image = base64.b64decode(encoded)

    filename = "strip_" + datetime.now().strftime("%Y%m%d_%H%M%S") + ".png"

    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(image)

    return jsonify({
        "success": True,
        "filename": filename
    })


@app.route("/gallery")
def gallery():

    pattern = os.path.join(UPLOAD_DIR, "*.png")
    files = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=True)

    photos = []
    for f in files:
        name = os.path.basename(f)
        ts = os.path.getmtime(f)
        photos.append({
            "filename": name,
            "date": datetime.fromtimestamp(ts).strftime("%d %b %Y"),
            "time": datetime.fromtimestamp(ts).strftime("%H:%M")
        })

    return render_template("gallery.html", photos=photos)


@app.route("/api/photos")
def api_photos():

    pattern = os.path.join(UPLOAD_DIR, "*.png")
    files = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=True)

    photos = []
    for f in files:
        name = os.path.basename(f)
        ts = os.path.getmtime(f)
        photos.append({
            "filename": name,
            "date": datetime.fromtimestamp(ts).strftime("%d %b %Y"),
            "time": datetime.fromtimestamp(ts).strftime("%H:%M")
        })

    return jsonify({"photos": photos})


@app.route("/download/<filename>")
def download_photo(filename):

    safe_name = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, safe_name)

    if not os.path.exists(path):
        abort(404)

    return send_from_directory(UPLOAD_DIR, safe_name, as_attachment=True)


@app.route("/qrcode/<filename>")
def generate_qrcode(filename):

    safe_name = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, safe_name)

    if not os.path.exists(path):
        abort(404)

    # arahkan QR ke URL absolut file (bisa di-scan & langsung download dari HP)
    download_url = request.host_url.rstrip("/") + url_for("download_photo", filename=safe_name)

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2
    )
    qr.add_data(download_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1F2937", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return send_file(buffer, mimetype="image/png")


@app.route("/delete-photo/<filename>", methods=["POST"])
def delete_photo(filename):

    safe_name = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, safe_name)

    if not os.path.exists(path):
        return jsonify({"success": False, "error": "File not found"}), 404

    os.remove(path)

    return jsonify({"success": True, "filename": safe_name})


if __name__ == "__main__":
    app.run(debug=True)