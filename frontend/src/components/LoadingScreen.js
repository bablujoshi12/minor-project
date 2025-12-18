import React, { useEffect } from 'react';
import './LoadingScreen.css';
import HeaderLogo from './HeaderLogo';

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    // Show loading screen for 3 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen-premium" role="status" aria-live="polite">
      <div className="loading-backdrop">
        <div className="loading-content">
          <div className="loading-logo-container">
            <HeaderLogo size={100} animated={true} />
          </div>
          <div className="loading-text">
            <p className="loading-message">Loading Smart Campus Portal...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

