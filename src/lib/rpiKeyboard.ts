/**
 * rpiKeyboard.ts — Raspberry Pi 5 Built-in Virtual Keyboard Trigger & Viewport Manager
 *
 * Automatically invokes the Raspberry Pi 5 OS virtual keyboard (squeekboard,
 * wvkbd-mobintl, onboard, or matchbox-keyboard) whenever a user focuses or taps
 * any text <input> or <textarea> in the kiosk website, AND smoothly scrolls
 * bottom inputs / chat bars up above the keyboard so the user can always see
 * what they are typing in Fullscreen (F11 / --kiosk) mode.
 */

const LOCAL_KEYBOARD_ENDPOINTS = [
  'http://127.0.0.1:5050/keyboard',
  'http://localhost:5050/keyboard',
];

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

const STYLE_ELEMENT_ID = 'rpi-keyboard-viewport-styles';
let scrollTimer1: ReturnType<typeof setTimeout> | null = null;
let scrollTimer2: ReturnType<typeof setTimeout> | null = null;

function ensureKeyboardViewportStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
    /* Expand bottom scrollable area on all pages (including #owl-chat-page)
       when the virtual keyboard is open, without shifting layout at 0ms */
    html.rpi-keyboard-open body {
      padding-bottom: 45vh !important;
    }

    /* Allow fixed overlay modals (e.g. Lost & Found Claim Modal) to scroll above the keyboard */
    html.rpi-keyboard-open [data-rpi-modal-shift="true"]:not(#owl-chat-drawer) {
      align-items: flex-start !important;
      overflow-y: auto !important;
      padding-top: 1.25rem !important;
      padding-bottom: 45vh !important;
    }

    /* Lift the slide-over OwlChatDrawer input bar above the keyboard after tap completes */
    html.rpi-keyboard-open #owl-chat-drawer[data-rpi-modal-shift="true"] {
      padding-bottom: 42vh !important;
      transition: padding-bottom 0.2s ease-out !important;
    }
  `;
  document.head.appendChild(style);
}

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
 * Scroll the focused input into the top visible half of the screen
 * so the Raspberry Pi OS virtual keyboard (~40vh at the bottom) never covers it.
 * Uses the exact same non-destructive body padding + window.scrollBy across all pages
 * (including OwlChatPage) so touch taps never jump before GestureTap completes.
 */
function ensureInputVisibleAboveKeyboard(target: HTMLElement) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  ensureKeyboardViewportStyles();
  document.documentElement.classList.add('rpi-keyboard-open');

  const scrollTargetIntoSafeZone = () => {
    if (document.activeElement !== target) return;

    // Check if the input lives inside a fixed modal overlay (apply after tap completes)
    let el: HTMLElement | null = target.parentElement;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed') {
        el.setAttribute('data-rpi-modal-shift', 'true');
        break;
      }
      el = el.parentElement;
    }

    const rect = target.getBoundingClientRect();
    const safeTop = 85;
    const safeBottom = window.innerHeight * 0.52;

    if (rect.bottom > safeBottom || rect.top < safeTop) {
      const isOwlChat = Boolean(target.closest('#owl-chat-page'));
      const desiredTop = Math.max(safeTop, window.innerHeight * (isOwlChat ? 0.42 : 0.26));
      const deltaY = rect.top - desiredTop;

      // Find nearest scrollable ancestor if any
      let scrollParent: HTMLElement | null = null;
      let p = target.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const s = window.getComputedStyle(p);
        if (
          (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
          p.scrollHeight > p.clientHeight + 10
        ) {
          scrollParent = p;
          break;
        }
        p = p.parentElement;
      }

      if (scrollParent) {
        scrollParent.scrollBy({ top: deltaY, behavior: 'smooth' });
      } else {
        window.scrollBy({ top: deltaY, behavior: 'smooth' });
      }
    }
  };

  if (scrollTimer1) clearTimeout(scrollTimer1);
  if (scrollTimer2) clearTimeout(scrollTimer2);
  scrollTimer1 = setTimeout(scrollTargetIntoSafeZone, 120);
  scrollTimer2 = setTimeout(scrollTargetIntoSafeZone, 260);
}

function resetKeyboardViewportShift() {
  if (scrollTimer1) {
    clearTimeout(scrollTimer1);
    scrollTimer1 = null;
  }
  if (scrollTimer2) {
    clearTimeout(scrollTimer2);
    scrollTimer2 = null;
  }
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('rpi-keyboard-open');
  document.querySelectorAll('[data-rpi-modal-shift="true"]').forEach((node) => {
    node.removeAttribute('data-rpi-modal-shift');
  });
  if (typeof window !== 'undefined' && document.getElementById('owl-chat-page')) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Send a show/hide command to the Raspberry Pi 5 local keyboard bridge
 * and invoke the browser's Web VirtualKeyboard API.
 */
export function triggerRpiVirtualKeyboard(visible: boolean, target?: HTMLInputElement | HTMLTextAreaElement) {
  try {
    if (visible && target) {
      ensureInputVisibleAboveKeyboard(target);
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
    } else if (!visible) {
      resetKeyboardViewportShift();
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
  const isFullscreen =
    Boolean(document.fullscreenElement) ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    Math.abs(window.innerHeight - window.screen.height) <= 8;
  const query = `?action=${action}&fullscreen=${isFullscreen ? '1' : '0'}`;

  fetch(`${LOCAL_KEYBOARD_ENDPOINTS[0]}${query}`, {
    method: 'GET',
    mode: 'cors',
    keepalive: true,
  }).catch(() => {
    fetch(`${LOCAL_KEYBOARD_ENDPOINTS[1]}${query}`, {
      method: 'GET',
      mode: 'cors',
      keepalive: true,
    }).catch(() => {
      // Silently ignore when not running on the Raspberry Pi kiosk
    });
  });
}

/**
 * Registers global focusin / pointerup / focusout listeners on `document`
 * so focusing or tapping any input/textarea triggers the Raspberry Pi 5
 * built-in virtual keyboard and scrolls the input above the keyboard.
 */
export function initRpiVirtualKeyboard(): () => void {
  ensureKeyboardViewportStyles();
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
    resetKeyboardViewportShift();
    document.removeEventListener('focusin', handleFocusIn, true);
    document.removeEventListener('pointerup', handlePointerUp, true);
    document.removeEventListener('focusout', handleFocusOut, true);
  };
}
