import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import authService from '../services/authService';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = authService.getToken();

  // Get user from localStorage if not in context
  const getUserData = () => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  // Initialize with empty/real-first data
  const getInitialProfile = () => {
    const currentUser = user || getUserData();
    return {
      roll_no: currentUser?.roll_no || currentUser?.email?.split('@')[0]?.toUpperCase() || '',
      name: currentUser?.name || '',
      branch: currentUser?.branch || '',
      year: currentUser?.year || '',
      section: currentUser?.section || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || ''
    };
  };

  const [profile, setProfile] = useState(() => getInitialProfile());
  const [attendance, setAttendance] = useState(null);
  const [testMarks, setTestMarks] = useState([]);
  const [semesterResults, setSemesterResults] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthInfo, setHealthInfo] = useState({ blood_group: 'O+', physical_problems: '', health_issues: '' });

  useEffect(() => {
    // Update profile when user data is available
    setProfile(getInitialProfile());
    loadStudentData();
    loadNotices();
    loadTeacherAssignments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profileRes = await fetch(api.student.profile, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success && profileData.data) {
        setProfile(profileData.data);
        setHealthInfo({
          blood_group: profileData.data.blood_group || '',
          physical_problems: profileData.data.physical_problems || '',
          health_issues: profileData.data.health_issues || ''
        });
      } else {
        // keep existing profile (no random fallback)
        setProfile(prev => ({ ...prev }));
      }

      // Load attendance
      try {
        const attRes = await fetch(api.student.attendanceDashboard, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const attData = await attRes.json();
        if (attData.success && attData.data) {
          setAttendance(attData.data);
        } else {
          setAttendance(null);
        }
      } catch (err) {
        setAttendance(null);
      }

      // Load test marks
      try {
        const marksRes = await fetch(api.student.testMarks, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const marksData = await marksRes.json();
        if (marksData.success && Array.isArray(marksData.data)) {
          setTestMarks(marksData.data);
        } else {
          setTestMarks([]);
        }
      } catch (err) {
        setTestMarks([]);
      }

      // Load semester results
      try {
        const resultsRes = await fetch(api.student.semesterResults, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resultsData = await resultsRes.json();
        if (resultsData.success && Array.isArray(resultsData.data)) {
          setSemesterResults(resultsData.data);
        } else {
          setSemesterResults([]);
        }
      } catch (err) {
        setSemesterResults([]);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      // Keep demo data that's already set
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentUpload = async (e) => {
    e.preventDefault();
    if (!assignmentFile || !assignmentTitle) {
      alert('Please select a file and enter title');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('assignment', assignmentFile);
      formData.append('title', assignmentTitle);
      formData.append('description', '');
      formData.append('subject', assignmentSubject);

      const response = await fetch(api.student.uploadAssignment, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert('Assignment uploaded successfully!');
        setAssignmentFile(null);
        setAssignmentTitle('');
        setAssignmentSubject('');
        document.getElementById('assignment-file').value = '';
        loadStudentData();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      alert('Error uploading assignment');
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await fetch(api.student.notices, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setNotices(data.data || []);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const loadTeacherAssignments = async () => {
    try {
      const response = await fetch(api.student.assignments, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setTeacherAssignments(data.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };


  const updateHealthInfo = async () => {
    try {
      const response = await fetch(api.student.updateHealthInfo, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(healthInfo)
      });

      const data = await response.json();
      if (data.success) {
        alert('Health information updated!');
      }
    } catch (error) {
      alert('Error updating health info');
    }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/');
  };

  // Use profile; if missing, keep empty object (no demo fallback)
  const displayProfile = profile || {};
  // Use real attendance from DB, no demo fallback
  const displayAttendance = attendance || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0, monthlyData: [], dailyData: [] };
  // Use real marks from DB, only fallback to demo if no data
  const displayTestMarks = testMarks.length > 0 ? testMarks : [];
  const displaySemesterResults = semesterResults.length > 0 ? semesterResults : [];

  // Attendance Chart Data (define after displayAttendance)
  const attendanceChartData = displayAttendance.monthlyData ? {
    labels: displayAttendance.monthlyData.map(m => m.month) || [],
    datasets: [{
      label: 'Attendance %',
      data: displayAttendance.monthlyData.map(m => parseFloat(((m.present_days / m.total_days) * 100).toFixed(2))) || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  } : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🎓 Student Dashboard</h1>
          <p>Welcome back, <strong>{displayProfile.name}</strong>! 👋</p>
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

      {/* Profile Card */}
      <div className="dashboard-card profile-card-modern">
        <h2>👤 Profile Information</h2>
        <div className="profile-grid">
          <div className="profile-item">
            <span className="profile-label">Roll No:</span>
            <span className="profile-value">{displayProfile.roll_no}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Name:</span>
            <span className="profile-value">{displayProfile.name}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Branch:</span>
            <span className="profile-value">{displayProfile.branch}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Year:</span>
            <span className="profile-value">Year {displayProfile.year}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Section:</span>
            <span className="profile-value">{displayProfile.section}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Email:</span>
            <span className="profile-value">{displayProfile.email}</span>
          </div>
          {displayProfile.phone && (
            <div className="profile-item">
              <span className="profile-label">Phone:</span>
              <span className="profile-value">{displayProfile.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Dashboard */}
      <div className="dashboard-card">
        <h2>📊 Attendance Dashboard</h2>
        <div className="attendance-stats">
          <div className="stat-box">
            <div className="stat-value">{displayAttendance.totalDays || 0}</div>
            <div className="stat-label">Total Days</div>
          </div>
          <div className="stat-box stat-box-success">
            <div className="stat-value">{displayAttendance.presentDays || 0}</div>
            <div className="stat-label">Present Days</div>
          </div>
          <div className="stat-box stat-box-warning">
            <div className="stat-value">{displayAttendance.absentDays || 0}</div>
            <div className="stat-label">Absent Days</div>
          </div>
          <div className="stat-box highlight">
            <div className="stat-value">{displayAttendance.percentage || 0}%</div>
            <div className="stat-label">Attendance %</div>
          </div>
        </div>
        {displayAttendance.attendance && displayAttendance.attendance.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Recent Attendance (Last 30 Days)</h3>
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
                  {displayAttendance.attendance.slice(0, 30).map((att, idx) => (
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
        {displayAttendance.monthlyData && displayAttendance.monthlyData.length > 0 && attendanceChartData && (
          <div className="chart-container" style={{ marginTop: '1.5rem' }}>
            <Line data={attendanceChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { display: true, position: 'top' }, 
                title: { display: true, text: 'Monthly Attendance Trend', font: { size: 16 } }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }} />
          </div>
        )}
        {(!displayAttendance.attendance || displayAttendance.attendance.length === 0) && (
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>No attendance records available</p>
        )}
      </div>

      {/* Test Marks */}
      <div className="dashboard-card">
        <h2>📝 Test Marks</h2>
        {displayTestMarks.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Test Name</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {displayTestMarks.map((mark, idx) => (
                <tr key={idx}>
                  <td><strong>{mark.subject}</strong></td>
                  <td>{mark.test_name || mark.exam_type || 'Exam'}</td>
                  <td>{mark.marks_obtained || 0}</td>
                  <td>{mark.total_marks || mark.max_marks || 100}</td>
                  <td><span className={`percentage-badge ${(() => {
                    const pct = mark.percentage || ((mark.marks_obtained / (mark.total_marks || mark.max_marks || 100)) * 100);
                    return pct >= 80 ? 'high' : pct >= 60 ? 'medium' : 'low';
                  })()}`}>
                    {(mark.percentage || ((mark.marks_obtained / (mark.total_marks || mark.max_marks || 100)) * 100)).toFixed(1)}%
                  </span></td>
                  <td>{mark.exam_date ? new Date(mark.exam_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No test marks available</p>
        )}
      </div>

      {/* Semester Results */}
      <div className="dashboard-card">
        <h2>🏆 Semester Results</h2>
        {displaySemesterResults.length > 0 ? (
          <>
            <div style={{ marginBottom: '0.75rem' }}>
              <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div className="results-grid">
              {displaySemesterResults
                .filter(r => !semesterFilter || String(r.semester_num || r.semester) === String(semesterFilter))
                .map((result, idx) => (
                  <div key={idx} className="result-card">
                    <h3>{result.semester} Semester</h3>
                    <div className="result-percentage">{result.percentage}%</div>
                    <div className={`result-status ${result.status || 'passed'}`}>{(result.status || 'passed').toUpperCase()}</div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="no-data-message">📊 No semester results available yet</p>
        )}
      </div>

      {/* Upload Assignment */}
      <div className="dashboard-card">
        <h2>📤 Upload Assignment</h2>
        <form onSubmit={handleAssignmentUpload} className="upload-form">
          <input
            type="text"
            placeholder="Assignment Title"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={assignmentSubject}
            onChange={(e) => setAssignmentSubject(e.target.value)}
          />
          <input
            id="assignment-file"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setAssignmentFile(e.target.files[0])}
            required
          />
          <button type="submit" disabled={loading}>Upload Assignment</button>
        </form>
      </div>

      {/* Health Information */}
      <div className="dashboard-card">
        <h2>🏥 Health Information</h2>
        <div className="health-form">
          <select
            value={healthInfo.blood_group}
            onChange={(e) => setHealthInfo({ ...healthInfo, blood_group: e.target.value })}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <textarea
            placeholder="Physical Problems/Health Issues"
            value={healthInfo.physical_problems || healthInfo.health_issues}
            onChange={(e) => setHealthInfo({ ...healthInfo, physical_problems: e.target.value, health_issues: e.target.value })}
          />
          <button onClick={updateHealthInfo}>Update Health Info</button>
        </div>
      </div>

      {/* Notices from Teachers/Admin */}
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

      {/* Assignments from Teachers */}
      <div className="dashboard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>📝 My Assignments</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ 
              padding: '0.5rem 1rem', 
              background: '#eff6ff', 
              color: '#3b82f6', 
              borderRadius: '4px',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              Total: {teacherAssignments.length}
            </span>
            <span style={{ 
              padding: '0.5rem 1rem', 
              background: '#f0fdf4', 
              color: '#10b981', 
              borderRadius: '4px',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              Submitted: {teacherAssignments.filter(a => a.is_submitted).length}
            </span>
            <span style={{ 
              padding: '0.5rem 1rem', 
              background: '#fef2f2', 
              color: '#ef4444', 
              borderRadius: '4px',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              Pending: {teacherAssignments.filter(a => !a.is_submitted).length}
            </span>
          </div>
        </div>
        
        {teacherAssignments.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {teacherAssignments.map(assignment => {
              const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && !assignment.is_submitted;
              
              return (
                <div key={assignment.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: assignment.is_submitted ? '#f0fdf4' : (isOverdue ? '#fef2f2' : 'white'),
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${assignment.is_submitted ? '#10b981' : (isOverdue ? '#ef4444' : '#3b82f6')}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem' }}>
                        {assignment.title}
                      </h3>
                      {assignment.teacher_name && (
                        <p style={{ margin: '0 0 0.75rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                          👨‍🏫 Teacher: <strong>{assignment.teacher_name}</strong>
                        </p>
                      )}
                      {assignment.description && (
                        <p style={{ margin: '0 0 0.75rem 0', color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                          {assignment.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                        {assignment.subject && (
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            background: '#eff6ff', 
                            color: '#3b82f6',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            📚 {assignment.subject}
                          </span>
                        )}
                        {assignment.due_date && (
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            background: isOverdue ? '#fee2e2' : '#fef3c7', 
                            color: isOverdue ? '#dc2626' : '#92400e',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            📅 Due: {new Date(assignment.due_date).toLocaleDateString()}
                            {isOverdue && <span style={{ marginLeft: '0.5rem' }}>⚠️ Overdue</span>}
                          </span>
                        )}
                        {assignment.is_submitted && assignment.submission_date && (
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            background: '#d1fae5', 
                            color: '#065f46',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            ✅ Submitted: {new Date(assignment.submission_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.75rem 1rem',
                      background: assignment.is_submitted ? '#10b981' : (isOverdue ? '#ef4444' : '#3b82f6'),
                      color: 'white',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      minWidth: '120px'
                    }}>
                      {assignment.is_submitted ? '✅ Submitted' : (isOverdue ? '⚠️ Overdue' : '⏳ Pending')}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem', 
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    {(assignment.file_url || assignment.file_path) && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const fileUrl = assignment.file_url || assignment.file_path;
                            const filename = fileUrl.split('/').pop();
                            
                            let downloadUrl;
                            if (assignment.id) {
                              downloadUrl = `${api.baseUrl}/api/files/assignment/${assignment.id}`;
                            } else {
                              downloadUrl = `${api.baseUrl}${fileUrl}`;
                            }

                            const response = await fetch(downloadUrl, {
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });

                            if (!response.ok) {
                              throw new Error('Failed to download file');
                            }

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Download error:', error);
                            alert('Failed to download file. Please try again.');
                          }
                        }}
                        style={{ 
                          padding: '0.75rem 1.5rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        📥 Download Assignment File
                      </button>
                    )}
                    <label style={{ 
                      padding: '0.75rem 1.5rem',
                      background: assignment.is_submitted ? '#10b981' : '#3b82f6',
                      color: 'white',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      boxShadow: assignment.is_submitted 
                        ? '0 2px 4px rgba(16, 185, 129, 0.3)' 
                        : '0 2px 4px rgba(59, 130, 246, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {assignment.is_submitted ? '📤 Resubmit Assignment' : '📤 Submit Assignment'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;

                          // Verify this is a teacher-assigned assignment
                          if (!assignment.id || !assignment.teacher_id) {
                            alert('This assignment cannot be submitted. Only teacher-assigned assignments can be submitted.');
                            e.target.value = '';
                            return;
                          }

                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('assignment_id', assignment.id);

                            const response = await fetch(api.student.submitAssignment, {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              },
                              body: formData
                            });

                            const data = await response.json();
                            if (data.success) {
                              alert('Assignment submitted successfully!');
                              loadTeacherAssignments();
                            } else {
                              alert(data.message || 'Failed to submit assignment');
                            }
                          } catch (error) {
                            console.error('Submit error:', error);
                            alert('Failed to submit assignment. Please try again.');
                          }
                          e.target.value = ''; // Reset input
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6b7280' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No assignments available</p>
            <p style={{ fontSize: '0.875rem' }}>Your teachers haven't assigned any assignments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

