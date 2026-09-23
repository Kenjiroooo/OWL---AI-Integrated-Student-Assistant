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
import tempfile

PORT = 5050
PIPER_BIN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "piper", "piper")
VOICE_MODEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "piper", "voices", "en_US-amy-medium.onnx")


class TTSHandler(http.server.BaseHTTPRequestHandler):
    """Handles /tts and /health requests."""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/health":
            self._send_json(200, {"status": "ok", "engine": "piper", "voice": "en_US-amy-medium"})
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
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
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
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        """Compact logging."""
        sys.stderr.write(f"[PiperTTS] {args[0]} {args[1]}\n")


def main():
    # Verify piper binary exists
    if not os.path.isfile(PIPER_BIN):
        print(f"[ERROR] Piper binary not found at: {PIPER_BIN}")
        print("Run setup-piper-tts.sh first to install Piper.")
        sys.exit(1)

    if not os.path.isfile(VOICE_MODEL):
        print(f"[ERROR] Voice model not found at: {VOICE_MODEL}")
        print("Run setup-piper-tts.sh first to download the voice model.")
        sys.exit(1)

    server = http.server.HTTPServer(("0.0.0.0", PORT), TTSHandler)
    print(f"[PiperTTS] Server running on http://0.0.0.0:{PORT}")
    print(f"[PiperTTS] Piper binary: {PIPER_BIN}")
    print(f"[PiperTTS] Voice model: {VOICE_MODEL}")
    print(f"[PiperTTS] Endpoints: GET /tts?text=... | GET /health")

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
