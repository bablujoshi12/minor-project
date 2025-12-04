import React from 'react';
import './CollegeLogo.css';

const CollegeLogo = ({ size = 60, animated = true, className = '' }) => {
  const logoHeight = size * 1.15; // Adjust for banner
  const gearRadius = size * 0.45;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return (
    <div className={`college-logo-container ${animated ? 'animated' : ''} ${className}`}>
      <svg 
        width={size} 
        height={logoHeight} 
        viewBox={`0 0 ${size} ${logoHeight}`}
        className="college-logo-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Gear */}
        <g className="gear-outer" transform={`translate(${centerX}, ${centerY})`}>
          <circle cx="0" cy="0" r={gearRadius} fill="none" stroke="#1e3a8a" strokeWidth="2.5"/>
          {/* Gear Teeth - 20 teeth */}
          {[...Array(20)].map((_, i) => {
            const angle = (i * 360 / 20) * Math.PI / 180;
            const innerRadius = gearRadius - 8;
            const outerRadius = gearRadius + 5;
            const x1 = innerRadius * Math.cos(angle);
            const y1 = innerRadius * Math.sin(angle);
            const x2 = outerRadius * Math.cos(angle);
            const y2 = outerRadius * Math.sin(angle);
            return (
              <line 
                key={i} 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="#1e3a8a" 
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Inner Circle for text path */}
        <defs>
          <path 
            id={`textPathTop-${size}`}
            d={`M ${centerX - gearRadius * 0.7},${centerY} A ${gearRadius * 0.7},${gearRadius * 0.7} 0 1,1 ${centerX + gearRadius * 0.7},${centerY}`}
            fill="none"
          />
        </defs>
        
        {/* Hindi Text - Top Arc */}
        <text 
          className="logo-text-top"
          fontSize={size * 0.07}
          fill="#1e3a8a"
          fontWeight="600"
        >
          <textPath href={`#textPathTop-${size}`} startOffset="50%">
            <tspan textAnchor="middle" dy="0">राजकीय पॉलिटेक्निक लोहाघाट</tspan>
          </textPath>
        </text>

        {/* Compass in Center */}
        <g className="compass-group" transform={`translate(${centerX}, ${centerY})`}>
          {/* Compass Circle */}
          <circle cx="0" cy="0" r={size * 0.15} fill="none" stroke="#1e3a8a" strokeWidth="2"/>
          
          {/* Compass Legs (inverted V pointing down) */}
          <line 
            x1="0" 
            y1={-size * 0.08} 
            x2={-size * 0.06} 
            y2={size * 0.025} 
            stroke="#1e3a8a" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          <line 
            x1="0" 
            y1={-size * 0.08} 
            x2={size * 0.06} 
            y2={size * 0.025} 
            stroke="#1e3a8a" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          
          {/* Compass Pivot Point */}
          <circle cx="0" cy="0" r="2.5" fill="#1e3a8a"/>
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#1e3a8a" strokeWidth="1"/>
        </g>

        {/* Bottom Text - Uttarakhand */}
        <text 
          x={centerX} 
          y={centerY + size * 0.2} 
          className="logo-text-bottom"
          fontSize={size * 0.1}
          fill="#1e3a8a"
          fontWeight="700"
          textAnchor="middle"
        >
          उत्तराखण्ड
        </text>

        {/* Banner below gear */}
        <rect 
          x={centerX - size * 0.5} 
          y={size * 0.65} 
          width={size} 
          height={size * 0.15} 
          rx="3" 
          fill="none" 
          stroke="#1e3a8a" 
          strokeWidth="2"
        />
        <text 
          x={centerX} 
          y={size * 0.73} 
          fontSize={size * 0.09}
          fill="#1e3a8a" 
          fontWeight="600" 
          textAnchor="middle"
        >
          कर्म विद्याहि कौशलम्
        </text>
      </svg>
    </div>
  );
};

export default CollegeLogo;

