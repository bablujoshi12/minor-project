import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../config/api';
import authService from '../services/authService';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = authService.getToken();
  
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceGraph, setAttendanceGraph] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [messageTo, setMessageTo] = useState({ student_id: '', message: '', subject: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', recipient_type: 'student' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', subject: '', due_date: '', file: null });
  const [attendanceForm, setAttendanceForm] = useState({ student_id: '', date: new Date().toISOString().split('T')[0], status: 'present', remarks: '' });
  const [marksForm, setMarksForm] = useState({ student_id: '', semester: '', subject: '', marks_obtained: '', max_marks: 100, exam_type: 'Exam' });
  const [bulkAttendance, setBulkAttendance] = useState([]); // Array of { student_id, date, status }
  const [bulkMarks, setBulkMarks] = useState([]); // Array of { student_id, semester, subject, marks_obtained, max_marks, exam_type }
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadAssignments();
    loadAttendanceGraph();
    loadNotices();
  }, [selectedBranch, selectedYear]);

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`${api.teacher.students}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`${api.teacher.assignments}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAssignments(data.data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadAttendanceGraph = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedYear) params.append('year', selectedYear);

      const response = await fetch(`${api.teacher.attendanceGraph}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAttendanceGraph(data.data);
    } catch (error) {
      console.error('Error loading attendance graph:', error);
    }
  };

  const updateAssignment = async (assignmentId, marks, feedback, status) => {
    try {
      const response = await fetch(api.teacher.updateAssignment, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignment_id: assignmentId, marks, feedback, status })
      });

      const data = await response.json();
      if (data.success) {
        alert('Assignment updated!');
        loadAssignments();
      }
    } catch (error) {
      alert('Error updating assignment');
    }
  };

  const loadNotices = async () => {
    try {
      const response = await fetch(api.teacher.notices, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setNotices(data.data || []);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const sendNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.message) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.teacher.sendNotice, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noticeForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Notice sent successfully!');
        setNoticeForm({ title: '', message: '', recipient_type: 'student' });
        loadNotices();
      } else {
        alert(data.message || 'Failed to send notice');
      }
    } catch (error) {
      alert('Error sending notice');
    } finally {
      setLoading(false);
    }
  };

  const sendAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title) {
      alert('Please enter assignment title');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      formData.append('subject', assignmentForm.subject);
      formData.append('due_date', assignmentForm.due_date);
      if (assignmentForm.file) {
        formData.append('file', assignmentForm.file);
      }

      const response = await fetch(api.teacher.assignments, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert('Assignment sent successfully!');
        setAssignmentForm({ title: '', description: '', subject: '', due_date: '', file: null });
        loadAssignments();
      } else {
        alert(data.message || 'Failed to send assignment');
      }
    } catch (error) {
      alert('Error sending assignment');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      if (!messageTo.student_id || !messageTo.message) {
        alert('Please select student and enter message');
        return;
      }

      // Get student user_id
      const student = students.find(s => s.id === parseInt(messageTo.student_id));
      if (!student) {
        alert('Student not found');
        return;
      }

      const response = await fetch(api.teacher.sendMessage, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_id: student.id,
          to_role: 'student',
          subject: messageTo.subject,
          message: messageTo.message
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Message sent!');
        setMessageTo({ student_id: '', message: '', subject: '' });
      }
    } catch (error) {
      alert('Error sending message');
    }
  };

  const insertAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceForm.student_id || !attendanceForm.date || !attendanceForm.status) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.teacher.insertAttendance, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attendanceForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Attendance recorded successfully!');
        setAttendanceForm({ student_id: '', date: new Date().toISOString().split('T')[0], status: 'present', remarks: '' });
        loadAttendanceGraph();
      } else {
        alert(data.message || 'Failed to record attendance');
      }
    } catch (error) {
      alert('Error recording attendance');
    } finally {
      setLoading(false);
    }
  };

  const insertBulkAttendance = async () => {
    if (bulkAttendance.length === 0) {
      alert('Please select students and mark attendance');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.teacher.insertAttendance, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ students: bulkAttendance })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Bulk attendance recorded successfully!');
        setBulkAttendance([]);
        loadAttendanceGraph();
      } else {
        alert(data.message || 'Failed to record attendance');
      }
    } catch (error) {
      alert('Error recording attendance');
    } finally {
      setLoading(false);
    }
  };

  const insertMarks = async (e) => {
    e.preventDefault();
    if (!marksForm.student_id || !marksForm.semester || !marksForm.subject || marksForm.marks_obtained === '') {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.teacher.insertMarks, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(marksForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Marks recorded successfully!');
        setMarksForm({ student_id: '', semester: '', subject: '', marks_obtained: '', max_marks: 100, exam_type: 'Exam' });
      } else {
        alert(data.message || 'Failed to record marks');
      }
    } catch (error) {
      alert('Error recording marks');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/');
  };

  // Attendance Graph Data
  const attendanceChartData = attendanceGraph ? {
    labels: attendanceGraph.dailyData?.map(d => d.date) || [],
    datasets: [{
      label: 'Present Students',
      data: attendanceGraph.dailyData?.map(d => d.present_students) || [],
      backgroundColor: 'rgba(102, 126, 234, 0.6)'
    }]
  } : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>👨‍🏫 Teacher Dashboard</h1>
          <p>Welcome, <strong>{user?.name || 'Teacher'}</strong>!</p>
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

      {/* Filters */}
      <div className="dashboard-card">
        <h2>Filters</h2>
        <div className="filters">
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            <option value="">All Years (Current Branch)</option>
            <option value="IT">IT</option>
            <option value="CIVIL">Civil</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="MECHANICAL">Mechanical</option>
            <option value="PHARMACY">Pharmacy</option>
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
          </select>
        </div>
        <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          📍 Showing students from your branch only
        </p>
      </div>

      {/* Student List */}
      <div className="dashboard-card">
        <h2>Student List</h2>
        {students.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Section</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.roll_no}</td>
                  <td>{student.name}</td>
                  <td>{student.branch}</td>
                  <td>{student.year}</td>
                  <td>{student.section}</td>
                  <td>{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students found</p>
        )}
      </div>

      {/* Attendance Graph */}
      <div className="dashboard-card">
        <h2>Attendance Graph</h2>
        {attendanceGraph && (
          <>
            <div className="attendance-stats">
              <div className="stat-box">
                <div className="stat-value">{attendanceGraph.totalStudents || 0}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{attendanceGraph.presentStudents || 0}</div>
                <div className="stat-label">Present Today</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{attendanceGraph.absentStudents || 0}</div>
                <div className="stat-label">Absent Today</div>
              </div>
              <div className="stat-box highlight">
                <div className="stat-value">{attendanceGraph.presentPercentage || 0}%</div>
                <div className="stat-label">Attendance %</div>
              </div>
            </div>
            {attendanceChartData && (
              <div className="chart-container">
                <Bar data={attendanceChartData} options={{
                  responsive: true,
                  plugins: { legend: { display: true }, title: { display: true, text: 'Daily Attendance - Students Present/Absent' } }
                }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Check Assignments */}
      <div className="dashboard-card">
        <h2>Check Assignments</h2>
        {assignments.length > 0 ? (
          <div className="assignments-list">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="assignment-item">
                <div className="assignment-header">
                  <h4>{assignment.title}</h4>
                  <span className={`status-badge ${assignment.status}`}>{assignment.status}</span>
                </div>
                <p><strong>Student:</strong> {assignment.student_name} ({assignment.roll_no})</p>
                <p><strong>Subject:</strong> {assignment.subject}</p>
                <p><strong>Submitted:</strong> {assignment.submission_date}</p>
                {/* Prefer student upload file_path, fallback to teacher's file_url */}
                {(() => {
                  const fileLink = assignment.file_path || assignment.file_url;
                  return fileLink ? (
                    <a href={fileLink} target="_blank" rel="noopener noreferrer">
                      Download File
                    </a>
                  ) : null;
                })()}
                <div className="assignment-actions">
                  <input type="number" placeholder="Marks" id={`marks-${assignment.id}`} />
                  <textarea placeholder="Feedback" id={`feedback-${assignment.id}`} />
                  <button onClick={() => updateAssignment(
                    assignment.id,
                    document.getElementById(`marks-${assignment.id}`).value,
                    document.getElementById(`feedback-${assignment.id}`).value,
                    'checked'
                  )}>Update</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No assignments found</p>
        )}
      </div>

      {/* Send Notice */}
      <div className="dashboard-card">
        <h2>📢 Send Notice to Students/Parents</h2>
        <form onSubmit={sendNotice} className="message-form">
          <input
            type="text"
            placeholder="Notice Title"
            value={noticeForm.title}
            onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
            required
          />
          <select
            value={noticeForm.recipient_type}
            onChange={(e) => setNoticeForm({ ...noticeForm, recipient_type: e.target.value })}
          >
            <option value="student">All Students (Branch)</option>
            <option value="parent">All Parents (Branch)</option>
            <option value="all">All Students & Parents</option>
          </select>
          <textarea
            placeholder="Notice Message"
            value={noticeForm.message}
            onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
            rows="4"
            required
          />
          <button type="submit" disabled={loading}>Send Notice</button>
        </form>
      </div>

      {/* Send Assignment */}
      <div className="dashboard-card">
        <h2>📝 Send Assignment</h2>
        <form onSubmit={sendAssignment} className="message-form">
          <input
            type="text"
            placeholder="Assignment Title"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={assignmentForm.subject}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={assignmentForm.description}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
            rows="3"
          />
          <input
            type="datetime-local"
            placeholder="Due Date"
            value={assignmentForm.due_date}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
          />
          <input
            type="file"
            onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
          />
          <button type="submit" disabled={loading}>Send Assignment</button>
        </form>
      </div>

      {/* Send Message */}
      <div className="dashboard-card">
        <h2>💬 Send Message to Student</h2>
        <div className="message-form">
          <select value={messageTo.student_id} onChange={(e) => setMessageTo({ ...messageTo, student_id: e.target.value })}>
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>
            ))}
          </select>
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
          <button onClick={sendMessage}>Send Message</button>
        </div>
      </div>

      {/* Insert Attendance - Single */}
      <div className="dashboard-card">
        <h2>📅 Record Attendance (Single)</h2>
        <form onSubmit={insertAttendance} className="message-form">
          <select
            value={attendanceForm.student_id}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, student_id: e.target.value })}
            required
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>
            ))}
          </select>
          <input
            type="date"
            value={attendanceForm.date}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
            required
          />
          <select
            value={attendanceForm.status}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
            required
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
          </select>
          <textarea
            placeholder="Remarks (optional)"
            value={attendanceForm.remarks}
            onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
            rows="2"
          />
          <button type="submit" disabled={loading}>Record Attendance</button>
        </form>
      </div>

      {/* Insert Attendance - Bulk */}
      <div className="dashboard-card">
        <h2>📅 Record Attendance (Bulk - Today)</h2>
        <div className="message-form">
          <p>Select students and mark their attendance for today ({new Date().toISOString().split('T')[0]})</p>
          {students.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '8px' }}>
              {students.map(s => {
                const existing = bulkAttendance.find(a => a.student_id === s.id);
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ flex: 1 }}>{s.name} ({s.roll_no})</span>
                    <select
                      value={existing?.status || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const updated = bulkAttendance.filter(a => a.student_id !== s.id);
                          updated.push({
                            student_id: s.id,
                            date: new Date().toISOString().split('T')[0],
                            status: e.target.value
                          });
                          setBulkAttendance(updated);
                        } else {
                          setBulkAttendance(bulkAttendance.filter(a => a.student_id !== s.id));
                        }
                      }}
                      style={{ width: '150px' }}
                    >
                      <option value="">Not Selected</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="half_day">Half Day</option>
                    </select>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No students available. Please select branch/year filter.</p>
          )}
          <button onClick={insertBulkAttendance} disabled={loading || bulkAttendance.length === 0} style={{ marginTop: '1rem' }}>
            Record Bulk Attendance ({bulkAttendance.length} students)
          </button>
        </div>
      </div>

      {/* Insert Marks */}
      <div className="dashboard-card">
        <h2>📝 Record Marks</h2>
        <form onSubmit={insertMarks} className="message-form">
          <select
            value={marksForm.student_id}
            onChange={(e) => setMarksForm({ ...marksForm, student_id: e.target.value })}
            required
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Semester (e.g., 3, 4, 5)"
            value={marksForm.semester}
            onChange={(e) => setMarksForm({ ...marksForm, semester: e.target.value })}
            required
            min="1"
            max="8"
          />
          <input
            type="text"
            placeholder="Subject Name"
            value={marksForm.subject}
            onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Marks Obtained"
            value={marksForm.marks_obtained}
            onChange={(e) => setMarksForm({ ...marksForm, marks_obtained: e.target.value })}
            required
            min="0"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Max Marks"
            value={marksForm.max_marks}
            onChange={(e) => setMarksForm({ ...marksForm, max_marks: e.target.value })}
            min="1"
            step="0.01"
          />
          <select
            value={marksForm.exam_type}
            onChange={(e) => setMarksForm({ ...marksForm, exam_type: e.target.value })}
          >
            <option value="Exam">Exam</option>
            <option value="Mid-Term">Mid-Term</option>
            <option value="Unit Test">Unit Test</option>
            <option value="Practical">Practical</option>
            <option value="Assignment">Assignment</option>
            <option value="Quiz">Quiz</option>
          </select>
          <button type="submit" disabled={loading}>Record Marks</button>
        </form>
      </div>

      {/* Notices Sent */}
      <div className="dashboard-card">
        <h2>📢 Notices Sent</h2>
        {notices.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.map(notice => (
              <div key={notice.id} style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#f9fafb'
              }}>
                <h3>{notice.title}</h3>
                <p>{notice.message}</p>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  To: {notice.recipient_type} | {new Date(notice.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No notices sent yet</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

