import React, { useEffect, useState, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { Keyboard as KeyboardIcon, X } from 'lucide-react';

export default function GlobalKeyboard() {
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [layoutName, setLayoutName] = useState('default');
  const [inputVal, setInputVal] = useState('');
  const keyboardRef = useRef<any>(null);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Allow for both text inputs, search inputs, emails, etc. and textareas
      if (
        (target.tagName === 'INPUT' && 
         ['text', 'search', 'email', 'url', 'number', 'password'].includes((target as HTMLInputElement).type)) ||
        target.tagName === 'TEXTAREA'
      ) {
        const inputElement = target as HTMLInputElement | HTMLTextAreaElement;
        setActiveInput(inputElement);
        setInputVal(inputElement.value);
        if (keyboardRef.current) {
          keyboardRef.current.setInput(inputElement.value);
        }
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Small delay to allow clicking on the keyboard without losing focus instantly
      setTimeout(() => {
        // If focus moved to something outside our keyboard or another input
        const active = document.activeElement as HTMLElement | null;
        if (!active || 
            (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !active.closest('.simple-keyboard-wrapper'))) {
          setActiveInput(null);
        }
      }, 150);
    };

    const handleInput = (e: Event) => {
      if (e.target === activeInput) {
        const newVal = (e.target as HTMLInputElement).value;
        setInputVal(newVal);
        if (keyboardRef.current) {
          keyboardRef.current.setInput(newVal);
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('input', handleInput);
    };
  }, [activeInput]);

  const onChange = (input: string) => {
    if (!activeInput) return;

    setInputVal(input);
    
    // Set the native value and trigger React's synthetic events
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window[activeInput.tagName === 'INPUT' ? 'HTMLInputElement' : 'HTMLTextAreaElement'].prototype,
      'value'
    )?.set;
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(activeInput, input);
    } else {
      activeInput.value = input;
    }
    
    activeInput.dispatchEvent(new Event('input', { bubbles: true }));
    // Dispatch change event as well, for good measure
    activeInput.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
    }
  };

  if (!activeInput) return null;

  const isDrawerInput = activeInput?.closest('#owl-chat-drawer');

  return (
    <div 
      className={`fixed bottom-0 left-0 z-[99999] bg-slate-200/90 backdrop-blur-md p-3 shadow-2xl border-t border-slate-300 simple-keyboard-wrapper ${isDrawerInput ? 'right-[420px]' : 'right-0'}`}
      style={{ animation: 'slideUp 0.3s ease-out' }}
      onMouseDown={(e) => {
        // Prevent clicking on the keyboard from stealing focus from the input
        e.preventDefault();
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-3 px-2">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <KeyboardIcon className="w-5 h-5 text-blue-600" />
            <span>Virtual Keyboard</span>
          </div>
          <button 
            onClick={() => setActiveInput(null)} 
            className="p-2 hover:bg-slate-300/80 rounded-xl text-slate-600 transition-colors flex items-center gap-1 text-sm font-medium"
            title="Close Keyboard"
          >
            <X className="w-5 h-5" /> Close
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-2">
          <Keyboard
            keyboardRef={r => (keyboardRef.current = r)}
            layoutName={layoutName}
            onChange={onChange}
            onKeyPress={onKeyPress}
            display={{
              '{bksp}': 'delete',
              '{enter}': 'enter',
              '{shift}': 'shift',
              '{s}': 'shift',
              '{tab}': 'tab',
              '{lock}': 'caps lock',
              '{accept}': 'Submit',
              '{space}': 'space',
            }}
            theme="hg-theme-default hg-layout-default myTheme"
          />
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .simple-keyboard-wrapper .hg-button {
          height: 55px !important;
          border-radius: 8px !important;
          font-size: 1.1rem !important;
          font-weight: 500;
          box-shadow: 0 2px 0 rgba(0,0,0,0.1) !important;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #1e293b !important;
          transition: all 0.1s;
        }
        .simple-keyboard-wrapper .hg-button:active {
          transform: translateY(2px);
          box-shadow: none !important;
          background: #f1f5f9 !important;
        }
        .simple-keyboard-wrapper .hg-button-space {
          width: 400px !important;
        }
      `}</style>
    </div>
  );
}
