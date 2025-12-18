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
  const [assignmentsWithCounts, setAssignmentsWithCounts] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState(null);
  const [attendanceGraph, setAttendanceGraph] = useState(null);
  const [teacherBranch, setTeacherBranch] = useState(null); // Store teacher's branch info
  const [selectedSemester, setSelectedSemester] = useState('');
  const [messageTo, setMessageTo] = useState({ student_id: '', message: '', subject: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', recipient_type: 'student' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', subject: '', due_date: '', file: null });
  const [attendanceForm, setAttendanceForm] = useState({ student_id: '', date: new Date().toISOString().split('T')[0], status: 'present', remarks: '' });
  const [marksForm, setMarksForm] = useState({ student_id: '', semester: '', subject: '', marks_obtained: '', max_marks: 100, exam_type: 'Exam' });
  const [bulkAttendance, setBulkAttendance] = useState([]); // Array of { student_id, date, status }
  const [bulkMarks, setBulkMarks] = useState([]); // Array of { student_id, semester, subject, marks_obtained, max_marks, exam_type }
  const [notices, setNotices] = useState([]);
  const [subjects, setSubjects] = useState([]); // Subjects list for dropdown
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadAssignments();
    loadAssignmentsWithCounts();
    loadAttendanceGraph();
    loadNotices();
  }, [selectedSemester]); // branch locked to teacher; filter: semester only

  useEffect(() => {
    if (marksForm.semester) {
      loadSubjects(marksForm.semester);
    } else {
      setSubjects([]);
    }
  }, [marksForm.semester]);

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams();
      // Removed branch filter - teacher can only see their own branch
      if (selectedSemester) params.append('semester', selectedSemester);

      const response = await fetch(`${api.teacher.students}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
        // Store teacher's branch info from API response
        if (data.teacher_branch) {
          setTeacherBranch(data.teacher_branch);
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const params = new URLSearchParams();
      // Removed branch filter - teacher can only see their own branch
      if (selectedSemester) params.append('semester', selectedSemester);

      const response = await fetch(`${api.teacher.assignments}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAssignments(data.data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadAssignmentsWithCounts = async () => {
    try {
      const response = await fetch(api.teacher.assignmentsWithCounts, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAssignmentsWithCounts(data.data || []);
    } catch (error) {
      console.error('Error loading assignments with counts:', error);
    }
  };

  const loadAssignmentSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`${api.teacher.assignmentSubmissions}?assignment_id=${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAssignmentSubmissions(data.data);
        setSelectedAssignment(assignmentId);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Failed to load submissions');
    }
  };

  const loadAttendanceGraph = async () => {
    try {
      const params = new URLSearchParams();
      // Removed branch filter - teacher can only see their own branch
      if (selectedSemester) params.append('semester', selectedSemester);

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

  const loadSubjects = async (semester) => {
    try {
      // Get teacher's branch code from stored branch info or user object
      const branchCode = teacherBranch?.code || user?.branch_code || '';
      let url = `${api.subjects.getBySemester(semester)}`;
      if (branchCode) {
        url += `?branch_code=${branchCode}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data || []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      setSubjects([]);
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
          {teacherBranch && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <strong>📍 Your Branch:</strong> {teacherBranch.name} ({teacherBranch.code})
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
          </div>
        </div>
        <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          📍 You can only view and manage students from your assigned branch
        </p>
      </div>

      {/* Student List */}
      <div className="dashboard-card">
        <h2>Student List</h2>
        {students.length > 0 ? (
          <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <table className="data-table" style={{ margin: 0 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Semester</th>
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
                    <td>{student.semester}</td>
                    <td>{student.section}</td>
                    <td>{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* My Created Assignments */}
      <div className="dashboard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>📋 My Created Assignments</h2>
          <span style={{ 
            padding: '0.5rem 1rem', 
            background: '#3b82f6', 
            color: 'white', 
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            Total: {assignmentsWithCounts.length}
          </span>
        </div>
        
        {assignmentsWithCounts.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {assignmentsWithCounts.map((assignment) => {
              const submittedCount = assignment.submitted_count || 0;
              const totalStudents = assignment.total_students || 0;
              const pendingCount = totalStudents - submittedCount;
              const submissionPercentage = totalStudents > 0 ? ((submittedCount / totalStudents) * 100).toFixed(0) : 0;
              
              return (
                <div key={assignment.id} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.25rem' }}>
                        {assignment.title}
                      </h3>
                      {assignment.description && (
                        <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
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
                            background: '#fef3c7', 
                            color: '#92400e',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            📅 Due: {new Date(assignment.due_date).toLocaleDateString()}
                            {new Date(assignment.due_date) < new Date() && (
                              <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>⚠️ Overdue</span>
                            )}
                          </span>
                        )}
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: '#f3f4f6', 
                          color: '#6b7280',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}>
                          📆 Created: {new Date(assignment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {assignment.file_url && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(`${api.baseUrl}${assignment.file_url}`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!response.ok) throw new Error('Failed to download');
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = assignment.file_url.split('/').pop();
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                          } catch (error) {
                            alert('Failed to download file');
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.875rem'
                        }}
                      >
                        📥 Download File
                      </button>
                    )}
                  </div>
                  
                  {/* Statistics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem',
                    marginTop: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                        {totalStudents}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Total Students
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                        {submittedCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Submitted ✅
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                        {pendingCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Pending ⏳
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {submissionPercentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Submission Rate
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: '#e5e7eb', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${submissionPercentage}%`, 
                        height: '100%', 
                        background: submittedCount === totalStudents ? '#10b981' : '#3b82f6',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => loadAssignmentSubmissions(assignment.id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      👁️ View All Submissions ({submittedCount}/{totalStudents})
                    </button>
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
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No assignments created yet</p>
            <p style={{ fontSize: '0.875rem' }}>Create your first assignment using the form above</p>
          </div>
        )}
      </div>

      {/* Assignment Submissions Modal */}
      {selectedAssignment && assignmentSubmissions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            width: '800px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Submissions: {assignmentSubmissions.assignment.title}</h2>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setAssignmentSubmissions(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            {/* Assignment Details */}
            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f3f4f6', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Assignment Details</h3>
              {assignmentSubmissions.assignment.description && (
                <p style={{ margin: '0 0 0.75rem 0', color: '#6b7280', lineHeight: '1.5' }}>
                  <strong>Description:</strong> {assignmentSubmissions.assignment.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {assignmentSubmissions.assignment.subject && (
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    background: '#eff6ff', 
                    color: '#3b82f6',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    📚 {assignmentSubmissions.assignment.subject}
                  </span>
                )}
                {assignmentSubmissions.assignment.due_date && (
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    background: '#fef3c7', 
                    color: '#92400e',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    📅 Due: {new Date(assignmentSubmissions.assignment.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                    {assignmentSubmissions.total_students}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Total Students</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {assignmentSubmissions.submitted_count}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Submitted ✅</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {assignmentSubmissions.pending_count}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Pending ⏳</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {assignmentSubmissions.total_students > 0 
                      ? ((assignmentSubmissions.submitted_count / assignmentSubmissions.total_students) * 100).toFixed(0) 
                      : 0}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Submission Rate</div>
                </div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignmentSubmissions.submissions.map((submission) => (
                  <tr key={submission.student_id}>
                    <td>{submission.roll_no}</td>
                    <td>{submission.student_name}</td>
                    <td>{submission.year}</td>
                    <td>
                      {submission.is_submitted ? (
                        <span style={{ color: '#10b981', fontWeight: '500' }}>✅ Submitted</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: '500' }}>⏳ Pending</span>
                      )}
                    </td>
                    <td>{submission.submission_date ? new Date(submission.submission_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <input
                        type="number"
                        placeholder="Marks"
                        defaultValue={submission.marks || ''}
                        id={`submission-marks-${submission.student_id}`}
                        style={{ width: '80px', padding: '0.25rem' }}
                      />
                    </td>
                    <td>
                      {submission.is_submitted && submission.file_url && (
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${api.baseUrl}${submission.file_url}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (!response.ok) throw new Error('Failed to download');
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = submission.file_url.split('/').pop();
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                            } catch (error) {
                              alert('Failed to download file');
                            }
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          📥 Download
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const marks = document.getElementById(`submission-marks-${submission.student_id}`).value;
                          const feedback = document.getElementById(`submission-feedback-${submission.student_id}`)?.value || '';
                          // Update submission marks/feedback
                          try {
                            const response = await fetch(api.teacher.updateAssignment, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                assignment_id: selectedAssignment,
                                student_id: submission.student_id,
                                marks: marks ? parseInt(marks) : null,
                                feedback: feedback
                              })
                            });
                            const data = await response.json();
                            if (data.success) {
                              alert('Marks updated!');
                              loadAssignmentSubmissions(selectedAssignment);
                            }
                          } catch (error) {
                            alert('Failed to update marks');
                          }
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check Assignments (Old - for student-submitted assignments) */}
      <div className="dashboard-card">
        <h2>Check Student-Submitted Assignments</h2>
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
          <select
            value={marksForm.semester}
            onChange={(e) => setMarksForm({ ...marksForm, semester: e.target.value, subject: '' })}
            required
          >
            <option value="">Select Semester</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
          </select>
          {marksForm.semester && subjects.length > 0 ? (
            <select
              value={marksForm.subject}
              onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.subject_name}>
                  {sub.subject_code} - {sub.subject_name}
                </option>
              ))}
            </select>
          ) : marksForm.semester ? (
            <input
              type="text"
              placeholder="Subject Name (or type manually)"
              value={marksForm.subject}
              onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })}
              required
            />
          ) : (
            <input
              type="text"
              placeholder="Select Semester First"
              disabled
            />
          )}
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

