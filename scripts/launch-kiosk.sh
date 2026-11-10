#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# launch-kiosk.sh — Launch OWL Kiosk on Raspberry Pi 5 with Built-in OS Keyboard
#
# WHY THIS FIXES THE FULLSCREEN KEYBOARD ISSUE ON RASPBERRY PI OS:
#   On Raspberry Pi OS (Wayland labwc / wayfire), pressing F11 or using `--kiosk`
#   puts Chromium on the Wayland `FULLSCREEN` layer, which sits ABOVE the `TOP`
#   layer used by Raspberry Pi's built-in `squeekboard` virtual keyboard — causing
#   the keyboard to open behind the browser window.
#
#   This script fixes that in two ways:
#     1. Configures `labwc` borderless maximized window rules (`serverDecoration="no"`)
#        and launches Chromium in `--app` mode with `--start-maximized` + Wayland IME
#        so it fills 100% of the screen without covering `squeekboard`.
#     2. Starts `wvkbd-mobintl` (which uses the Wayland `OVERLAY` layer that sits
#        ABOVE even F11 / `--kiosk` fullscreen windows) and the port 5050 bridge.
#
# Usage on Raspberry Pi:
#   chmod +x scripts/launch-kiosk.sh
#   ./scripts/launch-kiosk.sh [URL]
# ──────────────────────────────────────────────────────────────────────────────

KIOSK_URL="${1:-https://app.owl-kiosk.workers.dev/}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Ensure local keyboard/TTS bridge server is running on port 5050
if ! pgrep -f "piper-tts-server.py" >/dev/null 2>&1; then
  nohup python3 "${SCRIPT_DIR}/piper-tts-server.py" >/dev/null 2>&1 &
fi

# 2. Ensure wvkbd-mobintl (Wayland OVERLAY layer keyboard) is ready in background
if command -v wvkbd-mobintl >/dev/null 2>&1 && ! pgrep -f "wvkbd-mobintl" >/dev/null 2>&1; then
  nohup wvkbd-mobintl --hidden -L 280 >/dev/null 2>&1 &
fi

# 3. Configure labwc so Chromium --app runs borderless (100% fullscreen appearance
#    while staying on the normal Wayland layer so Raspberry Pi's built-in keyboard
#    always renders on top of it)
LABWC_DIR="${HOME}/.config/labwc"
LABWC_RC="${LABWC_DIR}/rc.xml"
mkdir -p "${LABWC_DIR}"
if [ ! -f "${LABWC_RC}" ]; then
  cat > "${LABWC_RC}" << 'EOF'
<?xml version="1.0"?>
<labwc_config>
  <windowRules>
    <windowRule identifier="*chromium*" serverDecoration="no" maximized="yes" />
    <windowRule identifier="*chrome*" serverDecoration="no" maximized="yes" />
  </windowRules>
</labwc_config>
EOF
  labwc -r 2>/dev/null || true
fi

# 4. Find Chromium binary on Raspberry Pi OS
CHROMIUM_BIN="chromium-browser"
if ! command -v "${CHROMIUM_BIN}" >/dev/null 2>&1; then
  CHROMIUM_BIN="chromium"
fi

# 5. Launch Chromium in Borderless App Mode with Wayland IME enabled
exec "${CHROMIUM_BIN}" \
  --app="${KIOSK_URL}" \
  --start-maximized \
  --ozone-platform=wayland \
  --enable-features=UseOzonePlatform,TouchpadOverscrollHistoryNavigation \
  --enable-wayland-ime \
  --touch-events=enabled \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --noerrdialogs \
  --disable-infobars \
  --check-for-update-interval=31536000

