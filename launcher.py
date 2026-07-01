"""
launcher.py
Menjalankan NanaBooth sebagai aplikasi desktop (bukan di browser).

Cara pakai (mode development):
    python launcher.py

Cara build jadi NanaBooth.exe: lihat instruksi PyInstaller yang menyertai file ini.
"""

import threading
import socket
import sys

# Fix DPI scaling Windows — supaya ukuran window & teks tidak ikut scale
# melebihi yang seharusnya di layar HiDPI/125%/150%
if sys.platform == "win32":
    try:
        import ctypes
        # Per-monitor DPI aware v2 (Windows 10 1703+)
        ctypes.windll.shcore.SetProcessDpiAwareness(2)
    except Exception:
        try:
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:
            pass
import webview

from app import app  # import instance Flask dari app.py


def get_free_port():
    """Cari port lokal yang kosong, supaya tidak bentrok kalau 5000 sedang dipakai."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def run_flask(port):
    app.run(
        host="127.0.0.1",
        port=port,
        debug=False,
        use_reloader=False,
        threaded=True
    )


def main():

    port = get_free_port()

    # Flask jalan di thread terpisah di background,
    # sementara pywebview memegang main thread untuk jendela GUI.
    flask_thread = threading.Thread(target=run_flask, args=(port,), daemon=True)
    flask_thread.start()

    window = webview.create_window(
        title="📸 NanaBooth",
        url=f"http://127.0.0.1:{port}",
        width=1280,
        height=800,
        min_size=(900, 600),
        resizable=True,
        text_select=False,
        zoomable=True
    )

    # gui="edgechromium" dipakai otomatis di Windows kalau tersedia (WebView2)
    webview.start()





if __name__ == "__main__":
    main()