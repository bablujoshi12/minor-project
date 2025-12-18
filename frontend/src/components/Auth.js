import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderLogo from './HeaderLogo';
import './Auth.css';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const Auth = () => {
  const navigate = useNavigate();
  const { user, login, signup, logout } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoadingLogo, setShowLoadingLogo] = useState(false);
  const [showInitialLogo, setShowInitialLogo] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // null, 'admin', 'teacher', 'student', 'parent'
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Show initial logo animation for 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLogo(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Form states for each panel
  const [adminLogin, setAdminLogin] = useState({ email: '', password: '' });
  const [teacherLogin, setTeacherLogin] = useState({ email: '', password: '' });
  const [studentLogin, setStudentLogin] = useState({ email: '', roll_no: '', password: '', loginType: 'email' });
  const [studentSignup, setStudentSignup] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    roll_no: '', section: '', branch: '', year: '',
    father_name: '', mother_name: '', phone: '', blood_group: '', dob: '', 
    parent_email: '', parent_name: '', parent_phone: ''
  });
  const [parentLogin, setParentLogin] = useState({ email: '', roll_no: '', dob: '', loginType: 'email' });

  // If user is logged in, redirect to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher' || user.role === 'faculty') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent/dashboard');
      }
    }
  }, [user, navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!adminLogin.email || !adminLogin.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!adminLogin.password || adminLogin.password.length < 1) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setShowLoadingLogo(true);

    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Admin login timeout - resetting loading state');
      setShowLoadingLogo(false);
      setLoading(false);
      setError('Login timeout. Please check your connection and try again.');
    }, 35000); // 35 seconds timeout

    try {
      const response = await authService.login({ email: adminLogin.email.trim(), password: adminLogin.password });
      clearTimeout(timeoutId); // Clear timeout on response
      console.log('Admin login response:', response);
      
      if (response && response.success && response.user && response.token) {
        login(response.user);
        setTimeout(() => {
          setShowLoadingLogo(false);
          setLoading(false);
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        const errorMsg = response?.message || response?.error || 'Invalid admin credentials. Please check your email and password.';
        setError(errorMsg);
        setShowLoadingLogo(false);
        setLoading(false);
      }
    } catch (err) {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('Admin login error:', err);
      const errorMsg = err.message || 'Network error. Please check if the server is running and try again.';
      setError(errorMsg);
      setShowLoadingLogo(false);
      setLoading(false);
    }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!teacherLogin.email || !teacherLogin.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!teacherLogin.password || teacherLogin.password.length < 1) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setShowLoadingLogo(true);

    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Teacher login timeout - resetting loading state');
      setShowLoadingLogo(false);
      setLoading(false);
      setError('Login timeout. Please check your connection and try again.');
    }, 35000); // 35 seconds timeout

    try {
      const response = await authService.login({ email: teacherLogin.email.trim(), password: teacherLogin.password });
      clearTimeout(timeoutId); // Clear timeout on response
      console.log('Teacher login response:', response);
      
      if (response && response.success && response.user && response.token) {
        login(response.user);
        setTimeout(() => {
          setShowLoadingLogo(false);
          setLoading(false);
          navigate('/teacher/dashboard');
        }, 2000);
      } else {
        const errorMsg = response?.message || response?.error || 'Invalid teacher credentials. Please check your email and password.';
        setError(errorMsg);
        setShowLoadingLogo(false);
        setLoading(false);
      }
    } catch (err) {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('Teacher login error:', err);
      const errorMsg = err.message || 'Network error. Please check if the server is running and try again.';
      setError(errorMsg);
      setShowLoadingLogo(false);
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!studentLogin.password || studentLogin.password.length < 1) {
      setError('Password is required');
      return;
    }

    if (studentLogin.loginType === 'email' && (!studentLogin.email || !studentLogin.email.trim())) {
      setError('Email is required');
      return;
    }

    if (studentLogin.loginType === 'roll_no' && (!studentLogin.roll_no || !studentLogin.roll_no.trim())) {
      setError('Roll number is required');
      return;
    }

    setLoading(true);
    setShowLoadingLogo(true);

    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Student login timeout - resetting loading state');
      setShowLoadingLogo(false);
      setLoading(false);
      setError('Login timeout. Please check your connection and try again.');
    }, 35000); // 35 seconds timeout

    try {
      const credentials = { 
        password: studentLogin.password.trim()
      };
      
      if (studentLogin.loginType === 'email') {
        credentials.email = studentLogin.email.trim();
      } else {
        credentials.roll_no = studentLogin.roll_no.trim();
      }

      console.log('Submitting student login:', { ...credentials, password: '***' });

      const response = await authService.login(credentials);
      clearTimeout(timeoutId); // Clear timeout on response
      console.log('Login response:', response);
      
      if (response && response.success && response.user && response.token) {
        console.log('Login successful, redirecting...');
        login(response.user);
        setTimeout(() => {
          setShowLoadingLogo(false);
          setLoading(false);
          navigate('/student/dashboard');
        }, 2000);
      } else {
        const errorMsg = response?.message || response?.error || 'Invalid student credentials. Please check your email/roll number and password.';
        console.error('Login error:', errorMsg, response);
        setError(errorMsg);
        setShowLoadingLogo(false);
        setLoading(false);
      }
    } catch (err) {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('Login catch error:', err);
      const errorMsg = err.message || 'Network error. Please check if the server is running and try again.';
      setError(errorMsg);
      setShowLoadingLogo(false);
      setLoading(false);
    }
  };

  const handleStudentSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!studentSignup.name || !studentSignup.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!studentSignup.email || !studentSignup.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!studentSignup.roll_no || !studentSignup.roll_no.trim()) {
      setError('Roll number is required');
      return;
    }

    if (!studentSignup.branch) {
      setError('Please select a branch');
      return;
    }

    if (!studentSignup.year) {
      setError('Please select a year');
      return;
    }

    if (!studentSignup.password || studentSignup.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (studentSignup.password !== studentSignup.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!studentSignup.parent_email || !studentSignup.parent_email.trim()) {
      setError('Parent email is required for parent login access');
      return;
    }

    if (!studentSignup.parent_name || !studentSignup.parent_name.trim()) {
      setError('Parent name is required');
      return;
    }

    setLoading(true);
    setShowLoadingLogo(true);

    try {
      const userData = {
        name: studentSignup.name.trim(),
        email: studentSignup.email.trim(),
        password: studentSignup.password,
        role: 'student',
        roll_no: studentSignup.roll_no.trim(),
        branch: studentSignup.branch,
        year: parseInt(studentSignup.year) || 1,
        section: studentSignup.section?.trim() || null,
        phone: studentSignup.phone?.trim() || null,
        father_name: studentSignup.father_name?.trim() || null,
        mother_name: studentSignup.mother_name?.trim() || null,
        parent_email: studentSignup.parent_email.trim(),
        parent_name: studentSignup.parent_name.trim(),
        parent_phone: studentSignup.parent_phone?.trim() || studentSignup.phone?.trim() || null,
        dob: studentSignup.dob || null,
        blood_group: studentSignup.blood_group || null
      };

      console.log('📤 Submitting student signup:', { ...userData, password: '***' });

      const response = await authService.register(userData);
      console.log('📥 Registration response:', response);
      
      if (response && response.success && response.user) {
        console.log('✅ Registration successful, logging in...');
        signup(response.user);
        setTimeout(() => {
          setShowLoadingLogo(false);
          navigate('/student/dashboard');
        }, 2000);
      } else {
        const errorMsg = response?.message || response?.error || 'Registration failed. Please try again.';
        console.error('❌ Registration error:', errorMsg, response);
        setError(errorMsg);
        setShowLoadingLogo(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration catch error:', err);
      setError('Network error. Please check your connection. ' + (err.message || ''));
      setShowLoadingLogo(false);
      setLoading(false);
    }
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!parentLogin.loginType || (parentLogin.loginType !== 'email' && parentLogin.loginType !== 'roll_no_dob')) {
      // Default to email if not set, but check if credentials provided
      if (!parentLogin.email && (!parentLogin.roll_no || !parentLogin.dob)) {
        setError('Please select a login type and enter credentials');
        return;
      }
    }

    if (parentLogin.loginType === 'email') {
      if (!parentLogin.email || !parentLogin.email.trim()) {
        setError('Please enter parent email');
        return;
      }
    } else {
      // roll_no_dob or default
      if (!parentLogin.roll_no || !parentLogin.roll_no.trim()) {
        setError('Please enter student roll number');
        return;
      }
      if (!parentLogin.dob) {
        setError('Please enter student date of birth');
        return;
      }
    }
    
    setLoading(true);
    setShowLoadingLogo(true);

    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Parent login timeout - resetting loading state');
      setShowLoadingLogo(false);
      setLoading(false);
      setError('Login timeout. Please check your connection and try again.');
    }, 35000); // 35 seconds timeout

    try {
      const credentials = {};
      if (parentLogin.loginType === 'email') {
        credentials.email = parentLogin.email.trim();
      } else {
        credentials.roll_no = parentLogin.roll_no.trim();
        credentials.dob = parentLogin.dob;
      }

      console.log('Parent login attempt:', { ...credentials, dob: credentials.dob ? '***' : 'missing' });

      const response = await authService.parentLogin(credentials);
      clearTimeout(timeoutId); // Clear timeout on response
      console.log('Parent login response:', response);
      
      if (response && response.success && response.user && response.token) {
        login(response.user);
        setTimeout(() => {
          setShowLoadingLogo(false);
          setLoading(false);
          navigate('/parent/dashboard');
        }, 2000);
      } else {
        const errorMsg = response?.message || response?.error || 'Invalid parent credentials. Please check your email/roll number and DOB.';
        setError(errorMsg);
        setShowLoadingLogo(false);
        setLoading(false);
      }
    } catch (err) {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('Parent login error:', err);
      const errorMsg = err.message || 'Network error. Please check if the server is running and try again.';
      setError(errorMsg);
      setShowLoadingLogo(false);
      setLoading(false);
    }
  };

  // Show login/register form if not logged in
  return (
    <div className="auth-container">
      {/* Initial Logo Animation */}
      {showInitialLogo && (
        <div className="auth-loading-overlay auth-initial-overlay">
          <div className="auth-loading-content">
            <div className="auth-loading-logo">
              <HeaderLogo size={100} animated={true} />
            </div>
            <div className="auth-loading-text">
              <p>Welcome to Smart Campus</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Logo Overlay */}
      {showLoadingLogo && !showInitialLogo && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-content">
            <div className="auth-loading-logo">
              <HeaderLogo size={80} animated={true} />
            </div>
            <div className="auth-loading-text">
              <p>Authenticating...</p>
            </div>
          </div>
        </div>
      )}

      <div className={`auth-main-content ${showInitialLogo ? 'auth-card-hidden' : ''}`}>
        {!activePanel ? (
          // Panel Selection Screen
          <div className="panel-selection">
            <div className="panel-selection-header">
              <h1>Smart Campus Portal</h1>
              <p>Select your login panel</p>
            </div>

            <div className="panel-grid">
              <div className="panel-card panel-admin" onClick={() => setActivePanel('admin')}>
                <div className="panel-icon">👑</div>
                <h3>Admin Panel</h3>
                <p>Root user access</p>
                <div className="panel-badge">Management</div>
              </div>

              <div className="panel-card panel-teacher" onClick={() => setActivePanel('teacher')}>
                <div className="panel-icon">👨‍🏫</div>
                <h3>Teacher Panel</h3>
                <p>Branch management</p>
                <div className="panel-badge">Faculty</div>
              </div>

              <div className="panel-card panel-student" onClick={() => setActivePanel('student')}>
                <div className="panel-icon">🎓</div>
                <h3>Student Panel</h3>
                <p>Signup & Dashboard</p>
                <div className="panel-badge">Portal</div>
              </div>

              <div className="panel-card panel-parent" onClick={() => setActivePanel('parent')}>
                <div className="panel-icon">👨‍👩‍👧‍👦</div>
                <h3>Parent Panel</h3>
                <p>Student info access</p>
                <div className="panel-badge">View Only</div>
              </div>
            </div>
          </div>
        ) : (
          // Individual Panel Forms
          <div className="panel-form-container">
            <button className="back-button" onClick={() => { setActivePanel(null); setError(''); setIsLoginMode(true); }}>
              ← Back to Panels
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {activePanel === 'admin' && (
              <div className="panel-form panel-admin-form">
                <div className="panel-form-header">
                  <div className="panel-icon">👑</div>
                  <h2>Admin Login</h2>
                  <p>Root user access to manage all users</p>
                </div>
                <form onSubmit={handleAdminLogin} className="auth-form">
                  <div className="form-row">
                    <label htmlFor="admin-email">Email</label>
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="vlogsnature05@gmail.com"
                      value={adminLogin.email}
                      onChange={(e) => setAdminLogin({ ...adminLogin, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="admin-password">Password</label>
                    <input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminLogin.password}
                      onChange={(e) => setAdminLogin({ ...adminLogin, password: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login as Admin'}
                  </button>
                </form>
              </div>
            )}

            {activePanel === 'teacher' && (
              <div className="panel-form panel-teacher-form">
                <div className="panel-form-header">
                  <div className="panel-icon">👨‍🏫</div>
                  <h2>Teacher Login</h2>
                  <p>Access your branch student management</p>
                </div>
                <form onSubmit={handleTeacherLogin} className="auth-form">
                  <div className="form-row">
                    <label htmlFor="teacher-email">Email</label>
                    <input
                      id="teacher-email"
                      type="email"
                      placeholder="it018@gmail.com"
                      value={teacherLogin.email}
                      onChange={(e) => setTeacherLogin({ ...teacherLogin, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="teacher-password">Password</label>
                    <input
                      id="teacher-password"
                      type="password"
                      placeholder="••••••••"
                      value={teacherLogin.password}
                      onChange={(e) => setTeacherLogin({ ...teacherLogin, password: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login as Teacher'}
                  </button>
                </form>
              </div>
            )}

            {activePanel === 'student' && (
              <div className="panel-form panel-student-form">
                <div className="panel-form-header">
                  <div className="panel-icon">🎓</div>
                  <div className="panel-tabs">
                    <button
                      type="button"
                      className={`panel-tab ${isLoginMode ? 'active' : ''}`}
                      onClick={() => { setIsLoginMode(true); setError(''); }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`panel-tab ${!isLoginMode ? 'active' : ''}`}
                      onClick={() => { setIsLoginMode(false); setError(''); }}
                    >
                      Signup
                    </button>
                  </div>
                </div>

                {isLoginMode ? (
                  <form onSubmit={handleStudentLogin} className="auth-form">
                    <div className="form-row">
                      <label>Login Type</label>
                      <div className="chip-group">
                        <button
                          type="button"
                          className={`chip ${studentLogin.loginType === 'email' ? 'active' : ''}`}
                          onClick={() => setStudentLogin({ ...studentLogin, loginType: 'email', roll_no: '' })}
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          className={`chip ${studentLogin.loginType === 'roll_no' ? 'active' : ''}`}
                          onClick={() => setStudentLogin({ ...studentLogin, loginType: 'roll_no', email: '' })}
                        >
                          Roll No
                        </button>
                      </div>
                    </div>
                    {studentLogin.loginType === 'email' ? (
                      <div className="form-row">
                        <label htmlFor="student-email">Email</label>
                        <input
                          id="student-email"
                          type="email"
                          placeholder="student@example.com"
                          value={studentLogin.email}
                          onChange={(e) => setStudentLogin({ ...studentLogin, email: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    ) : (
                      <div className="form-row">
                        <label htmlFor="student-roll">Roll Number</label>
                        <input
                          id="student-roll"
                          type="text"
                          placeholder="23010120023"
                          value={studentLogin.roll_no}
                          onChange={(e) => setStudentLogin({ ...studentLogin, roll_no: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    )}
                    <div className="form-row">
                      <label htmlFor="student-password">Password</label>
                      <input
                        id="student-password"
                        type="password"
                        placeholder="••••••••"
                        value={studentLogin.password}
                        onChange={(e) => setStudentLogin({ ...studentLogin, password: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <button type="submit" className="btn-auth" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login as Student'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleStudentSignup} className="auth-form">
                    <div className="form-row">
                      <label htmlFor="signup-name">Full Name *</label>
                      <input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        value={studentSignup.name}
                        onChange={(e) => setStudentSignup({ ...studentSignup, name: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-email">Email *</label>
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="student@example.com"
                        value={studentSignup.email}
                        onChange={(e) => setStudentSignup({ ...studentSignup, email: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-roll">Roll Number *</label>
                      <input
                        id="signup-roll"
                        type="text"
                        placeholder="23010120023"
                        value={studentSignup.roll_no}
                        onChange={(e) => setStudentSignup({ ...studentSignup, roll_no: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-branch">Branch *</label>
                      <select
                        id="signup-branch"
                        value={studentSignup.branch}
                        onChange={(e) => setStudentSignup({ ...studentSignup, branch: e.target.value })}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Branch</option>
                        <option value="IT">Information Technology</option>
                        <option value="CIVIL">Civil Engineering</option>
                        <option value="ELECTRONICS">Electronics Engineering</option>
                        <option value="PHARMACY">Pharmacy</option>
                        <option value="MECHANICAL">Mechanical Engineering</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-year">Year *</label>
                      <select
                        id="signup-year"
                        value={studentSignup.year}
                        onChange={(e) => setStudentSignup({ ...studentSignup, year: e.target.value })}
                        required
                        disabled={loading}
                      >
                        <option value="">Select Year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-section">Section</label>
                      <input
                        id="signup-section"
                        type="text"
                        placeholder="A"
                        value={studentSignup.section}
                        onChange={(e) => setStudentSignup({ ...studentSignup, section: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-dob">Date of Birth *</label>
                      <input
                        id="signup-dob"
                        type="date"
                        value={studentSignup.dob}
                        onChange={(e) => setStudentSignup({ ...studentSignup, dob: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-phone">Phone</label>
                      <input
                        id="signup-phone"
                        type="tel"
                        placeholder="9876543210"
                        value={studentSignup.phone}
                        onChange={(e) => setStudentSignup({ ...studentSignup, phone: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-father">Father's Name</label>
                      <input
                        id="signup-father"
                        type="text"
                        placeholder="Father's full name"
                        value={studentSignup.father_name}
                        onChange={(e) => setStudentSignup({ ...studentSignup, father_name: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-mother">Mother's Name</label>
                      <input
                        id="signup-mother"
                        type="text"
                        placeholder="Mother's full name"
                        value={studentSignup.mother_name}
                        onChange={(e) => setStudentSignup({ ...studentSignup, mother_name: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-parent-name">Parent Name (for login) *</label>
                      <input
                        id="signup-parent-name"
                        type="text"
                        placeholder="Parent's full name"
                        value={studentSignup.parent_name}
                        onChange={(e) => setStudentSignup({ ...studentSignup, parent_name: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-parent-email">Parent Email (for login) *</label>
                      <input
                        id="signup-parent-email"
                        type="email"
                        placeholder="parent@example.com"
                        value={studentSignup.parent_email}
                        onChange={(e) => setStudentSignup({ ...studentSignup, parent_email: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-parent-phone">Parent Phone</label>
                      <input
                        id="signup-parent-phone"
                        type="tel"
                        placeholder="Parent's phone number"
                        value={studentSignup.parent_phone}
                        onChange={(e) => setStudentSignup({ ...studentSignup, parent_phone: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-blood">Blood Group</label>
                      <select
                        id="signup-blood"
                        value={studentSignup.blood_group}
                        onChange={(e) => setStudentSignup({ ...studentSignup, blood_group: e.target.value })}
                        disabled={loading}
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
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-password">Password *</label>
                      <input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={studentSignup.password}
                        onChange={(e) => setStudentSignup({ ...studentSignup, password: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="signup-confirm">Confirm Password *</label>
                      <input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm password"
                        value={studentSignup.confirmPassword}
                        onChange={(e) => setStudentSignup({ ...studentSignup, confirmPassword: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <button type="submit" className="btn-auth" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Create Student Account'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activePanel === 'parent' && (
              <div className="panel-form panel-parent-form">
                <div className="panel-form-header">
                  <div className="panel-icon">👨‍👩‍👧‍👦</div>
                  <h2>Parent Login</h2>
                  <p>Access your child's information</p>
                </div>
                <form onSubmit={handleParentLogin} className="auth-form">
                  <div className="form-row">
                    <label>Login Type</label>
                    <div className="chip-group">
                      <button
                        type="button"
                        className={`chip ${parentLogin.loginType === 'email' ? 'active' : ''}`}
                        onClick={() => setParentLogin({ ...parentLogin, loginType: 'email', roll_no: '', dob: '' })}
                      >
                        Parent Email
                      </button>
                      <button
                        type="button"
                        className={`chip ${parentLogin.loginType === 'roll_no_dob' ? 'active' : ''}`}
                        onClick={() => setParentLogin({ ...parentLogin, loginType: 'roll_no_dob', email: '' })}
                      >
                        Roll No + DOB
                      </button>
                    </div>
                  </div>
                  {parentLogin.loginType === 'email' ? (
                    <div className="form-row">
                      <label htmlFor="parent-email">Parent Email</label>
                      <input
                        id="parent-email"
                        type="email"
                        placeholder="parent@example.com"
                        value={parentLogin.email}
                        onChange={(e) => setParentLogin({ ...parentLogin, email: e.target.value })}
                        required
                        disabled={loading}
                      />
                      <small>Email used during student signup</small>
                    </div>
                  ) : (
                    <>
                      <div className="form-row">
                        <label htmlFor="parent-roll">Student Roll Number</label>
                        <input
                          id="parent-roll"
                          type="text"
                          placeholder="23010120023"
                          value={parentLogin.roll_no}
                          onChange={(e) => setParentLogin({ ...parentLogin, roll_no: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-row">
                        <label htmlFor="parent-dob">Student Date of Birth</label>
                        <input
                          id="parent-dob"
                          type="date"
                          value={parentLogin.dob}
                          onChange={(e) => setParentLogin({ ...parentLogin, dob: e.target.value })}
                          required
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}
                  <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login as Parent'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
