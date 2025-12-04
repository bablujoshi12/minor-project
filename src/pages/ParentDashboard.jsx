import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../config/api';
import authService from '../services/authService';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = authService.getToken();
  
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [testMarks, setTestMarks] = useState([]);
  const [semesterResults, setSemesterResults] = useState([]);
  const [messageTo, setMessageTo] = useState({ teacher_id: '', message: '', subject: '' });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChildren();
    loadNotices();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildData();
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      const response = await fetch(api.parent.children, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setChildren(data.data);
        if (data.data.length > 0 && !selectedChild) {
          setSelectedChild(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const loadChildData = async () => {
    if (!selectedChild) return;

    try {
      setLoading(true);

      // Load attendance
      const attRes = await fetch(`${api.parent.childAttendance}?student_id=${selectedChild}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attData = await attRes.json();
      if (attData.success) setAttendance(attData.data);

      // Load assignments
      const assignRes = await fetch(`${api.parent.childAssignments}?student_id=${selectedChild}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const assignData = await assignRes.json();
      if (assignData.success) setAssignments(assignData.data);

      // Load marks
      const marksRes = await fetch(`${api.parent.childMarks}?student_id=${selectedChild}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const marksData = await marksRes.json();
      if (marksData.success) setTestMarks(marksData.data);

      // Load semester results
      const resultsRes = await fetch(`${api.parent.childSemesterResults}?student_id=${selectedChild}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resultsData = await resultsRes.json();
      if (resultsData.success) setSemesterResults(resultsData.data);

    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await fetch(api.parent.notices, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setNotices(data.data || []);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const sendMessageToTeacher = async () => {
    try {
      if (!messageTo.teacher_id || !messageTo.message) {
        alert('Please select teacher and enter message');
        return;
      }

      const response = await fetch(api.parent.sendMessage, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageTo)
      });

      const data = await response.json();
      if (data.success) {
        alert('Message sent to teacher!');
        setMessageTo({ teacher_id: '', message: '', subject: '' });
      }
    } catch (error) {
      alert('Error sending message');
    }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/');
  };

  const selectedChildData = children.find(c => c.id === selectedChild);

  // Attendance Chart Data (with monthly data)
  const attendanceChartData = attendance && attendance.monthlyData && attendance.monthlyData.length > 0 ? {
    labels: attendance.monthlyData.map(m => m.month),
    datasets: [{
      label: 'Attendance %',
      data: attendance.monthlyData.map(m => parseFloat(((m.present_days / m.total_days) * 100).toFixed(2))),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  } : (attendance ? {
    labels: ['Present', 'Absent'],
    datasets: [{
      label: 'Attendance',
      data: [attendance.presentDays || 0, attendance.absentDays || 0],
      backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)']
    }]
  } : null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>👨‍👩‍👧‍👦 Parent Dashboard</h1>
          <p>Welcome, <strong>{user?.name || 'Parent'}</strong>!</p>
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{
          padding: '0.5rem 1.5rem',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          🚪 Logout
        </button>
      </div>

      {/* Select Child */}
      <div className="dashboard-card">
        <h2>Select Your Child</h2>
        {children.length > 0 ? (
          <div className="children-selector">
            {children.map(child => (
              <button
                key={child.id}
                className={`child-button ${selectedChild === child.id ? 'active' : ''}`}
                onClick={() => setSelectedChild(child.id)}
              >
                {child.name} ({child.roll_no})
              </button>
            ))}
          </div>
        ) : (
          <p>No children found. Please contact admin to link your account.</p>
        )}
      </div>

      {selectedChildData && (
        <>
          {/* Child Profile */}
          <div className="dashboard-card">
            <h2>Child Profile</h2>
            <div className="profile-grid">
              <div><strong>Roll No:</strong> {selectedChildData.roll_no || 'N/A'}</div>
              <div><strong>Name:</strong> {selectedChildData.name || 'N/A'}</div>
              <div><strong>Branch:</strong> {selectedChildData.branch_name || selectedChildData.branch || 'N/A'}</div>
              <div><strong>Year:</strong> {selectedChildData.year || 'N/A'}</div>
              <div><strong>Section:</strong> {selectedChildData.section || 'N/A'}</div>
              {selectedChildData.email && <div><strong>Email:</strong> {selectedChildData.email}</div>}
              {selectedChildData.phone && <div><strong>Phone:</strong> {selectedChildData.phone}</div>}
              {selectedChildData.dob && <div><strong>DOB:</strong> {new Date(selectedChildData.dob).toLocaleDateString()}</div>}
            </div>
          </div>

          {/* Attendance */}
          <div className="dashboard-card">
            <h2>📅 Attendance</h2>
            {attendance ? (
              <>
                <div className="attendance-stats">
                  <div className="stat-box">
                    <div className="stat-value">{attendance.totalDays || 0}</div>
                    <div className="stat-label">Total Days</div>
                  </div>
                  <div className="stat-box stat-box-success">
                    <div className="stat-value">{attendance.presentDays || 0}</div>
                    <div className="stat-label">Present</div>
                  </div>
                  <div className="stat-box stat-box-warning">
                    <div className="stat-value">{attendance.absentDays || 0}</div>
                    <div className="stat-label">Absent</div>
                  </div>
                  <div className="stat-box highlight">
                    <div className="stat-value">{attendance.percentage || 0}%</div>
                    <div className="stat-label">Percentage</div>
                  </div>
                </div>
                {attendance.attendance && attendance.attendance.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Recent Attendance</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.attendance.slice(0, 30).map((att, idx) => (
                            <tr key={idx}>
                              <td>{new Date(att.date).toLocaleDateString()}</td>
                              <td>
                                <span className={`status-badge ${att.status === 'present' ? 'success' : att.status === 'absent' ? 'error' : 'warning'}`}>
                                  {att.status || 'N/A'}
                                </span>
                              </td>
                              <td>{att.remarks || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {attendanceChartData && (
                  <div className="chart-container" style={{ marginTop: '1.5rem' }}>
                    <Line data={attendanceChartData} options={{
                      responsive: true,
                      plugins: { legend: { display: true }, title: { display: true, text: 'Attendance Overview' } }
                    }} />
                  </div>
                )}
              </>
            ) : (
              <p>No attendance data available</p>
            )}
          </div>

          {/* Assignments */}
          <div className="dashboard-card">
            <h2>📝 Assignments</h2>
            {assignments.length > 0 ? (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Marks</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment, idx) => (
                      <tr key={assignment.id || idx}>
                        <td><strong>{assignment.title}</strong></td>
                        <td>{assignment.subject || assignment.description || '-'}</td>
                        <td>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            background: assignment.is_submitted ? '#10b981' : '#3b82f6',
                            color: 'white'
                          }}>
                            {assignment.is_submitted ? '✅ Submitted' : '📋 Assigned'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${assignment.status || (assignment.is_submitted ? 'submitted' : 'pending')}`}>
                            {assignment.status || (assignment.is_submitted ? 'submitted' : 'pending')}
                          </span>
                        </td>
                        <td>{assignment.is_submitted ? (assignment.submission_date ? new Date(assignment.submission_date).toLocaleDateString() : 'Yes') : 'No'}</td>
                        <td>{assignment.marks || assignment.marks_obtained || '-'}</td>
                        <td>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {assignments.some(a => a.is_submitted) && (
                  <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    ✅ = Submitted by student | 📋 = Assigned by teacher
                  </p>
                )}
              </>
            ) : (
              <p>No assignments found</p>
            )}
          </div>

          {/* Test Marks (3rd & 4th Semester Only) */}
          <div className="dashboard-card">
            <h2>📊 Test Marks (3rd & 4th Semester)</h2>
            {testMarks.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Subject</th>
                    <th>Test Name</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {testMarks.map((mark, idx) => {
                    const formatSemester = (sem) => {
                      if (sem === 3) return '3rd';
                      if (sem === 4) return '4th';
                      return `${sem}th`;
                    };
                    const percentage = typeof mark.percentage === 'number' ? mark.percentage : 
                      ((mark.marks_obtained / (mark.total_marks || mark.max_marks || 100)) * 100);
                    return (
                      <tr key={idx}>
                        <td>
                          <span style={{ padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {formatSemester(mark.semester)}
                          </span>
                        </td>
                        <td><strong>{mark.subject}</strong></td>
                        <td>{mark.test_name || mark.exam_type || 'Exam'}</td>
                        <td>{mark.marks_obtained}/{mark.total_marks || mark.max_marks}</td>
                        <td>
                          <span className={`percentage-badge ${percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td>{mark.exam_date ? new Date(mark.exam_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No test marks available for 3rd & 4th semester</p>
            )}
          </div>

          {/* Semester Results (3rd and 4th Semester only) */}
          <div className="dashboard-card">
            <h2>🏆 Semester Results (3rd & 4th Semester)</h2>
            {semesterResults.length > 0 ? (
              <div className="results-grid">
                {semesterResults.map((result, idx) => (
                  <div key={idx} className="result-card">
                    <h3>{result.semester} Semester</h3>
                    <div className="result-percentage">{result.percentage}%</div>
                    <div className={`result-status ${result.status}`}>{result.status.toUpperCase()}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {result.total_subjects} Subjects
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No semester results available for 3rd and 4th semester</p>
            )}
          </div>

          {/* Send Message to Teacher */}
          <div className="dashboard-card">
            <h2>💬 Contact Teacher</h2>
            <div className="message-form">
              <input
                type="number"
                placeholder="Teacher ID"
                value={messageTo.teacher_id}
                onChange={(e) => setMessageTo({ ...messageTo, teacher_id: e.target.value })}
              />
              <input
                type="text"
                placeholder="Subject"
                value={messageTo.subject}
                onChange={(e) => setMessageTo({ ...messageTo, subject: e.target.value })}
              />
              <textarea
                placeholder="Message"
                value={messageTo.message}
                onChange={(e) => setMessageTo({ ...messageTo, message: e.target.value })}
                rows="4"
              />
              <button onClick={sendMessageToTeacher}>Send Message</button>
            </div>
          </div>

          {/* Notices */}
          <div className="dashboard-card">
            <h2>📢 Notices</h2>
            {notices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notices.map(notice => (
                  <div key={notice.id} style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: notice.is_read ? '#f9fafb' : '#eff6ff',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{notice.title}</h3>
                    <p style={{ margin: '0 0 0.5rem 0' }}>{notice.message}</p>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(notice.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No notices available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentDashboard;

