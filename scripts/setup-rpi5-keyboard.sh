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

# 1. Install Raspberry Pi OS virtual keyboards & compiler if not already present
echo "[1/6] Checking virtual keyboard packages (squeekboard / wvkbd / gcc)..."
sudo apt-get update -qq
sudo apt-get install -y -qq squeekboard wvkbd matchbox-keyboard libglib2.0-bin dbus-x11 python3 gcc libc6-dev || true

# 2. Patch Squeekboard to render on Wayland OVERLAY layer (Layer 3) instead of TOP layer (Layer 2)
#    This fixes Raspberry Pi OS labwc issue #2926 where F11 / --kiosk fullscreen covers squeekboard!
echo "[2/6] Patching Raspberry Pi built-in Squeekboard to render on Wayland OVERLAY layer (above Fullscreen)..."
TMP_C="$(mktemp /tmp/squeekboard_overlay.XXXXXX.c)"
cat > "${TMP_C}" << 'EOF'
#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

struct wl_interface {
    const char *name;
    int version;
    int method_count;
    const void *methods;
    int event_count;
    const void *events;
};

struct wl_proxy {
    const struct wl_interface *interface;
};

__attribute__((constructor))
static void init_overlay_hook(void) {
    unsetenv("LD_PRELOAD");
}

typedef struct wl_proxy *(*marshal_flags_fn)(
    struct wl_proxy *, uint32_t, const struct wl_interface *, uint32_t, uint32_t,
    void *, void *, void *, void *, void *, void *, void *, void *);

struct wl_proxy *wl_proxy_marshal_flags(
    struct wl_proxy *proxy, uint32_t opcode, const struct wl_interface *interface,
    uint32_t version, uint32_t flags,
    void *a0, void *a1, void *a2, void *a3, void *a4, void *a5, void *a6, void *a7)
{
    static marshal_flags_fn real_fn = NULL;
    if (!real_fn) real_fn = (marshal_flags_fn)dlsym(RTLD_NEXT, "wl_proxy_marshal_flags");

    if (opcode == 0 && interface && interface->name &&
        strcmp(interface->name, "zwlr_layer_surface_v1") == 0) {
        a3 = (void *)(uintptr_t)3; /* ZWLR_LAYER_SHELL_V1_LAYER_OVERLAY */
    }
    if (opcode == 9 && proxy && proxy->interface && proxy->interface->name &&
        strcmp(proxy->interface->name, "zwlr_layer_surface_v1") == 0) {
        a0 = (void *)(uintptr_t)3;
    }
    return real_fn(proxy, opcode, interface, version, flags, a0, a1, a2, a3, a4, a5, a6, a7);
}

typedef struct wl_proxy *(*marshal_ctor_fn)(
    struct wl_proxy *, uint32_t, const struct wl_interface *,
    void *, void *, void *, void *, void *, void *, void *, void *);

struct wl_proxy *wl_proxy_marshal_constructor(
    struct wl_proxy *proxy, uint32_t opcode, const struct wl_interface *interface,
    void *a0, void *a1, void *a2, void *a3, void *a4, void *a5, void *a6, void *a7)
{
    static marshal_ctor_fn real_fn = NULL;
    if (!real_fn) real_fn = (marshal_ctor_fn)dlsym(RTLD_NEXT, "wl_proxy_marshal_constructor");

    if (opcode == 0 && interface && interface->name &&
        strcmp(interface->name, "zwlr_layer_surface_v1") == 0) {
        a3 = (void *)(uintptr_t)3;
    }
    return real_fn(proxy, opcode, interface, a0, a1, a2, a3, a4, a5, a6, a7);
}

typedef struct wl_proxy *(*marshal_ctor_ver_fn)(
    struct wl_proxy *, uint32_t, const struct wl_interface *, uint32_t,
    void *, void *, void *, void *, void *, void *, void *, void *);

struct wl_proxy *wl_proxy_marshal_constructor_versioned(
    struct wl_proxy *proxy, uint32_t opcode, const struct wl_interface *interface, uint32_t version,
    void *a0, void *a1, void *a2, void *a3, void *a4, void *a5, void *a6, void *a7)
{
    static marshal_ctor_ver_fn real_fn = NULL;
    if (!real_fn) real_fn = (marshal_ctor_ver_fn)dlsym(RTLD_NEXT, "wl_proxy_marshal_constructor_versioned");

    if (opcode == 0 && interface && interface->name &&
        strcmp(interface->name, "zwlr_layer_surface_v1") == 0) {
        a3 = (void *)(uintptr_t)3;
    }
    return real_fn(proxy, opcode, interface, version, a0, a1, a2, a3, a4, a5, a6, a7);
}

typedef void (*marshal_fn)(
    struct wl_proxy *, uint32_t,
    void *, void *, void *, void *, void *, void *, void *, void *);

void wl_proxy_marshal(
    struct wl_proxy *proxy, uint32_t opcode,
    void *a0, void *a1, void *a2, void *a3, void *a4, void *a5, void *a6, void *a7)
{
    static marshal_fn real_fn = NULL;
    if (!real_fn) real_fn = (marshal_fn)dlsym(RTLD_NEXT, "wl_proxy_marshal");

    if (opcode == 9 && proxy && proxy->interface && proxy->interface->name &&
        strcmp(proxy->interface->name, "zwlr_layer_surface_v1") == 0) {
        a0 = (void *)(uintptr_t)3;
    }
    real_fn(proxy, opcode, a0, a1, a2, a3, a4, a5, a6, a7);
}
EOF

sudo mkdir -p /usr/local/lib
sudo gcc -shared -fPIC -O2 "${TMP_C}" -o /usr/local/lib/libsqueekboard_overlay.so -ldl
rm -f "${TMP_C}"

if [ -f /usr/bin/squeekboard ] && [ ! -f /usr/bin/squeekboard.orig ]; then
  sudo dpkg-divert --divert /usr/bin/squeekboard.orig --rename /usr/bin/squeekboard
  sudo tee /usr/bin/squeekboard > /dev/null << 'EOF'
#!/bin/sh
exec env LD_PRELOAD=/usr/local/lib/libsqueekboard_overlay.so /usr/bin/squeekboard.orig "$@"
EOF
  sudo chmod +x /usr/bin/squeekboard
fi
pkill -9 -f squeekboard 2>/dev/null || true
echo "  ✓ Squeekboard patched to Wayland OVERLAY layer (will now show on top of Fullscreen F11 / --kiosk!)"

# 3. Enable Raspberry Pi OS on-screen keyboard via raspi-config & gsettings
echo "[3/6] Enabling Raspberry Pi OS On-Screen Keyboard..."
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
