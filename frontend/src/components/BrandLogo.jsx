import React from 'react';

const BrandLogo = ({ size = 44 }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 51, 102, 0.12))' }}
        >
            <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#003366" />
                    <stop offset="100%" stopColor="#c5a059" />
                </linearGradient>
            </defs>

            {/* The Precision Hexagon */}
            <path 
                d="M50 5 L89 27.5 V72.5 L50 95 L11 72.5 V27.5 L50 5Z" 
                stroke="url(#logo-grad)" 
                strokeWidth="4" 
                strokeLinejoin="round" 
                fill="rgba(255,255,255,0.9)"
            />
            
            {/* The Inner Discovery Hexagon */}
            <path 
                d="M50 15 L78 31.5 V68.5 L50 85 L22 68.5 V31.5 L50 15Z" 
                fill="none" 
                stroke="#003366" 
                strokeWidth="1" 
                opacity="0.2"
            />

            {/* The 'D-Pulse' Waveform */}
            <path 
                d="M30 50 H38 L43 35 L50 65 L57 45 L62 50 H70" 
                stroke="url(#logo-grad)" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
            
            {/* Molecular Junction Nodes */}
            <circle cx="50" cy="5" r="3" fill="#c5a059" />
            <circle cx="89" cy="27.5" r="3" fill="#003366" />
            <circle cx="89" cy="72.5" r="3" fill="#003366" />
            <circle cx="50" cy="95" r="3" fill="#003366" />
            <circle cx="11" cy="72.5" r="3" fill="#003366" />
            <circle cx="11" cy="27.5" r="3" fill="#003366" />
            
            {/* Center Core Node */}
            <circle cx="50" cy="50" r="2" fill="#c5a059" />
        </svg>
    );
};

export default BrandLogo;
