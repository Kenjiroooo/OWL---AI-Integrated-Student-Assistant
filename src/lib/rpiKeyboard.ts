/**
 * rpiKeyboard.ts — Raspberry Pi 5 Built-in Virtual Keyboard Trigger Bridge
 *
 * Automatically invokes the Raspberry Pi 5 OS virtual keyboard (squeekboard,
 * wvkbd-mobintl, onboard, or matchbox-keyboard) whenever a user focuses or taps
 * any text <input> or <textarea> in the kiosk website.
 *
 * Works via two simultaneous mechanisms:
 *   1. Browser-native VirtualKeyboard API (`navigator.virtualKeyboard.show()`) +
 *      `virtualkeyboardpolicy="auto"` & `inputMode` attributes for Chromium Wayland/X11 IME.
 *   2. Local Raspberry Pi bridge call (`http://localhost:5050/keyboard?action=show|hide`)
 *      handled by `scripts/piper-tts-server.py`, which runs the OS D-Bus / signal command:
 *        - Squeekboard: `busctl call --user sm.puri.OSK0 /sm/puri/OSK0 sm.puri.OSK0 SetVisible b true`
 *        - wvkbd:       `pkill -SIGUSR2 -f wvkbd`
 *        - Onboard:     `dbus-send ... org.onboard.Onboard.Keyboard.Show`
 */

const LOCAL_KEYBOARD_ENDPOINT = 'http://localhost:5050/keyboard';

const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);

export function isTextEntryElement(el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLTextAreaElement) {
    return !el.readOnly && !el.disabled;
  }
  if (el instanceof HTMLInputElement) {
    const type = (el.type || 'text').toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(type) && !el.readOnly && !el.disabled;
  }
  return el.isContentEditable;
}

/**
 * Send a show/hide command to the Raspberry Pi 5 local keyboard bridge
 * and invoke the browser's Web VirtualKeyboard API.
 */
export function triggerRpiVirtualKeyboard(visible: boolean, target?: HTMLInputElement | HTMLTextAreaElement) {
  try {
    if (visible && target) {
      target.setAttribute('virtualkeyboardpolicy', 'auto');
      if (!target.getAttribute('inputmode') || target.getAttribute('inputmode') === 'none') {
        const type = target instanceof HTMLInputElement ? (target.type || 'text').toLowerCase() : 'text';
        const mode =
          type === 'number'
            ? 'numeric'
            : type === 'tel'
            ? 'tel'
            : type === 'email'
            ? 'email'
            : type === 'url'
            ? 'url'
            : type === 'search'
            ? 'search'
            : 'text';
        target.setAttribute('inputmode', mode);
      }
    }

    const vk = (navigator as any)?.virtualKeyboard;
    if (vk) {
      if (visible && typeof vk.show === 'function') {
        vk.show();
      } else if (!visible && typeof vk.hide === 'function') {
        vk.hide();
      }
    }
  } catch {
    // Ignore browser VirtualKeyboard API errors
  }

  // Call the local Raspberry Pi 5 bridge server (non-blocking)
  const action = visible ? 'show' : 'hide';
  fetch(`${LOCAL_KEYBOARD_ENDPOINT}?action=${action}`, {
    method: 'GET',
    mode: 'cors',
    keepalive: true,
  }).catch(() => {
    // Silently ignore when not running on the Raspberry Pi kiosk
  });
}

/**
 * Registers global focusin / pointerup / focusout listeners on `document`
 * so focusing or tapping any input/textarea triggers the Raspberry Pi 5
 * built-in virtual keyboard.
 */
export function initRpiVirtualKeyboard(): () => void {
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleFocusIn = (e: FocusEvent) => {
    if (!isTextEntryElement(e.target)) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    triggerRpiVirtualKeyboard(true, e.target);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isTextEntryElement(e.target)) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    triggerRpiVirtualKeyboard(true, e.target);
  };

  const handleFocusOut = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (!isTextEntryElement(document.activeElement)) {
        triggerRpiVirtualKeyboard(false);
      }
    }, 180);
  };

  document.addEventListener('focusin', handleFocusIn, true);
  document.addEventListener('pointerup', handlePointerUp, true);
  document.addEventListener('focusout', handleFocusOut, true);

  return () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    document.removeEventListener('focusin', handleFocusIn, true);
    document.removeEventListener('pointerup', handlePointerUp, true);
    document.removeEventListener('focusout', handleFocusOut, true);
  };
}
