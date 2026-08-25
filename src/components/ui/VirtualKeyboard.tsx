import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, ArrowBigUp, Check, X, Keyboard } from 'lucide-react';
import clsx from 'clsx';

interface VirtualKeyboardProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
    show: boolean;
}

const LAYOUT_LOWERCASE = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['{shift}', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '{backspace}'],
    ['{numbers}', ',', '{space}', '.', '{submit}']
];

const LAYOUT_UPPERCASE = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['{shift}', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '{backspace}'],
    ['{numbers}', ',', '{space}', '.', '{submit}']
];

const LAYOUT_NUMBERS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'],
    ['{shift}', '=', '"', "'", ':', ';', '!', '?', '{backspace}'],
    ['{abc}', ',', '{space}', '.', '{submit}']
];

export function VirtualKeyboard({ value, onChange, onSubmit, onClose, show }: VirtualKeyboardProps) {
    const [isShift, setIsShift] = useState(false);
    const [isNumbers, setIsNumbers] = useState(false);

    const playClickSound = () => {
        // Optional click sound for tactile feedback
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
        } catch (e) {
            // Ignore if audio context not supported or blocked
        }
    };

    const handleKeyPress = (key: string) => {
        playClickSound();
        
        switch (key) {
            case '{backspace}':
                onChange(value.slice(0, -1));
                break;
            case '{space}':
                onChange(value + ' ');
                break;
            case '{shift}':
                setIsShift(!isShift);
                break;
            case '{numbers}':
                setIsNumbers(true);
                setIsShift(false);
                break;
            case '{abc}':
                setIsNumbers(false);
                setIsShift(false);
                break;
            case '{submit}':
                onSubmit();
                break;
            default:
                onChange(value + key);
                if (isShift) {
                    setIsShift(false);
                }
                break;
        }
    };

    const currentLayout = isNumbers ? LAYOUT_NUMBERS : (isShift ? LAYOUT_UPPERCASE : LAYOUT_LOWERCASE);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-blue-100 shadow-[0_-10px_40px_rgba(0,49,126,0.1)] z-[100] pb-safe"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-2.5 sm:gap-3">
                        {/* Header bar with close button */}
                        <div className="flex justify-between items-center mb-1 px-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Keyboard className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Virtual Keyboard</span>
                            </div>
                            <button 
                                onClick={() => { playClickSound(); onClose(); }}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Keyboard Rows */}
                        {currentLayout.map((row, rowIndex) => (
                            <div key={rowIndex} className={clsx("flex justify-center gap-2 sm:gap-3", rowIndex === 1 && "px-4 sm:px-6")}>
                                {row.map((key) => {
                                    let content: React.ReactNode = key;
                                    let className = "bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow";
                                    let isSpecial = false;

                                    if (key === '{backspace}') {
                                        content = <Delete className="w-5 h-5 sm:w-6 sm:h-6" />;
                                        className = "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 w-16 sm:w-20";
                                        isSpecial = true;
                                    } else if (key === '{shift}') {
                                        content = <ArrowBigUp className={clsx("w-5 h-5 sm:w-6 sm:h-6", isShift && "fill-current")} />;
                                        className = clsx("border hover:bg-slate-200 w-16 sm:w-20", isShift ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-slate-100 border-slate-200 text-slate-600");
                                        isSpecial = true;
                                    } else if (key === '{space}') {
                                        content = "Space";
                                        className = "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex-grow max-w-[20rem]";
                                        isSpecial = true;
                                    } else if (key === '{numbers}') {
                                        content = "?123";
                                        className = "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 w-16 sm:w-20 font-bold";
                                        isSpecial = true;
                                    } else if (key === '{abc}') {
                                        content = "ABC";
                                        className = "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 w-16 sm:w-20 font-bold";
                                        isSpecial = true;
                                    } else if (key === '{submit}') {
                                        content = <Check className="w-6 h-6" />;
                                        className = "bg-gradient-to-br from-blue-500 to-indigo-600 border-transparent text-white shadow-md hover:shadow-lg w-16 sm:w-20";
                                        isSpecial = true;
                                    }

                                    return (
                                        <button
                                            key={key}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleKeyPress(key);
                                            }}
                                            className={clsx(
                                                "h-12 sm:h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 active:brightness-95",
                                                !isSpecial && "flex-1 min-w-[2.5rem] sm:min-w-[3rem] font-medium text-lg sm:text-xl",
                                                className
                                            )}
                                        >
                                            {content}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
