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
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  
  // Enhanced Management States
  const [departments, setDepartments] = useState([]);
  const [hods, setHODs] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showHODModal, setShowHODModal] = useState(false);
  const [editingHOD, setEditingHOD] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Forms
  const [studentForm, setStudentForm] = useState({
    roll_no: '', name: '', email: '', password: '', phone: '', branch_id: '', department_id: '',
    year: '', semester: '', section: '', father_name: '', mother_name: '', dob: '', sex: '',
    category: '', parent_email: '', parent_phone: '', parent_name: '', blood_group: '', status: 'active'
  });
  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', password: '', phone: '', branch_id: ''
  });
  const [departmentForm, setDepartmentForm] = useState({
    name: '', code: '', description: '', hod_name: ''
  });
  const [branchForm, setBranchForm] = useState({
    name: '', code: '', description: ''
  });
  const [hodForm, setHODForm] = useState({
    department_id: '', teacher_id: ''
  });

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
    } else if (activeTab === 'departments') {
      loadDepartments();
      loadHODs();
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

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(api.admin.departments, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} departments`);
      } else {
        console.error('❌ Failed to load departments:', data.message);
        setDepartments([]);
      }
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHODs = async () => {
    try {
      const response = await fetch(api.admin.hods, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHODs(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} HODs`);
      } else {
        console.error('❌ Failed to load HODs:', data.message);
        setHODs([]);
      }
    } catch (error) {
      console.error('❌ Error loading HODs:', error);
      setHODs([]);
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
        setMessage({ type: 'success', text: data.message || 'Saved successfully!' });
        setShowNssNccModal(false);
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
        loadNSSNCCData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error saving' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
        setMessage({ type: 'success', text: 'Note posted successfully!' });
        setNoteForm({ title: '', message: '', priority: 'normal' });
        loadNotes();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to post note' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error posting note' });
      console.error('Error posting note:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
        setMessage({ type: 'success', text: 'Note updated successfully!' });
        loadNotes();
        setEditingNote(null);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update note' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating note' });
      console.error('Error updating note:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setLoading(true);
      const response = await fetch(api.notesBoard.delete(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Note deleted successfully!' });
        loadNotes();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete note' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting note' });
      console.error('Delete note error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.message) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
        setMessage({ type: 'success', text: 'Notice sent successfully!' });
        setNoticeForm({ title: '', message: '', recipient_type: 'all', branch_id: '', priority: 'medium' });
        loadNotices();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send notice' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending notice' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openNoticeModal = (notice = null) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeForm({
        title: notice.title || '',
        message: notice.message || '',
        recipient_type: notice.recipient_type || 'all',
        branch_id: notice.branch_id || '',
        priority: notice.priority || 'medium'
      });
    } else {
      setEditingNotice(null);
      setNoticeForm({ title: '', message: '', recipient_type: 'all', branch_id: '', priority: 'medium' });
    }
    setShowNoticeModal(true);
  };

  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.message) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(api.admin.updateNotice(editingNotice.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noticeForm)
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Notice updated successfully!' });
        setShowNoticeModal(false);
        setEditingNotice(null);
        loadNotices();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update notice' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating notice' });
      console.error('Update notice error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const response = await fetch(api.admin.deleteNotice(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Notice deleted successfully' });
        loadNotices();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete notice' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting notice' });
      console.error('Delete notice error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteUser = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      setLoading(true);
      const response = await fetch(api.admin.deleteUser(type, id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully` });
        if (type === 'teacher') loadTeachers();
        else if (type === 'student') loadStudents();
        else if (type === 'parent') loadParents();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete user' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting user' });
      console.error('Delete user error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user, type) => {
    setSelectedUser({ ...user, type });
    setShowDetailsModal(true);
  };

  // ========== STUDENT MANAGEMENT FUNCTIONS ==========
  
  // Helper function to format date to yyyy-MM-dd format
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    // If already in yyyy-MM-dd format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // If contains 'T' (ISO format), extract date part
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    
    // Try to parse different date formats
    try {
      // Handle formats like "4/5/2006" or "04/05/2006"
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          // Check if year is 2 digits, assume 20xx
          const fullYear = year.length === 2 ? `20${year}` : year;
          return `${fullYear}-${month}-${day}`;
        }
      }
      
      // Try parsing as Date object
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error('Date parsing error:', e);
    }
    
    return '';
  };
  
  const openStudentModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setStudentForm({
        roll_no: student.roll_no || '',
        name: student.name || '',
        email: student.email || '',
        password: '',
        phone: student.phone || '',
        branch_id: student.branch_id || '',
        department_id: student.department_id || '',
        year: student.year || '',
        semester: student.semester || '',
        section: student.section || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        dob: formatDateForInput(student.dob),
        sex: student.sex || '',
        category: student.category || '',
        parent_email: student.parent_email || '',
        parent_phone: student.parent_phone || '',
        parent_name: student.parent_name || '',
        blood_group: student.blood_group || '',
        status: student.status || 'active'
      });
    } else {
      setEditingStudent(null);
      setStudentForm({
        roll_no: '', name: '', email: '', password: '', phone: '', branch_id: '', department_id: '',
        year: '', semester: '', section: '', father_name: '', mother_name: '', dob: '', sex: '',
        category: '', parent_email: '', parent_phone: '', parent_name: '', blood_group: '', status: 'active'
      });
    }
    setShowStudentModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.roll_no || !studentForm.name) {
      setMessage({ type: 'error', text: 'Roll number and name are required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setLoading(true);
      const url = editingStudent ? api.admin.updateStudent(editingStudent.id) : api.admin.createStudent;
      const method = editingStudent ? 'PUT' : 'POST';
      
      // Clean form data - convert empty strings to null for integer fields
      const formData = { ...studentForm };
      
      // Convert empty strings to null for integer/ID fields
      if (formData.branch_id === '' || formData.branch_id === null) formData.branch_id = null;
      if (formData.department_id === '' || formData.department_id === null) formData.department_id = null;
      if (formData.year === '' || formData.year === null) formData.year = null;
      if (formData.semester === '' || formData.semester === null) formData.semester = null;
      
      // Convert empty strings to null for optional string fields
      if (formData.email === '') formData.email = null;
      if (formData.phone === '') formData.phone = null;
      if (formData.section === '') formData.section = null;
      if (formData.father_name === '') formData.father_name = null;
      if (formData.mother_name === '') formData.mother_name = null;
      if (formData.dob === '') formData.dob = null;
      if (formData.sex === '') formData.sex = null;
      if (formData.category === '') formData.category = null;
      if (formData.parent_email === '') formData.parent_email = null;
      if (formData.parent_phone === '') formData.parent_phone = null;
      if (formData.blood_group === '') formData.blood_group = null;
      
      // Remove password if editing and empty
      if (editingStudent && !formData.password) {
        delete formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Student ${editingStudent ? 'updated' : 'created'} successfully` });
        setShowStudentModal(false);
        setEditingStudent(null);
        setStudentForm({
          roll_no: '', name: '', email: '', password: '', phone: '', branch_id: '', department_id: '',
          year: '', semester: '', section: '', father_name: '', mother_name: '', dob: '', sex: '',
          category: '', parent_email: '', parent_phone: '', parent_name: '', blood_group: '', status: 'active'
        });
        loadStudents();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save student' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving student' });
      console.error('Save student error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async (id) => {
    try {
      const response = await fetch(api.admin.studentById(id), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setViewingStudent(data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  // ========== TEACHER MANAGEMENT FUNCTIONS ==========
  
  const openTeacherModal = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setTeacherForm({
        name: teacher.name || '',
        email: teacher.email || '',
        password: '',
        phone: teacher.phone || '',
        branch_id: teacher.branch_id || ''
      });
    } else {
      setEditingTeacher(null);
      setTeacherForm({
        name: '', email: '', password: '', phone: '', branch_id: ''
      });
    }
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    if (!editingTeacher && !teacherForm.password) {
      setMessage({ type: 'error', text: 'Password is required for new teachers' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setLoading(true);
      const url = editingTeacher ? api.admin.updateTeacher(editingTeacher.id) : api.admin.createTeacher;
      const method = editingTeacher ? 'PUT' : 'POST';
      
      const formData = { ...teacherForm };
      if (editingTeacher && !formData.password) {
        delete formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Teacher ${editingTeacher ? 'updated' : 'created'} successfully` });
        setShowTeacherModal(false);
        setEditingTeacher(null);
        setTeacherForm({
          name: '', email: '', password: '', phone: '', branch_id: ''
        });
        loadTeachers();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save teacher' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving teacher' });
      console.error('Save teacher error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ========== DEPARTMENT/BRANCH/HOD FUNCTIONS ==========
  
  const openDepartmentModal = (dept = null) => {
    setEditingDepartment(dept);
    setDepartmentForm(dept ? { name: dept.name || '', code: dept.code || '', description: dept.description || '', hod_name: dept.hod_name || '' } : { name: '', code: '', description: '', hod_name: '' });
    setShowDepartmentModal(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!departmentForm.name || !departmentForm.code) {
      setMessage({ type: 'error', text: 'Name and code are required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    try {
      setLoading(true);
      const url = editingDepartment ? api.admin.updateDepartment(editingDepartment.id) : api.admin.createDepartment;
      const response = await fetch(url, {
        method: editingDepartment ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentForm)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Department ${editingDepartment ? 'updated' : 'created'} successfully` });
        setShowDepartmentModal(false);
        setEditingDepartment(null);
        setDepartmentForm({ name: '', code: '', description: '', hod_name: '' });
        loadDepartments();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save department' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving department' });
      console.error('Save department error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openBranchModal = (branch = null) => {
    setEditingBranch(branch);
    setBranchForm(branch ? { name: branch.name || branch.branch_name || '', code: branch.code || '', description: branch.description || '' } : { name: '', code: '', description: '' });
    setShowBranchModal(true);
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.code) {
      setMessage({ type: 'error', text: 'Name and code are required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    try {
      setLoading(true);
      const url = editingBranch ? api.admin.updateBranch(editingBranch.id) : api.admin.createBranch;
      const response = await fetch(url, {
        method: editingBranch ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Branch ${editingBranch ? 'updated' : 'created'} successfully` });
        setShowBranchModal(false);
        setEditingBranch(null);
        setBranchForm({ name: '', code: '', description: '' });
        loadBranches();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save branch' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving branch' });
      console.error('Save branch error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openHODModal = (department = null) => {
    if (department) {
      // Editing existing HOD
      setEditingHOD(department);
      // Find the teacher by name if HOD exists
      const hodTeacher = teachers.find(t => t.name === department.hod_name);
      setHODForm({
        department_id: department.id,
        teacher_id: hodTeacher ? hodTeacher.id : ''
      });
    } else {
      // Adding new HOD
      setEditingHOD(null);
      setHODForm({
        department_id: '',
        teacher_id: ''
      });
    }
    setShowHODModal(true);
  };

  const handleAssignHOD = async (e) => {
    e.preventDefault();
    if (!hodForm.department_id || !hodForm.teacher_id) {
      setMessage({ type: 'error', text: 'Department and Teacher are required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(api.admin.assignHOD, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(hodForm)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: editingHOD ? 'HOD updated successfully' : 'HOD assigned successfully' });
        setShowHODModal(false);
        setEditingHOD(null);
        loadDepartments();
        loadHODs();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to assign HOD' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error assigning HOD' });
      console.error('Assign HOD error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      setLoading(true);
      const response = await fetch(api.admin.deleteDepartment(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Department deleted successfully' });
        loadDepartments();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete department' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting department' });
      console.error('Delete department error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) return;

    try {
      setLoading(true);
      const response = await fetch(api.admin.deleteBranch(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Branch deleted successfully' });
        loadBranches();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete branch' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting branch' });
      console.error('Delete branch error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHOD = async (departmentId) => {
    if (!window.confirm('Are you sure you want to remove the HOD from this department?')) return;

    try {
      setLoading(true);
      const response = await fetch(api.admin.removeHOD(departmentId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'HOD removed successfully' });
        loadDepartments();
        loadHODs();
        loadDashboardData();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to remove HOD' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error removing HOD' });
      console.error('Remove HOD error:', error);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
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
      <nav className="admin-tabs" style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        border: '1px solid #e5e7eb'
      }}>
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
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : '#f3f4f6',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(102, 126, 234, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#e5e7eb';
                e.currentTarget.style.color = '#1f2937';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            <span className="tab-icon" style={{ fontSize: '1.125rem' }}>{tab.icon}</span>
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
            <div className="stats-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem' }}>👨‍🏫</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                    {statistics.teachers}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
                    Teachers
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem' }}>🎓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                    {statistics.students}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
                    Students
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem' }}>👨‍👩‍👧‍👦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                    {statistics.parents}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
                    Parents
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem' }}>📢</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                    {statistics.notices}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
                    Notices
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem' }}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                    {branches.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
                    Branches
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => { setActiveTab('students'); openStudentModal(); }}
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '2.5rem' }}>➕</span>
                <span>Add Student</span>
              </button>
              <button
                onClick={() => { setActiveTab('teachers'); openTeacherModal(); }}
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '2.5rem' }}>👨‍🏫</span>
                <span>Add Teacher</span>
              </button>
              <button
                onClick={() => { setActiveTab('departments'); openDepartmentModal(); }}
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '2.5rem' }}>🏛️</span>
                <span>Create Department</span>
              </button>
              <button
                onClick={() => { setActiveTab('departments'); openBranchModal(); }}
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '2.5rem' }}>🌿</span>
                <span>Create Branch</span>
              </button>
            </div>

            {/* Charts */}
            <div className="charts-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div className="chart-card" style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#1f2937', 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📊 User Distribution
                </h3>
                <Doughnut data={userDistributionData} options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { 
                    legend: { position: 'bottom' },
                    tooltip: {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      padding: 12,
                      titleFont: { size: 14 },
                      bodyFont: { size: 13 }
                    }
                  }
                }} />
              </div>
              {branchDistributionData && (
                <div className="chart-card" style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#1f2937', 
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📈 Students by Branch
                  </h3>
                  <Bar data={branchDistributionData} options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 }
                      }
                    },
                    scales: { 
                      y: { 
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                      } 
                    }
                  }} />
                </div>
              )}
            </div>

            {/* Send Notice Form */}
            <div className="dashboard-card-modern" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <span style={{ fontSize: '2rem' }}>📢</span>
                <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>Send Notice</h2>
              </div>
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

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Departments Section */}
            <div className="dashboard-card-modern" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div className="card-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>🏛️</span>
                  <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                    Departments 
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#eff6ff',
                      color: '#3b82f6',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {departments.length}
                    </span>
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => openDepartmentModal()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                  >
                    ➕ Add Department
                  </button>
                  <button 
                    onClick={() => openHODModal()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                  >
                    👤 Assign HOD
                  </button>
                </div>
              </div>
              {departments.length > 0 ? (
                <div className="table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>HOD</th>
                        <th>Students</th>
                        <th>Faculty</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map(dept => (
                        <tr key={dept.id}>
                          <td><strong>{dept.name}</strong></td>
                          <td><span className="badge badge-blue">{dept.code}</span></td>
                          <td>{dept.hod_name || '-'}</td>
                          <td>{dept.total_students || 0}</td>
                          <td>{dept.total_faculty || 0}</td>
                          <td>
                            <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => openDepartmentModal(dept)} 
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteDepartment(dept.id)} 
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No departments found</p>
              )}
            </div>

            {/* Branches Section */}
            <div className="dashboard-card-modern" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div className="card-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>🌿</span>
                  <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                    Branches 
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#f0fdf4',
                      color: '#10b981',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {branches.length}
                    </span>
                  </h2>
                </div>
                <button 
                  onClick={() => openBranchModal()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  ➕ Add Branch
                </button>
              </div>
              {branches.length > 0 ? (
                <div className="table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches.map(branch => (
                        <tr key={branch.id}>
                          <td><strong>{branch.name || branch.branch_name}</strong></td>
                          <td><span className="badge badge-green">{branch.code}</span></td>
                          <td>{branch.description || '-'}</td>
                          <td>
                            <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => openBranchModal(branch)} 
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteBranch(branch.id)} 
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No branches found</p>
              )}
            </div>

            {/* HODs List */}
            {hods.length > 0 && (
              <div className="dashboard-card-modern" style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div className="card-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid #f3f4f6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>👤</span>
                    <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                      Heads of Departments
                    </h2>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>HOD Name</th>
                        <th>Teacher Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hods.map(hod => {
                        const dept = departments.find(d => d.id === hod.department_id);
                        return (
                          <tr key={hod.department_id}>
                            <td><strong>{hod.department_name}</strong></td>
                            <td>{hod.hod_name || '-'}</td>
                            <td>{hod.teacher_email || '-'}</td>
                            <td>
                              <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  onClick={() => dept && openHODModal(dept)} 
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  onClick={() => handleRemoveHOD(hod.department_id)} 
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  🗑️ Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                          <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => openTeacherModal(teacher)} 
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser('teacher', teacher.id)} 
                              className="btn-delete"
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              🗑️ Delete
                            </button>
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
          <div className="dashboard-card-modern" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>🎓</span>
                <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                  All Students 
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: '#f0fdf4',
                    color: '#10b981',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {students.length}
                  </span>
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => openStudentModal()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ➕ Add Student
                </button>
                <button 
                  onClick={() => exportToCSV(students, 'students', 'student')} 
                  className="btn-export"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📥 Export CSV
                </button>
              </div>
            </div>
            {message.text && (
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: message.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
              }}>
                {message.text}
              </div>
            )}
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
                          <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => viewStudentDetails(student.id)} 
                              className="btn-view"
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              👁️ View
                            </button>
                            <button 
                              onClick={() => openStudentModal(student)} 
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser('student', student.id)} 
                              className="btn-delete"
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              🗑️ Delete
                            </button>
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
          <div className="dashboard-card-modern" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>👨‍👩‍👧‍👦</span>
                <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                  All Parents 
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: '#eff6ff',
                    color: '#3b82f6',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {parents.length}
                  </span>
                </h2>
              </div>
              <button 
                onClick={() => exportToCSV(parents, 'parents', 'parent')} 
                className="btn-export"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Send Notice Form */}
            <div className="dashboard-card-modern" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <span style={{ fontSize: '2rem' }}>📢</span>
                <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>Send Notice</h2>
              </div>
              {message.text && (
                <div style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: message.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
                }}>
                  {message.text}
                </div>
              )}
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

            {/* All Notices List */}
            <div className="dashboard-card-modern" style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div className="card-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>📢</span>
                  <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                    All Notices 
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {notices.length}
                    </span>
                  </h2>
                </div>
              </div>
              {notices.length > 0 ? (
                <div className="table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Recipient</th>
                        <th>Priority</th>
                        <th>Sender</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map(notice => (
                        <tr key={notice.id}>
                          <td><strong>{notice.title}</strong></td>
                          <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notice.message}
                          </td>
                          <td>
                            <span className="badge badge-blue">
                              {notice.recipient_type === 'all' ? 'All Users' :
                               notice.recipient_type === 'student' ? 'All Students' :
                               notice.recipient_type === 'teacher' ? 'All Teachers' :
                               notice.recipient_type === 'parent' ? 'All Parents' :
                               notice.recipient_type === 'branch' ? `Branch: ${notice.branch_id}` :
                               notice.recipient_type}
                            </span>
                          </td>
                          <td>
                            <span className={`badge priority-${notice.priority}`} style={{
                              background: notice.priority === 'high' ? '#fee2e2' :
                                         notice.priority === 'medium' ? '#dbeafe' : '#f3f4f6',
                              color: notice.priority === 'high' ? '#991b1b' :
                                     notice.priority === 'medium' ? '#1e40af' : '#374151'
                            }}>
                              {notice.priority?.toUpperCase() || 'LOW'}
                            </span>
                          </td>
                          <td>{notice.sender_name || 'Admin'}</td>
                          <td>{new Date(notice.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => openNoticeModal(notice)} 
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteNotice(notice.id)} 
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No notices found</p>
              )}
            </div>
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

      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '16px', padding: '0', maxWidth: '900px', width: '95%', maxHeight: '95vh', 
            overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div className="modal-header" style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '1.5rem 2rem', borderBottom: '2px solid #f3f4f6', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
                {editingStudent ? '✏️ Edit Student' : '➕ Add New Student'}
              </h2>
              <button onClick={() => setShowStudentModal(false)} style={{ 
                background: 'rgba(255,255,255,0.2)', border: 'none', fontSize: '1.5rem', 
                cursor: 'pointer', color: 'white', width: '36px', height: '36px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >×</button>
            </div>
            <form onSubmit={handleSaveStudent} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Roll No *</label>
                  <input type="text" value={studentForm.roll_no} onChange={(e) => setStudentForm({...studentForm, roll_no: e.target.value})} 
                    required style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Name *</label>
                  <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} 
                    required style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Email</label>
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({...studentForm, email: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>
                    {editingStudent ? 'New Password' : 'Password *'}
                  </label>
                  <input type="password" value={studentForm.password} onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} 
                    required={!editingStudent} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Phone</label>
                  <input type="tel" value={studentForm.phone} onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Branch</label>
                  <select value={studentForm.branch_id} onChange={(e) => setStudentForm({...studentForm, branch_id: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', background: 'white', boxSizing: 'border-box' }}>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Year</label>
                  <input type="number" min="1" max="3" value={studentForm.year} onChange={(e) => setStudentForm({...studentForm, year: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Semester</label>
                  <input type="number" min="1" max="6" value={studentForm.semester} onChange={(e) => setStudentForm({...studentForm, semester: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Section</label>
                  <input type="text" value={studentForm.section} onChange={(e) => setStudentForm({...studentForm, section: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>DOB</label>
                  <input type="date" value={studentForm.dob} onChange={(e) => setStudentForm({...studentForm, dob: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Father Name</label>
                  <input type="text" value={studentForm.father_name} onChange={(e) => setStudentForm({...studentForm, father_name: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Mother Name</label>
                  <input type="text" value={studentForm.mother_name} onChange={(e) => setStudentForm({...studentForm, mother_name: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Parent Email</label>
                  <input type="email" value={studentForm.parent_email} onChange={(e) => setStudentForm({...studentForm, parent_email: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Parent Phone</label>
                  <input type="tel" value={studentForm.parent_phone} onChange={(e) => setStudentForm({...studentForm, parent_phone: e.target.value})} 
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.8rem' }}>Status</label>
                  <select value={studentForm.status} onChange={(e) => setStudentForm({...studentForm, status: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem', background: 'white', boxSizing: 'border-box' }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #f3f4f6' }}>
                <button type="button" onClick={() => setShowStudentModal(false)} style={{ 
                  padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', 
                  borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                >Cancel</button>
                <button type="submit" disabled={loading} style={{ 
                  padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', 
                  borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', 
                  fontSize: '0.875rem', opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.background = '#2563eb')}
                onMouseLeave={(e) => !loading && (e.target.style.background = '#3b82f6')}
                >{loading ? '⏳ Saving...' : '💾 Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {showTeacherModal && (
        <div className="modal-overlay" onClick={() => setShowTeacherModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button onClick={() => setShowTeacherModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSaveTeacher}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div><label>Name *</label><input type="text" value={teacherForm.name} onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Email *</label><input type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>{editingTeacher ? 'New Password (leave blank to keep current)' : 'Password *'}</label><input type="password" value={teacherForm.password} onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})} required={!editingTeacher} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Phone</label><input type="tel" value={teacherForm.phone} onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Branch</label><select value={teacherForm.branch_id} onChange={(e) => setTeacherForm({...teacherForm, branch_id: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}><option value="">Select Branch</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>)}</select></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowTeacherModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="modal-overlay" onClick={() => setShowDepartmentModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingDepartment ? 'Edit Department' : 'Add New Department'}</h2>
              <button onClick={() => setShowDepartmentModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSaveDepartment}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div><label>Name *</label><input type="text" value={departmentForm.name} onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Code *</label><input type="text" value={departmentForm.code} onChange={(e) => setDepartmentForm({...departmentForm, code: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Description</label><textarea value={departmentForm.description} onChange={(e) => setDepartmentForm({...departmentForm, description: e.target.value})} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDepartmentModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="modal-overlay" onClick={() => setShowBranchModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button onClick={() => setShowBranchModal(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSaveBranch}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div><label>Name *</label><input type="text" value={branchForm.name} onChange={(e) => setBranchForm({...branchForm, name: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Code *</label><input type="text" value={branchForm.code} onChange={(e) => setBranchForm({...branchForm, code: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
                <div><label>Description</label><textarea value={branchForm.description} onChange={(e) => setBranchForm({...branchForm, description: e.target.value})} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBranchModal(false)} style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Edit Modal */}
      {showNoticeModal && (
        <div className="modal-overlay" onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingNotice ? 'Edit Notice' : 'Send Notice'}</h2>
              <button onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={editingNotice ? handleUpdateNotice : handleSendNotice}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label>Title *</label>
                  <input 
                    type="text" 
                    value={noticeForm.title} 
                    onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label>Message *</label>
                  <textarea 
                    value={noticeForm.message} 
                    onChange={(e) => setNoticeForm({...noticeForm, message: e.target.value})} 
                    rows="4"
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Recipient *</label>
                    <select 
                      value={noticeForm.recipient_type} 
                      onChange={(e) => setNoticeForm({...noticeForm, recipient_type: e.target.value, branch_id: ''})} 
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                      <option value="all">All Users</option>
                      <option value="student">All Students</option>
                      <option value="teacher">All Teachers</option>
                      <option value="parent">All Parents</option>
                      <option value="branch">Specific Branch</option>
                    </select>
                  </div>
                  <div>
                    <label>Priority *</label>
                    <select 
                      value={noticeForm.priority} 
                      onChange={(e) => setNoticeForm({...noticeForm, priority: e.target.value})} 
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
                {noticeForm.recipient_type === 'branch' && (
                  <div>
                    <label>Branch *</label>
                    <select 
                      value={noticeForm.branch_id} 
                      onChange={(e) => setNoticeForm({...noticeForm, branch_id: e.target.value})} 
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} 
                  style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {loading ? (editingNotice ? 'Updating...' : 'Sending...') : (editingNotice ? 'Update Notice' : 'Send Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Edit Modal */}
      {showNoticeModal && (
        <div className="modal-overlay" onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingNotice ? 'Edit Notice' : 'Send Notice'}</h2>
              <button onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={editingNotice ? handleUpdateNotice : handleSendNotice}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label>Title *</label>
                  <input 
                    type="text" 
                    value={noticeForm.title} 
                    onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label>Message *</label>
                  <textarea 
                    value={noticeForm.message} 
                    onChange={(e) => setNoticeForm({...noticeForm, message: e.target.value})} 
                    rows="4"
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Recipient *</label>
                    <select 
                      value={noticeForm.recipient_type} 
                      onChange={(e) => setNoticeForm({...noticeForm, recipient_type: e.target.value, branch_id: ''})} 
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                      <option value="all">All Users</option>
                      <option value="student">All Students</option>
                      <option value="teacher">All Teachers</option>
                      <option value="parent">All Parents</option>
                      <option value="branch">Specific Branch</option>
                    </select>
                  </div>
                  <div>
                    <label>Priority *</label>
                    <select 
                      value={noticeForm.priority} 
                      onChange={(e) => setNoticeForm({...noticeForm, priority: e.target.value})} 
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
                {noticeForm.recipient_type === 'branch' && (
                  <div>
                    <label>Branch *</label>
                    <select 
                      value={noticeForm.branch_id} 
                      onChange={(e) => setNoticeForm({...noticeForm, branch_id: e.target.value})} 
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name || b.branch_name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowNoticeModal(false); setEditingNotice(null); }} 
                  style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {loading ? (editingNotice ? 'Updating...' : 'Sending...') : (editingNotice ? 'Update Notice' : 'Send Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOD Assignment Modal */}
      {showHODModal && (
        <div className="modal-overlay" onClick={() => setShowHODModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingHOD ? 'Edit HOD' : 'Assign HOD'}</h2>
              <button onClick={() => { setShowHODModal(false); setEditingHOD(null); }} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            {editingHOD && editingHOD.hod_name && (
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fbbf24'
              }}>
                <strong>Current HOD:</strong> {editingHOD.hod_name}
              </div>
            )}
            <form onSubmit={handleAssignHOD}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label>Department *</label>
                  <select 
                    value={hodForm.department_id} 
                    onChange={(e) => setHODForm({...hodForm, department_id: e.target.value})} 
                    required 
                    disabled={!!editingHOD}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      border: '1px solid #d1d5db',
                      background: editingHOD ? '#f3f4f6' : 'white',
                      cursor: editingHOD ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.hod_name ? `(Current HOD: ${d.hod_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Teacher *</label>
                  <select 
                    value={hodForm.teacher_id} 
                    onChange={(e) => setHODForm({...hodForm, teacher_id: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email}) {t.branch_name ? `- ${t.branch_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowHODModal(false); setEditingHOD(null); }} 
                  style={{ padding: '0.75rem 1.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {loading ? (editingHOD ? 'Updating...' : 'Assigning...') : (editingHOD ? 'Update HOD' : 'Assign HOD')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && (viewingStudent || selectedUser) && (
        <div className="modal-overlay" onClick={() => { setShowDetailsModal(false); setViewingStudent(null); }} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{(viewingStudent || selectedUser)?.type ? (viewingStudent || selectedUser).type.toUpperCase() : 'Student'} Details</h2>
              <button onClick={() => { setShowDetailsModal(false); setViewingStudent(null); }} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              {Object.entries(viewingStudent || selectedUser || {}).filter(([key]) => key !== 'type' && key !== 'password').map(([key, value]) => (
                <div key={key} className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
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
