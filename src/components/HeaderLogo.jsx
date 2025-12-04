import React, { useState, useEffect } from 'react';
import './HeaderLogo.css';

const HeaderLogo = ({ size = 48, animated = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className={`header-logo-container ${animated ? 'animated' : ''} ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="logo-circle">
        {/* Shimmer Effect */}
        <div className="logo-shimmer"></div>
        
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 80 80" 
          className="logo-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background Circle with Gradient */}
          <circle cx="40" cy="40" r="36" fill="url(#logoGradient)" className="logo-bg" filter="url(#glow)"/>
          
          {/* Gear Outline */}
          <g className="gear-icon">
            {/* Outer Gear Ring */}
            <circle cx="40" cy="40" r="32" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9"/>
            
            {/* Gear Teeth - 12 teeth for smoother look */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 360 / 12) * Math.PI / 180;
              const x1 = 40 + 28 * Math.cos(angle);
              const y1 = 40 + 28 * Math.sin(angle);
              const x2 = 40 + 32 * Math.cos(angle);
              const y2 = 40 + 32 * Math.sin(angle);
              return (
                <line 
                  key={i} 
                  x1={x1} 
                  y1={y1} 
                  x2={x2} 
                  y2={y2} 
                  stroke="#ffffff" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`gear-tooth gear-tooth-${i}`}
                  opacity={0.95}
                />
              );
            })}
            
            {/* Inner Circle */}
            <circle cx="40" cy="40" r="20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9"/>
            
            {/* Center Design - Compass/Gear combo */}
            <g className="compass-icon">
              {/* North Pointer */}
              <path d="M 40 20 L 35 28 L 45 28 Z" fill="#ffffff" opacity="0.95" className="compass-pointer"/>
              {/* Center Circle */}
              <circle cx="40" cy="40" r="8" fill="#ffffff" opacity="0.95" className="compass-center"/>
              {/* Horizontal Line */}
              <line x1="32" y1="40" x2="48" y2="40" stroke="#1e3a8a" strokeWidth="1.5" className="compass-line"/>
              {/* Vertical Line */}
              <line x1="40" y1="32" x2="40" y2="48" stroke="#1e3a8a" strokeWidth="1.5" className="compass-line"/>
            </g>
          </g>
        </svg>
      </div>
      
      {/* Glow Effects */}
      <div className="logo-glow logo-glow-1"></div>
      <div className="logo-glow logo-glow-2"></div>
      
      {/* Ripple Effect on Hover */}
      {isHovered && <div className="logo-ripple"></div>}
    </div>
  );
};

export default HeaderLogo;

