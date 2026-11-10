#!/usr/bin/env python3
"""
piper-tts-server.py — Lightweight HTTP TTS server for OWL Kiosk
Runs Piper TTS locally on Orange Pi 3B (ARM64 Debian Bookworm).

Usage:
    python3 piper-tts-server.py

Endpoints:
    GET  /tts?text=Hello+world    → Returns WAV audio
    GET  /health                  → Returns {"status": "ok"}

Requires:
    - piper binary at ./piper/piper
    - voice model at ./piper/voices/en_US-amy-medium.onnx
"""

import http.server
import subprocess
import urllib.parse
import json
import os
import io
import sys
import signal
import shutil
import tempfile

PORT = 5050
PIPER_BIN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "piper", "piper")
VOICE_MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "piper", "voices", "en_US-amy-medium.onnx")


def trigger_rpi_keyboard(visible: bool) -> dict:
    """
    Trigger the built-in Raspberry Pi 5 OS virtual keyboard.
    IMPORTANT FOR FULLSCREEN (F11 / --kiosk):
      On Raspberry Pi OS Bookworm (Wayland labwc / wayfire), `squeekboard` uses
      the Wayland `TOP` layer, which is stacked BELOW `FULLSCREEN` windows.
      `wvkbd-mobintl` uses the Wayland `OVERLAY` layer, which renders ABOVE
      `FULLSCREEN` windows. Therefore, we trigger `wvkbd-mobintl` first AND
      also signal `squeekboard` / `onboard` / `matchbox-keyboard` without
      returning early so the keyboard is visible in both windowed and fullscreen modes.
    """
    env = os.environ.copy()
    uid = os.getuid() if hasattr(os, "getuid") else 1000
    env.setdefault("XDG_RUNTIME_DIR", f"/run/user/{uid}")
    env.setdefault("DBUS_SESSION_BUS_ADDRESS", f"unix:path=/run/user/{uid}/bus")
    env.setdefault("WAYLAND_DISPLAY", "wayland-0")
    env.setdefault("DISPLAY", ":0")

    bool_str = "true" if visible else "false"
    tried = []
    activated = []

    # 1. wvkbd-mobintl (Wayland OVERLAY layer — renders ABOVE Fullscreen F11 / --kiosk!)
    wvkbd_bin = shutil.which("wvkbd-mobintl") or shutil.which("wvkbd")
    if wvkbd_bin:
        sig = "-SIGUSR2" if visible else "-SIGUSR1"
        res = subprocess.run(["pkill", sig, "-f", "wvkbd"], env=env, capture_output=True, timeout=2)
        if res.returncode != 0 and visible:
            # Start wvkbd-mobintl in background if not yet running
            subprocess.Popen([wvkbd_bin, "-L", "280"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            activated.append("wvkbd-launched")
        elif res.returncode == 0:
            activated.append("wvkbd")
        tried.append(f"wvkbd:{res.returncode}")

    # 2. Squeekboard via busctl / gdbus (Raspberry Pi OS Bookworm default TOP layer)
    if shutil.which("busctl"):
        res = subprocess.run(
            ["busctl", "call", "--user", "sm.puri.OSK0", "/sm/puri/OSK0", "sm.puri.OSK0", "SetVisible", "b", bool_str],
            env=env,
            capture_output=True,
            timeout=2,
        )
        tried.append(f"squeekboard(busctl):{res.returncode}")
        if res.returncode == 0:
            activated.append("squeekboard")
    elif shutil.which("gdbus"):
        res = subprocess.run(
            [
                "gdbus", "call", "--session",
                "--dest", "sm.puri.OSK0",
                "--object-path", "/sm/puri/OSK0",
                "--method", "sm.puri.OSK0.SetVisible",
                bool_str,
            ],
            env=env,
            capture_output=True,
            timeout=2,
        )
        tried.append(f"squeekboard(gdbus):{res.returncode}")
        if res.returncode == 0:
            activated.append("squeekboard")

    # 3. Onboard via D-Bus (X11 / Wayland)
    if shutil.which("dbus-send"):
        method = "org.onboard.Onboard.Keyboard.Show" if visible else "org.onboard.Onboard.Keyboard.Hide"
        res = subprocess.run(
            [
                "dbus-send", "--type=method_call",
                "--dest=org.onboard.Onboard",
                "/org/onboard/Onboard/Keyboard",
                method,
            ],
            env=env,
            capture_output=True,
            timeout=2,
        )
        tried.append(f"onboard:{res.returncode}")
        if res.returncode == 0:
            activated.append("onboard")

    # 4. matchbox-keyboard fallback (only if nothing else activated)
    if not activated and shutil.which("matchbox-keyboard"):
        if visible:
            subprocess.Popen(["matchbox-keyboard"], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            subprocess.run(["pkill", "-f", "matchbox-keyboard"], env=env, capture_output=True, timeout=2)
        activated.append("matchbox-keyboard")

    return {"ok": len(activated) > 0, "activated": activated, "visible": visible, "tried": tried}


class TTSHandler(http.server.BaseHTTPRequestHandler):
    """Handles /tts and /health requests."""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/health":
            self._send_json(200, {"status": "ok", "engine": "piper", "voice": "en_US-amy-medium"})
            return

        if parsed.path == "/keyboard":
            params = urllib.parse.parse_qs(parsed.query)
            action = params.get("action", ["show"])[0].strip().lower()
            visible = action != "hide"
            try:
                result = trigger_rpi_keyboard(visible)
                self._send_json(200, result)
            except Exception as e:
                self._send_json(500, {"ok": False, "error": str(e)})
            return

        if parsed.path == "/tts":
            params = urllib.parse.parse_qs(parsed.query)
            text = params.get("text", [""])[0].strip()

            if not text:
                self._send_json(400, {"error": "Missing 'text' query parameter"})
                return

            if len(text) > 2000:
                self._send_json(400, {"error": "Text too long (max 2000 chars)"})
                return

            try:
                wav_data = self._synthesize(text)
                self.send_response(200)
                self.send_header("Content-Type", "audio/wav")
                self.send_header("Content-Length", str(len(wav_data)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                self.wfile.write(wav_data)
            except FileNotFoundError:
                self._send_json(500, {"error": "Piper binary not found", "path": PIPER_BIN})
            except subprocess.TimeoutExpired:
                self._send_json(504, {"error": "TTS synthesis timed out"})
            except Exception as e:
                self._send_json(500, {"error": f"TTS synthesis failed: {str(e)}"})
            return

        self._send_json(404, {"error": "Not found. Use /tts?text=... or /health"})

    def do_OPTIONS(self):
        """Handle CORS preflight (including Private Network Access from HTTPS origins)."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()

    def _synthesize(self, text: str) -> bytes:
        """Run Piper to synthesize text into WAV audio bytes."""
        # Use a temp file for output to avoid pipe buffering issues on ARM
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            proc = subprocess.run(
                [
                    PIPER_BIN,
                    "--model", VOICE_MODEL,
                    "--output_file", tmp_path,
                ],
                input=text.encode("utf-8"),
                capture_output=True,
                timeout=15,
            )

            if proc.returncode != 0:
                stderr = proc.stderr.decode("utf-8", errors="replace")
                raise RuntimeError(f"Piper exited with code {proc.returncode}: {stderr}")

            with open(tmp_path, "rb") as f:
                return f.read()
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    def _send_json(self, status: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        """Compact logging."""
        sys.stderr.write(f"[PiperTTS] {args[0]} {args[1]}\n")


def main():
    # Warn if piper binary or voice model is not yet installed (server still runs for /keyboard)
    if not os.path.isfile(PIPER_BIN):
        print(f"[WARN] Piper binary not found at: {PIPER_BIN} (TTS disabled, /keyboard active)")

    if not os.path.isfile(VOICE_MODEL):
        print(f"[WARN] Voice model not found at: {VOICE_MODEL} (TTS disabled, /keyboard active)")

    server = http.server.HTTPServer(("0.0.0.0", PORT), TTSHandler)
    print(f"[PiperTTS] Server running on http://0.0.0.0:{PORT}")
    print(f"[PiperTTS] Piper binary: {PIPER_BIN}")
    print(f"[PiperTTS] Voice model: {VOICE_MODEL}")
    print(f"[PiperTTS] Endpoints: GET /tts?text=... | GET /keyboard?action=show|hide | GET /health")

    # Graceful shutdown on SIGTERM/SIGINT
    def shutdown(sig, frame):
        print("\n[PiperTTS] Shutting down...")
        server.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[PiperTTS] Stopped.")


if __name__ == "__main__":
    main()
