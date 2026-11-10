#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# setup-rpi5-keyboard.sh — Enable & auto-start the Raspberry Pi 5 Virtual Keyboard
#
# Configures Raspberry Pi OS Bookworm (Wayland labwc / wayfire or X11) so the
# built-in virtual keyboard (squeekboard / wvkbd-mobintl / matchbox-keyboard)
# pops up automatically whenever an input is focused in the OWL Kiosk browser.
#
# Usage on Raspberry Pi 5:
#   chmod +x scripts/setup-rpi5-keyboard.sh
#   ./scripts/setup-rpi5-keyboard.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SERVER="${SCRIPT_DIR}/piper-tts-server.py"
SERVICE_FILE="/etc/systemd/system/piper-tts.service"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OWL Kiosk — Raspberry Pi 5 Virtual Keyboard Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Install Raspberry Pi OS virtual keyboards if not already present
echo "[1/4] Checking virtual keyboard packages (squeekboard / wvkbd / matchbox-keyboard)..."
sudo apt-get update -qq
sudo apt-get install -y -qq squeekboard wvkbd matchbox-keyboard libglib2.0-bin dbus-x11 python3 || true

# 2. Enable Raspberry Pi OS on-screen keyboard via raspi-config & gsettings
echo "[2/4] Enabling Raspberry Pi OS On-Screen Keyboard..."
if command -v raspi-config >/dev/null 2>&1; then
  sudo raspi-config nonint do_ekeyboard 0 || true
fi
gsettings set org.gnome.desktop.a11y.applications screen-keyboard-enabled true 2>/dev/null || true

# 3. Ensure wvkbd-mobintl is running in hidden/ready state (shows on SIGUSR2, hides on SIGUSR1)
#    Note: wvkbd-mobintl uses the Wayland OVERLAY layer so it renders ABOVE Fullscreen (F11 / --kiosk) windows!
echo "[3/5] Starting virtual keyboard daemon in ready state (Wayland OVERLAY layer)..."
if command -v wvkbd-mobintl >/dev/null 2>&1; then
  pkill -f wvkbd-mobintl 2>/dev/null || true
  nohup wvkbd-mobintl --hidden -L 280 >/dev/null 2>&1 &
  echo "  ✓ wvkbd-mobintl running in ready state (renders above fullscreen)"
fi

# 3b. Configure labwc borderless maximized rule for Chromium so --app mode looks
#     100% fullscreen while allowing squeekboard (Wayland TOP layer) to stay visible on top
echo "[4/5] Configuring labwc window rules for borderless fullscreen kiosk..."
mkdir -p "${HOME}/.config/labwc"
if [ ! -f "${HOME}/.config/labwc/rc.xml" ]; then
  cat > "${HOME}/.config/labwc/rc.xml" << 'EOF'
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

# 4. Ensure local bridge server (port 5050) is installed & running as systemd service
echo "[5/5] Configuring local Kiosk Bridge Server (http://127.0.0.1:5050/keyboard)..."
sudo tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=OWL Kiosk Local TTS & Raspberry Pi 5 Virtual Keyboard Bridge
After=network.target graphical.target
Wants=network.target

[Service]
Type=simple
User=$(whoami)
Environment=XDG_RUNTIME_DIR=/run/user/$(id -u)
Environment=DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus
Environment=WAYLAND_DISPLAY=wayland-0
Environment=DISPLAY=:0
WorkingDirectory=${SCRIPT_DIR}
ExecStart=/usr/bin/python3 ${PYTHON_SERVER}
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable piper-tts.service
sudo systemctl restart piper-tts.service

echo ""
echo "✓ Setup complete! The website will now automatically call"
echo "  http://localhost:5050/keyboard?action=show when any input is focused."
