import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, ArrowLeft, MessageSquare, Square } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { OwlCharacter } from '../components/OwlCharacter';
import { askOwl, type ChatMessage } from '../lib/gemini';
import { VirtualKeyboard } from '../components/ui/VirtualKeyboard';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        role: 'ai',
        content: 'Hello! I am OWL AI Assistant, your Universidad de Dagupan Student Assistant. How can I help you today with enrollment, finding a room, or other campus-related questions?',
        timestamp: new Date()
    }
];

const SUGGESTED_PROMPTS = [
    "Where is room 204?",
    "What is the enrollment process?",
    "Where is the UdD campus located?"
];

function chunkText(text: string, maxChars: number = 170): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const word of words) {
        if ((currentChunk + ' ' + word).length > maxChars) {
            chunks.push(currentChunk.trim());
            currentChunk = word;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + word;
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.length > 0 ? chunks : [text];
}

export default function OwlChatPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showKeyboard, setShowKeyboard] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const hasBoundaryFiredRef = useRef(false);

    useEffect(() => {
        // Reset page when a new message arrives
        setCurrentPage(0);
    }, [messages.length]);

    const handleStop = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsTalking(false);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsTyping(false);
    };

    useEffect(() => {
        // Cleanup speech on unmount
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleSend = async (e?: FormEvent, presetPrompt?: string) => {
        e?.preventDefault();
        const text = presetPrompt || input;
        if (!text.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        hasBoundaryFiredRef.current = false;

        abortControllerRef.current = new AbortController();

        try {
            // Build chat history for context (exclude the initial greeting)
            const history: ChatMessage[] = messages
                .slice(1) // skip initial AI greeting
                .map(m => ({ role: m.role, content: m.content }));

            const aiResponse = await askOwl(text, history, abortControllerRef.current.signal);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

            // Speak the AI's response
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(aiResponse);
                // Find a clear, normal-paced male voice
                const voices = window.speechSynthesis.getVoices();
                // Prefer Google Male voices, or any English Male voice
                const preferredVoice = voices.find(v => 
                    v.name.includes('Google UK English Male') || 
                    v.name.includes('Google US English') || 
                    (v.name.includes('Male') && v.lang.startsWith('en'))
                ) || voices.find(v => v.lang.startsWith('en')); // Fallback

                if (preferredVoice) utterance.voice = preferredVoice;
                
                // Set normal pace and pitch
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                
                // Calculate chunk boundaries for sync
                const chunks = chunkText(aiResponse, 170);
                const cumulativeLengths: number[] = [];
                let currentLen = 0;
                for (let c of chunks) {
                    currentLen += c.length + 1; // approximate space
                    cumulativeLengths.push(currentLen);
                }
                
                utterance.onboundary = (e) => {
                    hasBoundaryFiredRef.current = true;
                    const idx = cumulativeLengths.findIndex(len => e.charIndex <= len);
                    if (idx !== -1) {
                        setCurrentPage(idx);
                    }
                };
                
                utterance.onstart = () => setIsTalking(true);
                utterance.onend = () => setIsTalking(false);
                utterance.onerror = () => setIsTalking(false);
                window.speechSynthesis.speak(utterance);
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Failed to get AI response:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: "I'm sorry, something went wrong. Please try again in a moment! 🦉",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
            setShowKeyboard(false);
        }
    };

    const lastAiMessage = [...messages].reverse().find(m => m.role === 'ai');
    const messageChunks = lastAiMessage ? chunkText(lastAiMessage.content) : [];
    const showSuggestions = messages.length === 1 && !isTyping;

    // Auto-advance fallback if Web Speech API onboundary event fails or isn't supported
    useEffect(() => {
        if (messageChunks.length > 1 && currentPage < messageChunks.length - 1) {
            const currentText = messageChunks[currentPage];
            // roughly 75ms per character + 1500ms base reading time
            const timeToRead = Math.max(3000, currentText.length * 75 + 1500);
            
            const timer = setTimeout(() => {
                if (!hasBoundaryFiredRef.current) {
                    setCurrentPage(p => Math.min(messageChunks.length - 1, p + 1));
                }
            }, timeToRead);
            
            return () => clearTimeout(timer);
        }
    }, [currentPage, messageChunks.length, lastAiMessage?.content]);

    return (
        <div className="flex flex-col h-screen w-full bg-[#F1F5F9] font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/home')}
                    className="p-3 bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                        <OwlCharacter className="w-10 h-10 scale-[1.3] translate-y-0.5" hideShadow />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">OWL AI Assistant</h1>
                        <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Online</p>
                    </div>
                </div>
            </header>

            {/* Scene Area — Owl + Speech Bubble */}
            <div className="flex-1 w-full bg-gradient-to-b from-blue-50 via-sky-50 to-white relative overflow-auto flex flex-col items-center justify-end pb-6 px-4">
                {/* Decorative Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 rounded-full blur-[120px]"></div>
                </div>

                {/* Chat Messages (user messages shown as bubbles above the owl) */}
                <div className="w-full max-w-2xl flex flex-col gap-3 mt-6 mb-4 z-10">
                    {messages.filter(m => m.role === 'user').map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="self-end bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-lg max-w-[80%]"
                        >
                            <p className="text-sm sm:text-base font-medium">{msg.content}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Speech Bubble */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-6 max-w-lg px-6 py-5 bg-white rounded-3xl rounded-br-sm shadow-xl border border-blue-100 mx-4 z-10"
                >
                    {isTyping ? (
                        <div className="flex items-center justify-center gap-1.5 h-6">
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="max-h-48 overflow-y-auto pr-1">
                                <p className="text-slate-700 font-medium text-center sm:text-lg leading-relaxed whitespace-pre-wrap min-h-[4rem] flex items-center justify-center">
                                    {messageChunks[currentPage] || ''}
                                </p>
                            </div>
                            {messageChunks.length > 1 && (
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={currentPage === 0}
                                        className="px-4 py-1 text-sm font-bold text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-xs font-bold text-slate-400">
                                        Page {currentPage + 1} of {messageChunks.length}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(messageChunks.length - 1, prev + 1))}
                                        disabled={currentPage === messageChunks.length - 1}
                                        className="px-4 py-1 text-sm font-bold text-blue-600 disabled:opacity-30 hover:bg-blue-50 rounded-full transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Bubble Tail */}
                    <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white border-b border-r border-blue-100 transform rotate-45"></div>
                </motion.div>

                {/* Owl Character */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="z-0"
                >
                    <OwlCharacter isTyping={isTyping} isTalking={isTalking} />
                </motion.div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 w-full bg-white border-t border-slate-200/60 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="max-w-2xl mx-auto">
                    {showSuggestions && (
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                            {SUGGESTED_PROMPTS.map(prompt => (
                                <motion.button
                                    key={prompt}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleSend(undefined, prompt)}
                                    className="px-4 py-2 rounded-full border border-blue-200 bg-blue-50/50 text-blue-700 text-sm hover:bg-blue-100 hover:border-blue-300 transition-colors font-semibold"
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSend} className="relative flex items-center group">
                        <input
                            type="text"
                            inputMode="none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => setShowKeyboard(true)}
                            placeholder="Message OWL AI Assistant..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                        />
                        {(isTyping || isTalking) ? (
                            <button
                                type="button"
                                onClick={handleStop}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-red-500 text-white rounded-full hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center"
                            >
                                <Square size={16} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={18} />
                            </button>
                        )}
                    </form>
                    <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                        OWL AI is a campus guide for Universidad de Dagupan students. Verify important info with the registrar.
                    </p>
                </div>
            </div>
            
            {/* Keyboard Spacer */}
            <motion.div 
                initial={false}
                animate={{ height: showKeyboard ? 340 : 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full bg-[#f1f5f9] flex-shrink-0"
            />

            {/* Virtual Keyboard */}
            <VirtualKeyboard
                show={showKeyboard}
                value={input}
                onChange={setInput}
                onSubmit={() => {
                    if (input.trim() && !isTyping) {
                        handleSend();
                    }
                }}
                onClose={() => setShowKeyboard(false)}
            />
        </div>
    );
}
