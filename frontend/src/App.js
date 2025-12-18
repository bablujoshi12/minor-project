import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Chatbot from './components/Chatbot';
import SmartNoticePopup from './components/SmartNoticePopup';
import LoadingScreen from './components/LoadingScreen';
import NSSNCC from './components/NSSNCC';
import Timetable from './components/Timetable';
import Gallery from './components/Gallery';
import CollegeLogo from './components/CollegeLogo';
import HeaderLogo from './components/HeaderLogo';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('sc_theme');
    if (stored === 'dark' || stored === 'light' || stored === 'sepia') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  const [themeOpen, setThemeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Settings
  const defaultSettings = {
    language: 'en', // 'en' | 'hi'
    fontSize: 'default', // 'small' | 'default' | 'large'
    reduceMotion: false,
    highContrast: false,
    compactMode: false,
    gradients: true,
    roundedCorners: true,
    notifications: false,
    dataSaver: false,
    accent: 'purple', // 'blue'|'purple'|'green'|'red'|'amber'
    headerStyle: 'solid', // 'solid'|'transparent'
    layoutWidth: 'normal', // 'normal'|'wide'
    shadowIntensity: 'normal', // 'soft'|'normal'|'strong'
  };
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('sc_settings');
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const saveSettings = (next) => {
    setSettings(next);
    try { localStorage.setItem('sc_settings', JSON.stringify(next)); } catch {}
  };

  useEffect(() => {
    document.body.classList.remove('dark', 'sepia');
    if (theme === 'dark') document.body.classList.add('dark');
    if (theme === 'sepia') document.body.classList.add('sepia');
    localStorage.setItem('sc_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Show loading for 5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Apply settings to <body>
  useEffect(() => {
    const b = document.body;
    // Language
    b.setAttribute('data-lang', settings.language);

    // Font size
    b.classList.remove('text-small', 'text-large');
    if (settings.fontSize === 'small') b.classList.add('text-small');
    if (settings.fontSize === 'large') b.classList.add('text-large');

    // Toggles
    b.classList.toggle('reduce-motion', !!settings.reduceMotion);
    b.classList.toggle('high-contrast', !!settings.highContrast);
    b.classList.toggle('compact', !!settings.compactMode);
    b.classList.toggle('no-gradients', !settings.gradients);
    b.classList.toggle('sharp-corners', !settings.roundedCorners);
    b.classList.toggle('data-saver', !!settings.dataSaver);

    // Accent
    b.classList.remove('accent-blue','accent-purple','accent-green','accent-red','accent-amber');
    b.classList.add(`accent-${settings.accent}`);

    // Header style
    b.classList.toggle('header-transparent', settings.headerStyle === 'transparent');

    // Layout width
    b.classList.toggle('wide-layout', settings.layoutWidth === 'wide');

    // Shadow intensity
    b.classList.remove('shadows-soft','shadows-strong');
    if (settings.shadowIntensity === 'soft') b.classList.add('shadows-soft');
    if (settings.shadowIntensity === 'strong') b.classList.add('shadows-strong');
  }, [settings]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const corner = document.querySelector('.theme-corner');
      const libraryDropdown = document.querySelector('.library-dropdown-wrapper');
      
      if (
        corner &&
        !corner.contains(e.target) &&
        (themeOpen || settingsOpen)
      ) {
        setThemeOpen(false);
        setSettingsOpen(false);
      }
      
      if (
        libraryDropdown &&
        !libraryDropdown.contains(e.target) &&
        libraryOpen
      ) {
        setLibraryOpen(false);
      }
    };
    
    if (libraryOpen || themeOpen || settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [themeOpen, settingsOpen, libraryOpen]);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  const themeItems = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'sepia', label: 'Sepia' }
  ];

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    saveSettings(next);
  };

  return (
    <div className={`app`}>
      <Router>
        <header className="site-header">
          <div className="container header-inner">
            <div className="brand">
              <div className="brand-mark">
                <HeaderLogo size={48} animated={true} />
              </div>
              <div className="brand-texts">
                <div className="brand-name">Government Polytechnic, Lohaghat</div>
                <div className="brand-tagline">Smart Campus Portal</div>
              </div>
            </div>

            <nav className="main-nav">
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
              <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Gallery</NavLink>
              <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
              <button 
                className="nav-link library-link"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLibraryOpen(true);
                  if (themeOpen) setThemeOpen(false);
                  if (settingsOpen) setSettingsOpen(false);
                }}
              >
                📚 Smart Library
              </button>
              <a 
                href="https://ubterex.in/Student/Login.aspx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="nav-link results-link"
                title="Check Student Results"
              >
                📊 Student Result
              </a>
              {user ? (
                <NavLink to="/auth" className="user-name-nav">
                  👤 {user.name}
                </NavLink>
              ) : (
                <NavLink to="/auth" className={({ isActive }) => `btn-login ${isActive ? 'active' : ''}`}>Login</NavLink>
              )}
            </nav>

            {/* Theme + Settings buttons (absolute right) */}
            <div className="theme-corner" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Theme menu */}
              <div className="more-menu">
                <button
                  id="theme-button"
                  className="more-button"
                  aria-haspopup="true"
                  aria-expanded={themeOpen}
                  onClick={() => { setThemeOpen((o) => !o); if (settingsOpen) setSettingsOpen(false); }}
                  title="Theme"
                  aria-label="Theme"
                >
                  🌓
                </button>
                {themeOpen && (
                  <div id="theme-dropdown" className="more-dropdown" role="menu">
                    <div className="dropdown-item static" role="menuitem">
                      <span>Appearance</span>
                      <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{themeItems.find(t => t.key === theme)?.label}</span>
                    </div>
                    <div className="dropdown-sep" />
                    {themeItems.map((t) => (
                      <button
                        key={t.key}
                        className={`dropdown-item ${theme === t.key ? 'active' : ''}`}
                        onClick={() => { setTheme(t.key); setThemeOpen(false); }}
                        role="menuitem"
                        aria-checked={theme === t.key}
                      >
                        <span>{t.label}</span>
                        {theme === t.key ? <span>✓</span> : null}
                      </button>
                    ))}

                    <div className="dropdown-sep" />
                    <div className="dropdown-item static" role="menuitem"><span>Accent</span>
                      <div>
                        {['blue','purple','green','red','amber'].map((c) => (
                          <button key={c} className={`mini-chip ${settings.accent === c ? 'active' : ''}`} onClick={() => updateSetting('accent', c)}>{c}</button>
                        ))}
                      </div>
                    </div>

                    <div className="dropdown-item static" role="menuitem"><span>Header</span>
                      <div>
                        <button className={`mini-chip ${settings.headerStyle === 'solid' ? 'active' : ''}`} onClick={() => updateSetting('headerStyle', 'solid')}>Solid</button>
                        <button className={`mini-chip ${settings.headerStyle === 'transparent' ? 'active' : ''}`} onClick={() => updateSetting('headerStyle', 'transparent')}>Transparent</button>
                      </div>
                    </div>

                    <div className="dropdown-item static" role="menuitem"><span>Layout Width</span>
                      <div>
                        <button className={`mini-chip ${settings.layoutWidth === 'normal' ? 'active' : ''}`} onClick={() => updateSetting('layoutWidth', 'normal')}>Normal</button>
                        <button className={`mini-chip ${settings.layoutWidth === 'wide' ? 'active' : ''}`} onClick={() => updateSetting('layoutWidth', 'wide')}>Wide</button>
                      </div>
                    </div>

                    <div className="dropdown-item static" role="menuitem"><span>Shadows</span>
                      <div>
                        <button className={`mini-chip ${settings.shadowIntensity === 'soft' ? 'active' : ''}`} onClick={() => updateSetting('shadowIntensity', 'soft')}>Soft</button>
                        <button className={`mini-chip ${settings.shadowIntensity === 'normal' ? 'active' : ''}`} onClick={() => updateSetting('shadowIntensity', 'normal')}>Normal</button>
                        <button className={`mini-chip ${settings.shadowIntensity === 'strong' ? 'active' : ''}`} onClick={() => updateSetting('shadowIntensity', 'strong')}>Strong</button>
                      </div>
                    </div>

                    <div className="dropdown-sep" />
                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('compactMode', !settings.compactMode)}>
                      <span>Compact Mode</span>
                      <input type="checkbox" readOnly checked={settings.compactMode} />
                    </div>

                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('gradients', !settings.gradients)}>
                      <span>Show Gradients</span>
                      <input type="checkbox" readOnly checked={settings.gradients} />
                    </div>

                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('roundedCorners', !settings.roundedCorners)}>
                      <span>Rounded Corners</span>
                      <input type="checkbox" readOnly checked={settings.roundedCorners} />
                    </div>
                  </div>
                )}
              </div>

              {/* Settings menu (no theme features) */}
              <div className="more-menu">
                <button
                  id="settings-button"
                  className="more-button"
                  aria-haspopup="true"
                  aria-expanded={settingsOpen}
                  onClick={() => { setSettingsOpen((o) => !o); if (themeOpen) setThemeOpen(false); }}
                  title="Settings"
                  aria-label="Settings"
                >
                  ⚙️
                </button>
                {settingsOpen && (
                  <div id="settings-dropdown" className="more-dropdown" role="menu">
                    <div className="dropdown-item static" role="menuitem"><span>Language</span>
                      <div>
                        <button className={`mini-chip ${settings.language === 'en' ? 'active' : ''}`} onClick={() => updateSetting('language', 'en')}>EN</button>
                        <button className={`mini-chip ${settings.language === 'hi' ? 'active' : ''}`} onClick={() => updateSetting('language', 'hi')}>HI</button>
                      </div>
                    </div>

                    <div className="dropdown-item static" role="menuitem"><span>Font Size</span>
                      <div>
                        <button className={`mini-chip ${settings.fontSize === 'small' ? 'active' : ''}`} onClick={() => updateSetting('fontSize', 'small')}>A−</button>
                        <button className={`mini-chip ${settings.fontSize === 'default' ? 'active' : ''}`} onClick={() => updateSetting('fontSize', 'default')}>A</button>
                        <button className={`mini-chip ${settings.fontSize === 'large' ? 'active' : ''}`} onClick={() => updateSetting('fontSize', 'large')}>A+</button>
                      </div>
                    </div>

                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('highContrast', !settings.highContrast)}>
                      <span>High Contrast</span>
                      <input type="checkbox" readOnly checked={settings.highContrast} />
                    </div>

                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}>
                      <span>Reduce Motion</span>
                      <input type="checkbox" readOnly checked={settings.reduceMotion} />
                    </div>

                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('notifications', !settings.notifications)}>
                      <span>Enable Notifications</span>
                      <input type="checkbox" readOnly checked={settings.notifications} />
                    </div>

                    <div className="dropdown-item" role="menuitem" onClick={() => updateSetting('dataSaver', !settings.dataSaver)}>
                      <span>Data Saver</span>
                      <input type="checkbox" readOnly checked={settings.dataSaver} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/nssncc" element={<NSSNCC />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <div className="container footer-inner">
            <div className="footer-left">
              <div className="footer-brand">GPL Lohaghat</div>
              <div className="footer-sub">Empowering technical education</div>
            </div>
            <div className="footer-right">
              <button className="footer-link">Privacy</button>
              <button className="footer-link">Terms</button>
              <button className="footer-link">Help</button>
            </div>
          </div>
        </footer>
        
        {/* Corner Back Button */}
        <button
          className="back-fab"
          onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = '/'; }}
          title="Back"
          aria-label="Go Back"
        >
          ←
        </button>
        <Chatbot />
      </Router>

      {/* Smart Notice Popup - Global notices for all logged-in users */}
      {user && <SmartNoticePopup />}

      {/* Smart Library Modal */}
      {libraryOpen && (
        <div className="library-modal-overlay" onClick={() => setLibraryOpen(false)}>
          <div className="library-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="library-modal-close" onClick={() => setLibraryOpen(false)}>×</button>
            
            <div className="library-modal-header">
              <div className="library-modal-icon">📚</div>
              <div>
                <h2>Smart Library</h2>
                <p>Access Digital Resources & Courses</p>
              </div>
            </div>

            <div className="library-modal-body">
              <div className="library-section">
                <h3>📖 E-Book Collections</h3>
                <div className="library-cards">
                  <a 
                    href="https://engineering.library.cornell.edu/e-book-collections/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="library-card"
                    onClick={() => setLibraryOpen(false)}
                  >
                    <div className="library-card-icon">📚</div>
                    <div className="library-card-content">
                      <h4>E-Book Collections</h4>
                      <p>Access thousands of e-books and journals</p>
                    </div>
                    <div className="library-card-arrow">→</div>
                  </a>
                </div>
              </div>

              <div className="library-section">
                <h3>💻 Development Courses & Tutorials</h3>
                <div className="library-cards">
                  <a 
                    href="https://elearning-frontend-psmk.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="library-card library-card-featured"
                    onClick={() => setLibraryOpen(false)}
                  >
                    <div className="library-card-icon">💻</div>
                    <div className="library-card-content">
                      <h4>Full Stack Development Tutorial</h4>
                      <p>Complete full stack development course with hands-on projects</p>
                      <span className="library-card-badge">Popular</span>
                    </div>
                    <div className="library-card-arrow">→</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;
