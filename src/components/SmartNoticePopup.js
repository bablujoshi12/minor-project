import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import './SmartNoticePopup.css';

const SmartNoticePopup = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedNotices, setDismissedNotices] = useState(() => {
    // Load dismissed notices from localStorage
    try {
      return JSON.parse(localStorage.getItem('dismissedNotices') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadNotices();
  }, [user]);

  const loadNotices = async () => {
    try {
      // Don't fetch if no user
      if (!user) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        return; // No token, skip fetching
      }

      let response;
      
      // Fetch notices based on user role
      if (user.role === 'admin') {
        response = await fetch(api.admin.notices, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (user.role === 'teacher') {
        response = await fetch(api.teacher.notices, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (user.role === 'student') {
        response = await fetch(api.student.notices, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (user.role === 'parent') {
        response = await fetch(api.parent.notices, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // For non-logged in users, fetch public notices
        // We'll use a simplified public API or show important notices
        return;
      }

      // Handle response - don't show errors for expected failures (401, 403)
      if (response && response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Filter out dismissed notices and get only unread/high priority ones (for popup)
          const activeNotices = data.data
            .filter(notice => 
              !dismissedNotices.includes(notice.id) &&
              (notice.priority === 'high' || notice.priority === 'urgent' || (notice.priority === 'medium' && !notice.is_read))
            )
            .sort((a, b) => {
              // Sort by priority: urgent > high > medium
              const priorityOrder = { 'urgent': 3, 'high': 2, 'medium': 1, 'low': 0 };
              return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            })
            .slice(0, 5); // Show max 5 notices
          
          if (activeNotices.length > 0) {
            setNotices(activeNotices);
            setIsVisible(true);
            setCurrentNoticeIndex(0);
          }
        }
      } else if (response && (response.status === 401 || response.status === 403)) {
        // Silently handle auth errors - token expired or invalid
        // Don't log to console as this is expected behavior
        return;
      }
    } catch (error) {
      // Only log unexpected errors (network errors, etc.)
      // Don't log auth errors as they're expected
      if (!error.message.includes('401') && !error.message.includes('403')) {
        console.error('Error loading notices:', error);
      }
    }
  };

  const handleClose = () => {
    if (notices[currentNoticeIndex]) {
      // Mark current notice as dismissed
      const noticeId = notices[currentNoticeIndex].id;
      const updatedDismissed = [...dismissedNotices, noticeId];
      setDismissedNotices(updatedDismissed);
      localStorage.setItem('dismissedNotices', JSON.stringify(updatedDismissed));
    }
    
    // Move to next notice or close
    if (currentNoticeIndex < notices.length - 1) {
      setCurrentNoticeIndex(currentNoticeIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleNext = () => {
    if (currentNoticeIndex < notices.length - 1) {
      setCurrentNoticeIndex(currentNoticeIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handlePrev = () => {
    if (currentNoticeIndex > 0) {
      setCurrentNoticeIndex(currentNoticeIndex - 1);
    }
  };

  const handleDismissAll = () => {
    const allNoticeIds = notices.map(n => n.id);
    const updatedDismissed = [...dismissedNotices, ...allNoticeIds];
    setDismissedNotices(updatedDismissed);
    localStorage.setItem('dismissedNotices', JSON.stringify(updatedDismissed));
    setIsVisible(false);
  };

  if (!isVisible || notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentNoticeIndex];
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="smart-notice-overlay" onClick={handleClose}>
      <div 
        className="smart-notice-popup" 
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${getPriorityColor(currentNotice.priority || 'medium')}` }}
      >
        <button className="smart-notice-close" onClick={handleClose}>×</button>
        
        <div className="smart-notice-header">
          <div className="notice-priority-badge" style={{ backgroundColor: getPriorityColor(currentNotice.priority || 'medium') }}>
            <span className="priority-icon-large">{getPriorityIcon(currentNotice.priority || 'medium')}</span>
            <span className="priority-text-large">{currentNotice.priority?.toUpperCase() || 'NOTICE'}</span>
          </div>
          <div className="notice-meta">
            <span className="notice-date">📅 {formatDate(currentNotice.created_at)}</span>
            {currentNotice.sender_name && (
              <span className="notice-sender">👤 From: {currentNotice.sender_name}</span>
            )}
          </div>
        </div>

        <div className="smart-notice-body">
          <h2 className="notice-title">{currentNotice.title}</h2>
          <div className="notice-message">
            {currentNotice.message.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          
          {currentNotice.recipient_type && currentNotice.recipient_type !== 'all' && (
            <div className="notice-recipient">
              <strong>To:</strong> {currentNotice.recipient_type.charAt(0).toUpperCase() + currentNotice.recipient_type.slice(1)}
            </div>
          )}
        </div>

        <div className="smart-notice-footer">
          <div className="notice-counter">
            {currentNoticeIndex + 1} / {notices.length}
          </div>
          <div className="notice-actions">
            {notices.length > 1 && (
              <>
                <button 
                  className="notice-nav-btn" 
                  onClick={handlePrev}
                  disabled={currentNoticeIndex === 0}
                  title="Previous Notice"
                >
                  ← Prev
                </button>
                <button 
                  className="notice-nav-btn" 
                  onClick={handleNext}
                  disabled={currentNoticeIndex === notices.length - 1}
                  title="Next Notice"
                >
                  Next →
                </button>
              </>
            )}
            <button className="notice-dismiss-btn" onClick={handleDismissAll}>
              Dismiss All
            </button>
            <button className="notice-close-btn" onClick={handleClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartNoticePopup;

