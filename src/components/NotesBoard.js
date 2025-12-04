import React, { useState, useEffect } from 'react';
import './NotesBoard.css';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const NotesBoard = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(api.notesBoard.public);
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.data || []);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="notes-board-container">
        <div className="notes-loading">Loading notes...</div>
      </div>
    );
  }

  if (notes.length === 0) {
    return null; // Don't show if no notes
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '📢';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="notes-board-container">
      <div className="notes-board-header">
        <h2>📋 Notice Board</h2>
        <span className="notes-count">{notes.length} {notes.length === 1 ? 'notice' : 'notices'}</span>
      </div>
      
      <div className="notes-list">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className={`notes-card priority-${note.priority}`}
            style={{ borderLeftColor: getPriorityColor(note.priority) }}
          >
            <div className="notes-card-header">
              <div className="notes-priority-badge" style={{ backgroundColor: getPriorityColor(note.priority) }}>
                <span className="priority-icon">{getPriorityIcon(note.priority)}</span>
                <span className="priority-text">{note.priority.toUpperCase()}</span>
              </div>
              <span className="notes-date">{formatDate(note.created_at)}</span>
            </div>
            
            <h3 className="notes-title">{note.title}</h3>
            <p className="notes-message">{note.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesBoard;

