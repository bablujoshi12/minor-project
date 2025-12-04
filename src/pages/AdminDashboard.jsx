import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../config/api';
import authService from '../services/authService';
import './Dashboard.css';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = authService.getToken();
  
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [statistics, setStatistics] = useState({ teachers: 0, students: 0, parents: 0, notices: 0, branches: 0 });
  const [notices, setNotices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Notes Board states
  const [notes, setNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: '', message: '', priority: 'normal' });
  const [editingNote, setEditingNote] = useState(null);
  
  // NSS/NCC states
  const [nssStudents, setNssStudents] = useState([]);
  const [nccStudents, setNccStudents] = useState([]);
  const [nssNccActiveTab, setNssNccActiveTab] = useState('nss'); // 'nss' or 'ncc'
  const [showNssNccModal, setShowNssNccModal] = useState(false);
  const [editingNssNcc, setEditingNssNcc] = useState(null);
  const [nssNccForm, setNssNccForm] = useState({
    registration_id: '',
    name: '',
    location: '',
    father_name: '',
    mother_name: '',
    program: '',
    category: 'GEN',
    dob: '',
    gender: 'M',
    email: '',
    phone: ''
  });
  
  // Filters
  const [studentFilters, setStudentFilters] = useState({ branch: '', year: '', search: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', recipient_type: 'all', branch_id: '', priority: 'medium' });
  
  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ type: 'student', name: '', email: '', password: '', roll_no: '', branch: '', year: '1', phone: '', parent_email: '', parent_name: '' });

  useEffect(() => {
    loadDashboardData();
    loadBranches();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudents();
    } else if (activeTab === 'teachers') {
      loadTeachers();
    } else if (activeTab === 'parents') {
      loadParents();
    } else if (activeTab === 'notices') {
      loadNotices();
    } else if (activeTab === 'notesBoard') {
      loadNotes();
    } else if (activeTab === 'nssncc') {
      loadNSSNCCData();
    }
  }, [activeTab, studentFilters]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      const [statsRes, teachersRes, studentsRes] = await Promise.all([
        fetch(api.admin.statistics, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(api.admin.teachers, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(api.admin.students, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      const teachersData = await teachersRes.json();
      const studentsData = await studentsRes.json();
      
      console.log('📥 Dashboard responses:', { stats: statsData, teachers: teachersData, students: studentsData });
      
      if (statsData.success) {
        const stats = statsData.data;
        stats.branches = branches.length;
        setStatistics(stats);
      }
      if (teachersData.success) {
        setTeachers(teachersData.data || []);
        console.log(`✅ Loaded ${teachersData.data?.length || 0} teachers in dashboard`);
      }
      if (studentsData.success) {
        setStudents(studentsData.data || []);
        console.log(`✅ Loaded ${studentsData.data?.length || 0} students in dashboard`);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      console.log('👨‍🏫 Loading teachers...');
      const response = await fetch(api.admin.teachers, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📥 Teachers API response:', data);
      if (data.success) {
        setTeachers(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} teachers`);
      } else {
        console.error('❌ Failed to load teachers:', data.message);
        setTeachers([]);
      }
    } catch (error) {
      console.error('❌ Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (studentFilters.branch) params.append('branch', studentFilters.branch);
      if (studentFilters.year) params.append('year', studentFilters.year);
      if (studentFilters.search) params.append('search', studentFilters.search);

      const response = await fetch(`${api.admin.students}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📥 Students API response:', data);
      if (data.success) {
        setStudents(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} students`);
      } else {
        console.error('❌ Failed to load students:', data.message);
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadParents = async () => {
    try {
      setLoading(true);
      const response = await fetch(api.admin.parents, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📥 Parents API response:', data);
      if (data.success) {
        setParents(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} parents`);
      } else {
        console.error('❌ Failed to load parents:', data.message);
        setParents([]);
      }
    } catch (error) {
      console.error('❌ Error loading parents:', error);
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await fetch(api.admin.notices, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setNotices(data.data);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await fetch(api.admin.branches, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBranches(data.data);
        // Update statistics with branches count
        setStatistics(prev => ({ ...prev, branches: data.data.length }));
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await fetch(api.notesBoard.all, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setNotes(data.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // NSS/NCC Functions
  const loadNSSNCCData = async () => {
    try {
      setLoading(true);
      const [nssRes, nccRes] = await Promise.all([
        fetch(api.nss.getAll),
        fetch(api.ncc.getAll)
      ]);
      const nssData = await nssRes.json();
      const nccData = await nccRes.json();
      if (nssData.success) setNssStudents(nssData.data || []);
      if (nccData.success) setNccStudents(nccData.data || []);
    } catch (error) {
      console.error('Error loading NSS/NCC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNssNccModal = (student = null, type = null) => {
    if (student) {
      setEditingNssNcc({ ...student, type: type || nssNccActiveTab });
      setNssNccForm({
        registration_id: student.registration_id || '',
        name: student.name || '',
        location: student.location || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        program: student.program || '',
        category: student.category || 'GEN',
        dob: student.dob ? student.dob.split('T')[0] : '',
        gender: student.gender || 'M',
        email: student.email || '',
        phone: student.phone || ''
      });
    } else {
      setEditingNssNcc(null);
      setNssNccForm({
        registration_id: '',
        name: '',
        location: '',
        father_name: '',
        mother_name: '',
        program: '',
        category: 'GEN',
        dob: '',
        gender: 'M',
        email: '',
        phone: ''
      });
    }
    setShowNssNccModal(true);
  };

  const handleSaveNssNcc = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const type = editingNssNcc?.type || nssNccActiveTab;
      const apiEndpoint = editingNssNcc 
        ? (type === 'nss' ? api.nss.update(editingNssNcc.id) : api.ncc.update(editingNssNcc.id))
        : (type === 'nss' ? api.nss.add : api.ncc.add);
      
      const method = editingNssNcc ? 'PUT' : 'POST';
      
      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nssNccForm)
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Saved successfully!');
        setShowNssNccModal(false);
        loadNSSNCCData();
      } else {
        alert(data.message || 'Error saving');
      }
    } catch (error) {
      console.error('Error saving NSS/NCC:', error);
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNssNcc = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      setLoading(true);
      const apiEndpoint = type === 'nss' ? api.nss.delete(id) : api.ncc.delete(id);
      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Deleted successfully!');
        loadNSSNCCData();
      } else {
        alert(data.message || 'Error deleting');
      }
    } catch (error) {
      console.error('Error deleting NSS/NCC:', error);
      alert('Error deleting data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.message) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.notesBoard.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Note posted successfully!');
        setNoteForm({ title: '', message: '', priority: 'normal' });
        loadNotes();
      } else {
        alert(data.message || 'Failed to post note');
      }
    } catch (error) {
      alert('Error posting note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (note) => {
    try {
      setLoading(true);
      const response = await fetch(api.notesBoard.update(note.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: note.title,
          message: note.message,
          priority: note.priority,
          status: note.status
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Note updated successfully!');
        loadNotes();
        setEditingNote(null);
      } else {
        alert(data.message || 'Failed to update note');
      }
    } catch (error) {
      alert('Error updating note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(api.notesBoard.delete(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Note deleted successfully!');
        loadNotes();
      } else {
        alert(data.message || 'Failed to delete note');
      }
    } catch (error) {
      alert('Error deleting note');
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.message) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.admin.sendNotice, {
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
        setNoticeForm({ title: '', message: '', recipient_type: 'all', branch_id: '', priority: 'medium' });
        loadNotices();
        loadDashboardData();
      } else {
        alert(data.message || 'Failed to send notice');
      }
    } catch (error) {
      alert('Error sending notice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(api.admin.deleteUser(type, id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert(`${type} deleted successfully`);
        if (type === 'teacher') loadTeachers();
        else if (type === 'student') loadStudents();
        else if (type === 'parent') loadParents();
        loadDashboardData();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleViewDetails = (user, type) => {
    setSelectedUser({ ...user, type });
    setShowDetailsModal(true);
  };

  const exportToCSV = (data, filename, type) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).map(val => `"${val || ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/');
  };

  // Chart data
  const userDistributionData = {
    labels: ['Teachers', 'Students', 'Parents'],
    datasets: [{
      label: 'Users',
      data: [statistics.teachers, statistics.students, statistics.parents],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const branchDistributionData = branches.length > 0 ? {
    labels: branches.slice(0, 5).map(b => b.name || b.branch_name || 'Unknown'),
    datasets: [{
      label: 'Students per Branch',
      data: branches.slice(0, 5).map((b, idx) => students.filter(s => s.branch_id === b.id || s.branch === b.code).length || Math.floor(Math.random() * 50)),
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'],
      borderWidth: 2
    }]
  } : null;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <h1>👑 Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome back, <strong>{user?.name || 'Admin'}</strong>!</p>
          </div>
          <button onClick={handleLogout} className="logout-btn-admin">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-tabs">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'teachers', label: '👨‍🏫 Teachers', icon: '👨‍🏫' },
          { id: 'students', label: '🎓 Students', icon: '🎓' },
          { id: 'parents', label: '👨‍👩‍👧‍👦 Parents', icon: '👨‍👩‍👧‍👦' },
          { id: 'notices', label: '📢 Notices', icon: '📢' },
          { id: 'notesBoard', label: '📋 Notes Board', icon: '📋' },
          { id: 'nssncc', label: '🟢 NSS/NCC', icon: '🟢' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label.replace(/[^\w\s]/g, '')}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-card-blue">
                <div className="stat-icon">👨‍🏫</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.teachers}</div>
                  <div className="stat-label">Teachers</div>
                </div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="stat-icon">🎓</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.students}</div>
                  <div className="stat-label">Students</div>
                </div>
              </div>
              <div className="stat-card stat-card-orange">
                <div className="stat-icon">👨‍👩‍👧‍👦</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.parents}</div>
                  <div className="stat-label">Parents</div>
                </div>
              </div>
              <div className="stat-card stat-card-purple">
                <div className="stat-icon">📢</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.notices}</div>
                  <div className="stat-label">Notices</div>
                </div>
              </div>
              <div className="stat-card stat-card-pink">
                <div className="stat-icon">🏛️</div>
                <div className="stat-info">
                  <div className="stat-value">{branches.length}</div>
                  <div className="stat-label">Branches</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3>User Distribution</h3>
                <Doughnut data={userDistributionData} options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { position: 'bottom' } }
                }} />
              </div>
              {branchDistributionData && (
                <div className="chart-card">
                  <h3>Students by Branch</h3>
                  <Bar data={branchDistributionData} options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }} />
                </div>
              )}
            </div>

            {/* Send Notice Form */}
            <div className="dashboard-card-modern">
              <h2>📢 Send Notice</h2>
              <form onSubmit={handleSendNotice} className="notice-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Notice Title *"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <textarea
                    placeholder="Notice Message *"
                    value={noticeForm.message}
                    onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-row form-row-inline">
                  <select
                    value={noticeForm.recipient_type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, recipient_type: e.target.value, branch_id: '' })}
                  >
                    <option value="all">All Users</option>
                    <option value="student">All Students</option>
                    <option value="teacher">All Teachers</option>
                    <option value="parent">All Parents</option>
                    <option value="branch">Specific Branch</option>
                  </select>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                </div>
                {noticeForm.recipient_type === 'branch' && (
                  <div className="form-row">
                    <select
                      value={noticeForm.branch_id}
                      onChange={(e) => setNoticeForm({ ...noticeForm, branch_id: e.target.value })}
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : '📢 Send Notice'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="dashboard-card-modern">
            <div className="card-header">
              <h2>👨‍🏫 All Teachers ({teachers.length})</h2>
              <button onClick={() => exportToCSV(teachers, 'teachers', 'teacher')} className="btn-export">
                📥 Export CSV
              </button>
            </div>
            {teachers.length > 0 ? (
              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Branch</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => (
                      <tr key={teacher.id}>
                        <td><strong>{teacher.name}</strong></td>
                        <td>{teacher.email}</td>
                        <td><span className="badge badge-blue">{teacher.branch_name || teacher.branch || '-'}</span></td>
                        <td>{teacher.phone || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleViewDetails(teacher, 'teacher')} className="btn-view">👁️ View</button>
                            <button onClick={() => handleDeleteUser('teacher', teacher.id)} className="btn-delete">🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No teachers found</p>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="dashboard-card-modern">
            <div className="card-header">
              <h2>🎓 All Students ({students.length})</h2>
              <button onClick={() => exportToCSV(students, 'students', 'student')} className="btn-export">
                📥 Export CSV
              </button>
            </div>
            {/* Filters */}
            <div className="filters-bar">
              <input
                type="text"
                placeholder="🔍 Search by name, roll no, email..."
                value={studentFilters.search}
                onChange={(e) => setStudentFilters({ ...studentFilters, search: e.target.value })}
                className="search-input"
              />
              <select
                value={studentFilters.branch}
                onChange={(e) => setStudentFilters({ ...studentFilters, branch: e.target.value })}
                className="filter-select"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.code}>{b.name || b.branch_name}</option>
                ))}
              </select>
              <select
                value={studentFilters.year}
                onChange={(e) => setStudentFilters({ ...studentFilters, year: e.target.value })}
                className="filter-select"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
              </select>
            </div>

            {students.length > 0 ? (
              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Branch</th>
                      <th>Year</th>
                      <th>Email</th>
                      <th>Parent Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td><strong>{student.roll_no}</strong></td>
                        <td>{student.name}</td>
                        <td><span className="badge badge-green">{student.branch || student.branch_name || '-'}</span></td>
                        <td><span className="badge badge-orange">{student.year || '-'}</span></td>
                        <td>{student.email || '-'}</td>
                        <td>{student.parent_email || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleViewDetails(student, 'student')} className="btn-view">👁️ View</button>
                            <button onClick={() => handleDeleteUser('student', student.id)} className="btn-delete">🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No students found</p>
            )}
          </div>
        )}

        {/* Parents Tab */}
        {activeTab === 'parents' && (
          <div className="dashboard-card-modern">
            <div className="card-header">
              <h2>👨‍👩‍👧‍👦 All Parents ({parents.length})</h2>
              <button onClick={() => exportToCSV(parents, 'parents', 'parent')} className="btn-export">
                📥 Export CSV
              </button>
            </div>
            {parents.length > 0 ? (
              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.map(parent => (
                      <tr key={parent.id}>
                        <td><strong>{parent.name}</strong></td>
                        <td>{parent.email}</td>
                        <td>{parent.phone || '-'}</td>
                        <td>{parent.student_name || '-'}</td>
                        <td><span className="badge badge-blue">{parent.roll_no || '-'}</span></td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => handleViewDetails(parent, 'parent')} className="btn-view">👁️ View</button>
                            <button onClick={() => handleDeleteUser('parent', parent.id)} className="btn-delete">🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No parents found</p>
            )}
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="dashboard-card-modern">
            <h2>📢 All Notices ({notices.length})</h2>
            {notices.length > 0 ? (
              <div className="notices-list">
                {notices.map(notice => (
                  <div key={notice.id} className="notice-card" style={{
                    borderLeftColor: notice.priority === 'urgent' ? '#ef4444' :
                                     notice.priority === 'high' ? '#f59e0b' :
                                     notice.priority === 'medium' ? '#3b82f6' : '#6b7280'
                  }}>
                    <div className="notice-header">
                      <h3>{notice.title}</h3>
                      <span className={`priority-badge priority-${notice.priority}`}>
                        {notice.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                    </div>
                    <p className="notice-message">{notice.message}</p>
                    <div className="notice-footer">
                      <span>📤 To: <strong>{notice.recipient_type}</strong></span>
                      <span>👤 By: <strong>{notice.sender_name || 'Admin'}</strong></span>
                      <span>🕐 {new Date(notice.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No notices found</p>
            )}
          </div>
        )}

        {/* Notes Board Tab */}
        {activeTab === 'notesBoard' && (
          <div>
            {/* Create Note Form */}
            <div className="dashboard-card-modern" style={{ marginBottom: '2rem' }}>
              <h2>📋 Create New Note</h2>
              <form onSubmit={handleCreateNote} className="notice-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Note Title *"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <textarea
                    placeholder="Note Message *"
                    value={noteForm.message}
                    onChange={(e) => setNoteForm({ ...noteForm, message: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="form-row">
                  <select
                    value={noteForm.priority}
                    onChange={(e) => setNoteForm({ ...noteForm, priority: e.target.value })}
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Posting...' : '📋 Post Note'}
                </button>
              </form>
            </div>

            {/* All Notes List */}
            <div className="dashboard-card-modern">
              <h2>📋 All Notes ({notes.length})</h2>
              {notes.length > 0 ? (
                <div className="notes-list">
                  {notes.map(note => (
                    <div key={note.id} className="note-card" style={{
                      borderLeftColor: note.priority === 'urgent' ? '#ef4444' :
                                       note.priority === 'high' ? '#f59e0b' :
                                       note.priority === 'normal' ? '#3b82f6' : '#6b7280'
                    }}>
                      <div className="note-header">
                        <h3>{note.title}</h3>
                        <div className="note-actions">
                          <button
                            onClick={() => setEditingNote(editingNote?.id === note.id ? null : note)}
                            className="btn-edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="btn-delete-small"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="note-message">{note.message}</p>
                      <div className="note-footer">
                        <span className={`priority-badge priority-${note.priority}`}>
                          {note.priority?.toUpperCase()}
                        </span>
                        <span className={`status-badge status-${note.status}`}>
                          {note.status?.toUpperCase()}
                        </span>
                        <span>🕐 {new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      {editingNote?.id === note.id && (
                        <div className="edit-note-form">
                          <input
                            type="text"
                            placeholder="Title"
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                          />
                          <textarea
                            placeholder="Message"
                            value={editingNote.message}
                            onChange={(e) => setEditingNote({ ...editingNote, message: e.target.value })}
                            rows={3}
                          />
                          <select
                            value={editingNote.priority}
                            onChange={(e) => setEditingNote({ ...editingNote, priority: e.target.value })}
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          <select
                            value={editingNote.status}
                            onChange={(e) => setEditingNote({ ...editingNote, status: e.target.value })}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                          </select>
                          <div className="edit-form-actions">
                            <button onClick={() => handleUpdateNote(editingNote)} disabled={loading} className="btn-save">
                              💾 Save
                            </button>
                            <button onClick={() => setEditingNote(null)} className="btn-cancel">
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No notes found. Create your first note above!</p>
              )}
            </div>
          </div>
        )}

        {/* NSS/NCC Management Tab */}
        {activeTab === 'nssncc' && (
          <div>
            <div className="dashboard-card-modern" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>🟢 NSS/NCC Student Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className={`btn-secondary ${nssNccActiveTab === 'nss' ? 'active' : ''}`}
                    onClick={() => setNssNccActiveTab('nss')}
                    style={{ padding: '8px 16px' }}
                  >
                    🟢 NSS
                  </button>
                  <button
                    className={`btn-secondary ${nssNccActiveTab === 'ncc' ? 'active' : ''}`}
                    onClick={() => setNssNccActiveTab('ncc')}
                    style={{ padding: '8px 16px' }}
                  >
                    🎖️ NCC
                  </button>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleOpenNssNccModal()}
                style={{ marginBottom: '1rem' }}
              >
                ➕ Add {nssNccActiveTab.toUpperCase()} Student
              </button>

              {/* Student Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Reg. ID</th>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Program</th>
                      <th>Category</th>
                      <th>DOB</th>
                      <th>Gender</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Teacher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(nssNccActiveTab === 'nss' ? nssStudents : nccStudents).length === 0 ? (
                      <tr>
                        <td colSpan="12" className="no-data">No students found. Add your first student!</td>
                      </tr>
                    ) : (
                      (nssNccActiveTab === 'nss' ? nssStudents : nccStudents).map((student, idx) => (
                        <tr key={student.id}>
                          <td>{idx + 1}</td>
                          <td>{student.registration_id}</td>
                          <td><strong>{student.name}</strong></td>
                          <td>{student.location}</td>
                          <td>{student.program}</td>
                          <td>{student.category}</td>
                          <td>{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</td>
                          <td>{student.gender === 'M' ? '👨 M' : student.gender === 'F' ? '👩 F' : 'O'}</td>
                          <td>{student.email || '-'}</td>
                          <td>{student.phone || '-'}</td>
                          <td>{student.teacher_name || (nssNccActiveTab === 'nss' ? 'Sonu Kumar' : 'Vivek Morya')}</td>
                          <td>
                            <button
                              onClick={() => handleOpenNssNccModal(student, nssNccActiveTab)}
                              className="btn-edit-small"
                              style={{ marginRight: '5px' }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteNssNcc(student.id, nssNccActiveTab)}
                              className="btn-delete-small"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* NSS/NCC Student Modal */}
      {showNssNccModal && (
        <div className="modal-overlay" onClick={() => setShowNssNccModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editingNssNcc ? 'Edit' : 'Add'} {nssNccActiveTab.toUpperCase()} Student</h2>
              <button onClick={() => setShowNssNccModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveNssNcc}>
                <div className="form-row">
                  <label>Registration ID *</label>
                  <input
                    type="text"
                    value={nssNccForm.registration_id}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, registration_id: e.target.value })}
                    required
                    placeholder="e.g., UH0707525002"
                  />
                </div>
                <div className="form-row">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={nssNccForm.name}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={nssNccForm.location}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, location: e.target.value })}
                    required
                    placeholder="e.g., Champawat"
                  />
                </div>
                <div className="form-row">
                  <label>Father's Name *</label>
                  <input
                    type="text"
                    value={nssNccForm.father_name}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, father_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Mother's Name *</label>
                  <input
                    type="text"
                    value={nssNccForm.mother_name}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, mother_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Program *</label>
                  <input
                    type="text"
                    value={nssNccForm.program}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, program: e.target.value })}
                    required
                    placeholder="e.g., IT-I, Civil-1"
                  />
                </div>
                <div className="form-row">
                  <label>Category *</label>
                  <select
                    value={nssNccForm.category}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, category: e.target.value })}
                    required
                  >
                    <option value="GEN">GEN</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={nssNccForm.dob}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, dob: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Gender *</label>
                  <select
                    value={nssNccForm.gender}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, gender: e.target.value })}
                    required
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input
                    type="email"
                    value={nssNccForm.email}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, email: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={nssNccForm.phone}
                    onChange={(e) => setNssNccForm({ ...nssNccForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label>Teacher/Coordinator</label>
                  <input
                    type="text"
                    value={nssNccActiveTab === 'nss' ? 'Sonu Kumar' : 'Vivek Morya'}
                    disabled
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-row" style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save'}
                  </button>
                  <button type="button" onClick={() => setShowNssNccModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedUser.type.toUpperCase()} Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              {Object.entries(selectedUser).filter(([key]) => key !== 'type' && key !== 'password').map(([key, value]) => (
                <div key={key} className="detail-row">
                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                  <span>{value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
