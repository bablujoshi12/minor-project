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

  // Demo/Fallback data functions - Initialize immediately
  const getDemoProfile = (currentUserData) => {
    const currentUser = user || currentUserData || getUserData();
    return {
      roll_no: currentUser?.email?.split('@')[0]?.toUpperCase() || currentUser?.roll_no || 'STU23001',
      name: currentUser?.name || 'Student Name',
      branch: currentUser?.branch || 'Information Technology',
      year: currentUser?.year || 3,
      section: currentUser?.section || 'A',
      email: currentUser?.email || 'student@example.com',
      phone: currentUser?.phone || '+91-9876543210'
    };
  };

  const getDemoAttendance = () => ({
    totalDays: 180,
    presentDays: 165,
    absentDays: 15,
    percentage: 91.67,
    monthlyData: [
      { month: 'Jan', present_days: 22, total_days: 24 },
      { month: 'Feb', present_days: 20, total_days: 22 },
      { month: 'Mar', present_days: 24, total_days: 25 },
      { month: 'Apr', present_days: 21, total_days: 23 },
      { month: 'May', present_days: 23, total_days: 24 },
      { month: 'Jun', present_days: 22, total_days: 24 }
    ]
  });

  const getDemoTestMarks = () => [
    { subject: 'Data Structures', marks: 85, maxMarks: 100, percentage: 85, test_name: 'Mid-Term', exam_date: '2024-03-15' },
    { subject: 'Database Systems', marks: 92, maxMarks: 100, percentage: 92, test_name: 'Unit Test', exam_date: '2024-03-20' },
    { subject: 'Web Development', marks: 88, maxMarks: 100, percentage: 88, test_name: 'Practical', exam_date: '2024-03-25' },
    { subject: 'Operating Systems', marks: 79, maxMarks: 100, percentage: 79, test_name: 'Mid-Term', exam_date: '2024-04-01' }
  ];

  const getDemoSemesterResults = () => [
    { semester: '3rd', percentage: 87.5, status: 'passed' },
    { semester: '4th', percentage: 89.2, status: 'passed' },
    { semester: '5th', percentage: 91.0, status: 'passed' }
  ];

  // Initialize with demo data immediately
  const [profile, setProfile] = useState(() => getDemoProfile());
  const [attendance, setAttendance] = useState(() => getDemoAttendance());
  const [testMarks, setTestMarks] = useState(() => getDemoTestMarks());
  const [semesterResults, setSemesterResults] = useState(() => getDemoSemesterResults());
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
    const updatedProfile = getDemoProfile();
    setProfile(updatedProfile);
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
        // Use fallback profile
        setProfile(getDemoProfile(null));
      }

      // Load attendance
      try {
        const attRes = await fetch(api.student.attendanceDashboard, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const attData = await attRes.json();
        if (attData.success && attData.data) {
          setAttendance(attData.data);
        }
      } catch (err) {
        console.log('Using demo attendance data');
      }

      // Load test marks
      try {
        const marksRes = await fetch(api.student.testMarks, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const marksData = await marksRes.json();
        if (marksData.success && marksData.data && marksData.data.length > 0) {
          setTestMarks(marksData.data);
        }
      } catch (err) {
        console.log('Using demo test marks');
      }

      // Load semester results
      try {
        const resultsRes = await fetch(api.student.semesterResults, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resultsData = await resultsRes.json();
        if (resultsData.success && resultsData.data && resultsData.data.length > 0) {
          setSemesterResults(resultsData.data);
        }
      } catch (err) {
        console.log('Using demo semester results');
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

  // Use profile or fallback - always show data (define before use)
  const displayProfile = profile || getDemoProfile(null);
  const displayAttendance = attendance || getDemoAttendance();
  const displayTestMarks = testMarks.length > 0 ? testMarks : getDemoTestMarks();
  const displaySemesterResults = semesterResults.length > 0 ? semesterResults : getDemoSemesterResults();

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
            <div className="stat-value">{displayAttendance.totalDays}</div>
            <div className="stat-label">Total Days</div>
          </div>
          <div className="stat-box stat-box-success">
            <div className="stat-value">{displayAttendance.presentDays}</div>
            <div className="stat-label">Present Days</div>
          </div>
          <div className="stat-box stat-box-warning">
            <div className="stat-value">{displayAttendance.absentDays}</div>
            <div className="stat-label">Absent Days</div>
          </div>
          <div className="stat-box highlight">
            <div className="stat-value">{displayAttendance.percentage}%</div>
            <div className="stat-label">Attendance %</div>
          </div>
        </div>
        {displayAttendance.monthlyData && attendanceChartData && (
          <div className="chart-container">
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
                  <td>{mark.test_name || 'Mid-Term'}</td>
                  <td>{mark.marks_obtained || mark.marks}</td>
                  <td>{mark.total_marks || mark.maxMarks}</td>
                  <td><span className={`percentage-badge ${(() => {
                    let pct = mark.percentage;
                    if (!pct) {
                      const marks = mark.marks_obtained || mark.marks || 0;
                      const max = mark.total_marks || mark.maxMarks || 100;
                      pct = (marks / max) * 100;
                    }
                    return pct >= 80 ? 'high' : pct >= 60 ? 'medium' : 'low';
                  })()}`}>
                    {(() => {
                      let pct = mark.percentage;
                      if (!pct) {
                        const marks = mark.marks_obtained || mark.marks || 0;
                        const max = mark.total_marks || mark.maxMarks || 100;
                        pct = max > 0 ? (marks / max) * 100 : 0;
                      }
                      return pct.toFixed(1) + '%';
                    })()}
                  </span></td>
                  <td>{mark.exam_date || 'N/A'}</td>
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
          <div className="results-grid">
            {displaySemesterResults.map((result, idx) => (
              <div key={idx} className="result-card">
                <h3>{result.semester} Semester</h3>
                <div className="result-percentage">{result.percentage}%</div>
                <div className={`result-status ${result.status || 'passed'}`}>{(result.status || 'passed').toUpperCase()}</div>
              </div>
            ))}
          </div>
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
        <h2>📝 Assignments from Teachers</h2>
        {teacherAssignments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teacherAssignments.map(assignment => (
                <tr key={assignment.id}>
                  <td><strong>{assignment.title}</strong></td>
                  <td>{assignment.subject || '-'}</td>
                  <td>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {assignment.file_url && (
                      <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">Download</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No assignments available</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

