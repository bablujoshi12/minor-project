import React, { useState } from 'react';
import './DeptCard.css';

const DeptCard = ({ dept, idx, animateCards }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Safe fallbacks so backend data without detailed lists doesn't crash
  const facultyList = Array.isArray(dept?.facultyList) ? dept.facultyList : [];
  const studentList = Array.isArray(dept?.studentList) ? dept.studentList : [];

  return (
    <>
      <div 
        className={`dept-card-smart ${animateCards ? 'slide-up' : ''}`} 
        style={{ '--accent': dept.color, animationDelay: `${idx * 0.1}s` }}
        onClick={() => setIsOpen(true)}
      >
        <div className="dept-icon-smart" style={{ background: `${dept.color}15` }}>
          <span>{dept.icon}</span>
        </div>
        <h3>{dept.name}</h3>
        <p>{dept.description}</p>
        <div className="dept-info-smart">
          <div className="dept-stat-smart">
            <span className="dept-number">{dept.students}</span>
            <span className="dept-label">Students</span>
          </div>
          <div className="dept-stat-smart">
            <span className="dept-number">{dept.teachers}</span>
            <span className="dept-label">Faculty</span>
          </div>
        </div>
        <div className="dept-badge" style={{ background: dept.color }}>
          Click for Details →
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="dept-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="dept-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsOpen(false)}>×</button>
            <div className="modal-header">
              <span className="modal-icon">{dept.icon}</span>
              <div>
                <h2>{dept.name}</h2>
                <p>{dept.description}</p>
              </div>
            </div>

            <div className="modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-value">{dept.students}+</span>
                <span className="modal-stat-label">Students</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-value">{dept.teachers}</span>
                <span className="modal-stat-label">Faculty</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>👨‍🎓 HOD</h3>
              <div className="hod-name">{dept.hod}</div>
            </div>

            <div className="modal-section">
              <h3>👨‍🏫 Faculty Members ({dept.teachers})</h3>
              <div className="faculty-list">
                {facultyList.map((faculty, i) => (
                  <div key={i} className="faculty-item">
                    {faculty}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h3>🎓 Students by Year ({dept.students}+ Total)</h3>
              <div className="students-list">
                {studentList.map((batch, i) => (
                  <div key={i} className="batch-item">
                    {batch}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeptCard;





