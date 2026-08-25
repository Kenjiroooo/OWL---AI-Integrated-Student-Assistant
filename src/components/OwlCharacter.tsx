import React, { useEffect, useState } from 'react';

export function OwlCharacter({ isTyping, isTalking, className = "relative w-64 h-64 mx-auto", hideShadow = false }: { isTyping?: boolean, isTalking?: boolean, className?: string, hideShadow?: boolean }) {
    const leftPupilX = isTyping ? 92 : 100;
    const leftPupilY = isTyping ? 120 : 115;
    const rightPupilX = isTyping ? 164 : 156;
    const rightPupilY = isTyping ? 120 : 115;

    // Realistic beak flicker: rapidly toggle open state at ~120ms intervals when talking
    const [beakOpen, setBeakOpen] = useState(false);

    useEffect(() => {
        if (!isTalking) {
            setBeakOpen(false);
            return;
        }
        // Vary timing to simulate natural speech rhythm
        let timeout: ReturnType<typeof setTimeout>;
        const flicker = () => {
            setBeakOpen(prev => !prev);
            // Random interval between 80ms and 200ms for natural feel
            timeout = setTimeout(flicker, 80 + Math.random() * 120);
        };
        flicker();
        return () => clearTimeout(timeout);
    }, [isTalking]);

    // Beak geometry:
    // Closed: upper beak tip meets lower beak at ~y=150
    // Open: upper beak stays, lower jaw drops to y=165+
    const upperBeakPath = "M 118 138 Q 128 128 138 138 L 128 150 Z";
    const lowerBeakClosedPath = "M 118 138 L 128 150 L 138 138 Q 128 145 118 138 Z";
    const lowerBeakOpenPath = `M 118 142 L 128 150 L 138 142 Q 128 ${beakOpen ? '170' : '158'} 118 142 Z`;

    return (
        <div className={className}>
            <svg viewBox="0 0 256 256" className={`w-full h-full ${!hideShadow ? 'drop-shadow-xl' : ''}`} xmlns="http://www.w3.org/2000/svg">
                {!hideShadow && <ellipse cx="128" cy="235" rx="60" ry="8" fill="#0a2949" />}

                {/* Talons */}
                <rect x="90" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />
                <rect x="110" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />
                <rect x="126" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />
                <rect x="146" y="215" width="20" height="24" rx="10" fill="#f6c342" stroke="#0a2949" strokeWidth="6" />

                {/* Wings */}
                <path d="M 70 120 C 30 150 40 220 80 230 C 70 190 80 150 90 120 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />
                <path d="M 186 120 C 226 150 216 220 176 230 C 186 190 176 150 166 120 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

                {/* Main Body */}
                <path d="M 80 100 C 40 160 60 225 128 225 C 196 225 216 160 176 100 C 150 70 106 70 80 100 Z" fill="#1878a9" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

                {/* Belly Circuit Pattern */}
                <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <path d="M 128 200 L 128 175" />
                    <path d="M 128 190 L 145 175" />
                    <path d="M 128 180 L 105 160" />
                    <path d="M 115 168 L 100 178" />
                    <path d="M 135 183 L 150 193" />
                </g>
                <g fill="#ffffff">
                    <circle cx="105" cy="160" r="5" />
                    <circle cx="145" cy="175" r="5" />
                    <circle cx="100" cy="178" r="5" />
                    <circle cx="150" cy="193" r="5" />
                </g>

                {/* Face Mask */}
                <path d="M 60 110 C 60 150 100 160 128 140 C 156 160 196 150 196 110 C 196 70 150 80 128 90 C 106 80 60 70 60 110 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

                {/* Eyes */}
                <circle cx="95" cy="115" r="28" fill="#ffffff" stroke="#0a2949" strokeWidth="6" />
                <circle cx="161" cy="115" r="28" fill="#ffffff" stroke="#0a2949" strokeWidth="6" />

                {/* Pupils */}
                <circle cx={leftPupilX} cy={leftPupilY} r="18" fill="#0a2949" className="transition-all duration-300" />
                <circle cx={rightPupilX} cy={rightPupilY} r="18" fill="#0a2949" className="transition-all duration-300" />

                {/* Pupil Highlights */}
                <circle cx={leftPupilX + 6} cy={leftPupilY - 7} r="6" fill="#ffffff" className="transition-all duration-300" />
                <circle cx={rightPupilX + 6} cy={rightPupilY - 7} r="6" fill="#ffffff" className="transition-all duration-300" />
                <circle cx={leftPupilX - 5} cy={leftPupilY + 7} r="2.5" fill="#ffffff" className="transition-all duration-300" />
                <circle cx={rightPupilX - 5} cy={rightPupilY + 7} r="2.5" fill="#ffffff" className="transition-all duration-300" />

                {/* Beak — realistic open/close while talking */}
                {isTalking ? (
                    <g>
                        {/* Upper beak (fixed) */}
                        <path d={upperBeakPath} fill="#f6c342" stroke="#0a2949" strokeWidth="5" strokeLinejoin="round" />
                        {/* Lower jaw (drops open) */}
                        <path d={lowerBeakOpenPath} fill="#e8a800" stroke="#0a2949" strokeWidth="5" strokeLinejoin="round" />
                        {/* Inner mouth / tongue hint when wide open */}
                        {beakOpen && (
                            <path d="M 123 150 Q 128 156 133 150" fill="none" stroke="#c06000" strokeWidth="2.5" strokeLinecap="round" />
                        )}
                    </g>
                ) : (
                    /* Closed beak */
                    <path d="M 120 135 Q 128 130 136 135 L 128 165 Z" fill="#f6c342" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />
                )}

                {/* Eyebrows */}
                <path d="M 50 90 C 70 70 100 75 128 90 C 156 75 186 70 206 90 C 190 60 160 60 128 75 C 96 60 66 60 50 90 Z" fill="#1878a9" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

                {/* Graduation Cap */}
                <path d="M 85 60 L 80 90 Q 128 100 176 90 L 171 60 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />
                <path d="M 128 20 L 210 50 L 128 80 L 46 50 Z" fill="#0b4c79" stroke="#0a2949" strokeWidth="6" strokeLinejoin="round" />

                {/* Tassel */}
                <path d="M 128 50 Q 80 60 70 80" fill="none" stroke="#f6c342" strokeWidth="4" />
                <path d="M 70 80 L 60 110 L 80 110 Z" fill="#f6c342" stroke="#0a2949" strokeWidth="4" strokeLinejoin="round" />
                <path d="M 64 110 L 64 125 M 70 110 L 70 125 M 76 110 L 76 125" stroke="#f6c342" strokeWidth="3" strokeLinecap="round" />
                <circle cx="128" cy="50" r="5" fill="#f6c342" />
            </svg>
        </div>
    );
}
