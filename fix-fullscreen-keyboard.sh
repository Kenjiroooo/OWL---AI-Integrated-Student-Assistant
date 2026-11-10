#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# fix-fullscreen-keyboard.sh — Force Raspberry Pi Built-in Keyboard (Squeekboard)
# onto the Wayland OVERLAY Layer (Layer 3) so it shows above Fullscreen (F11)
#
# Run on Raspberry Pi with ONE line:
#   curl -sL https://raw.githubusercontent.com/Kenjiroooo/OWL---AI-Integrated-Student-Assistant/main/fix-fullscreen-keyboard.sh | sudo bash
# ──────────────────────────────────────────────────────────────────────────────

set -e

echo "=========================================================="
echo "  Fixing Raspberry Pi Virtual Keyboard for Fullscreen Mode"
echo "=========================================================="

# 1. Ensure gcc & libc6-dev are available
if ! command -v gcc >/dev/null 2>&1; then
  echo "[1/4] Installing gcc..."
  apt-get update -qq && apt-get install -y -qq gcc libc6-dev
else
  echo "[1/4] Compiler (gcc) found."
fi

# 2. Write and compile the Wayland OVERLAY layer hook (Layer 3)
echo "[2/4] Compiling Wayland OVERLAY layer hook (/usr/local/lib/libsqueekboard_overlay.so)..."
mkdir -p /usr/local/lib

cat > /tmp/squeekboard_overlay.c << 'EOF'
#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdint.h>
#include <stdio.h>
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

union wl_argument {
    int32_t i;
    uint32_t u;
    int32_t f;
    const char *s;
    void *o;
    uint32_t n;
    void *a;
    int32_t h;
};

__attribute__((constructor))
static void init_overlay_hook(void) {
    unsetenv("LD_PRELOAD");
}

/* Hook 1: wl_proxy_marshal_array_flags (Wayland 1.20+ core array marshaller) */
typedef struct wl_proxy *(*marshal_array_flags_fn)(
    struct wl_proxy *, uint32_t, const struct wl_interface *, uint32_t, uint32_t, union wl_argument *);

struct wl_proxy *wl_proxy_marshal_array_flags(
    struct wl_proxy *proxy, uint32_t opcode, const struct wl_interface *interface,
    uint32_t version, uint32_t flags, union wl_argument *args)
{
    static marshal_array_flags_fn real_fn = NULL;
    if (!real_fn) real_fn = (marshal_array_flags_fn)dlsym(RTLD_NEXT, "wl_proxy_marshal_array_flags");

    if (args && opcode == 0 && interface && interface->name &&
        strcmp(interface->name, "zwlr_layer_surface_v1") == 0) {
        args[3].u = 3; /* Force ZWLR_LAYER_SHELL_V1_LAYER_OVERLAY (3) */
    }
    if (args && opcode == 8 && proxy && proxy->interface && proxy->interface->name &&
        strcmp(proxy->interface->name, "zwlr_layer_surface_v1") == 0) {
        args[0].u = 3; /* Force set_layer to OVERLAY (3) */
    }
    return real_fn(proxy, opcode, interface, version, flags, args);
}

/* Hook 2: wl_proxy_marshal_flags (Wayland 1.20+ variadic marshaller) */
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
        a3 = (void *)(uintptr_t)3; /* Force ZWLR_LAYER_SHELL_V1_LAYER_OVERLAY (3) */
    }
    if (opcode == 8 && proxy && proxy->interface && proxy->interface->name &&
        strcmp(proxy->interface->name, "zwlr_layer_surface_v1") == 0) {
        a0 = (void *)(uintptr_t)3;
    }
    return real_fn(proxy, opcode, interface, version, flags, a0, a1, a2, a3, a4, a5, a6, a7);
}

/* Hook 3: wl_proxy_marshal_constructor (Wayland < 1.20 variadic marshaller) */
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

/* Hook 4: wl_proxy_marshal_constructor_versioned */
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
EOF

gcc -shared -fPIC -O2 /tmp/squeekboard_overlay.c -o /usr/local/lib/libsqueekboard_overlay.so -ldl
chmod 755 /usr/local/lib/libsqueekboard_overlay.so
rm -f /tmp/squeekboard_overlay.c
echo "  ✓ Compiled /usr/local/lib/libsqueekboard_overlay.so"

# 3. Divert /usr/bin/squeekboard to /usr/bin/squeekboard.orig (if not already diverted)
#    and always write the wrapper script to /usr/bin/squeekboard
echo "[3/4] Installing /usr/bin/squeekboard wrapper..."
if [ ! -f /usr/bin/squeekboard.orig ]; then
  if [ -f /usr/bin/squeekboard ]; then
    dpkg-divert --divert /usr/bin/squeekboard.orig --rename /usr/bin/squeekboard
  fi
fi

cat > /usr/bin/squeekboard << 'EOF'
#!/bin/sh
exec env LD_PRELOAD=/usr/local/lib/libsqueekboard_overlay.so /usr/bin/squeekboard.orig "$@"
EOF
chmod 755 /usr/bin/squeekboard
echo "  ✓ Installed /usr/bin/squeekboard wrapper"

# 4. Restart squeekboard so it immediately runs on the Wayland OVERLAY layer
echo "[4/4] Restarting Squeekboard..."
pkill -9 -f squeekboard || true
sleep 1

# If labwc didn't auto-respawn squeekboard yet, start it as the desktop user
DESKTOP_USER="${SUDO_USER:-owl}"
DESKTOP_UID="$(id -u "${DESKTOP_USER}" 2>/dev/null || echo 1000)"
if ! pgrep -f squeekboard.orig >/dev/null 2>&1; then
  sudo -u "${DESKTOP_USER}" env \
    XDG_RUNTIME_DIR="/run/user/${DESKTOP_UID}" \
    WAYLAND_DISPLAY="wayland-0" \
    DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/${DESKTOP_UID}/bus" \
    nohup /usr/bin/squeekboard >/dev/null 2>&1 &
fi

echo ""
echo "=========================================================="
echo "  ✓ DONE! Squeekboard is now on the Wayland OVERLAY layer."
echo "    Press F11 in Chromium and tap any input to test!"
echo "=========================================================="
