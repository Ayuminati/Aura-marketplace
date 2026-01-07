
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  hideText?: boolean;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32, hideText = false, light = false }) => {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <path 
            d="M50 10 L85 85 H65 L50 48 L35 85 H15 L50 10Z" 
            fill="url(#auraGradient)"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          <path 
            d="M40 70 H60 L50 48 Z" 
            className={light ? "fill-slate-900" : "fill-white"} 
            opacity="0.8"
          />
        </svg>
      </div>
      {!hideText && (
        <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors ${light ? "text-white" : "text-slate-900"}`}>
          AURA<span className="text-indigo-600">.</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
