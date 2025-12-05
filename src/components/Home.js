import React, { useEffect, useState } from 'react';
import './Home.css';
import DeptCard from './DeptCard';
import NotesBoard from './NotesBoard';
import SmartNoticePopup from './SmartNoticePopup';

const Home = () => {
  const [showStats, setShowStats] = useState(true);
  const [animateCards, setAnimateCards] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic Data States - All data fetched from backend database
  const [departments, setDepartments] = useState([]);
  const [features, setFeatures] = useState([]);
  const [events, setEvents] = useState([]);

  // Default/fallback data (if API fails)
  const defaultDepartments = [
    { 
      icon: '🏗️', 
      name: 'Civil Engineering', 
      description: 'Infrastructure & construction technology', 
      students: 85, 
      teachers: 5, 
      color: '#3B82F6',
      hod: 'Dr. Ramesh Kumar',
      facultyList: [
        'Dr. Ramesh Kumar - HOD',
        'Prof. Sunita Sharma',
        'Dr. Vikram Singh',
        'Ms. Priya Verma',
        'Mr. Ajay Kumar'
      ],
      studentList: [
        'YEAR 1: Rahul Sharma, Priya Verma, Aman Kumar, Riya Patel, Vikas Singh, Anjali Joshi (20 students)',
        'YEAR 2: Suresh Kumar, Deepa Singh, Mohit Sharma, Kavita Devi, Arjun Singh, Neha Kumari (25 students)',
        'YEAR 3: Gaurav Verma, Swati Gupta, Ankit Yadav, Pooja Sharma, Vivek Kumar, Shruti Singh (40 students)'
      ]
    },
    { 
      icon: '📱', 
      name: 'Electronics Engineering', 
      description: 'Electronic systems & circuits', 
      students: 75, 
      teachers: 5, 
      color: '#8B5CF6',
      hod: 'Dr. Ashok Menon',
      facultyList: [
        'Dr. Ashok Menon - HOD',
        'Prof. Deepa Krishnan',
        'Dr. Ravi Pillai',
        'Ms. Kavita Joshi',
        'Mr. Sunil Sharma'
      ],
      studentList: [
        'YEAR 1: Arjun Mehta, Sneha Reddy, Karan Malhotra, Divya Agarwal (25 students)',
        'YEAR 2: Rajesh Kumar, Pooja Nair, Mohit Tiwari, Sanjana Das (25 students)',
        'YEAR 3: Akhil Pillai, Deepika Rao, Siddharth Iyer, Meera Subramanian (25 students)'
      ]
    },
    { 
      icon: '💻', 
      name: 'Information Technology', 
      description: 'Computer systems & networking', 
      students: 95, 
      teachers: 4, 
      color: '#10B981',
      hod: 'Mr. Govind thuwal',
      facultyList: [
        'Mr. Govind thuwal - HOD',
        'Lecturer Mayank Bisht',
        'Lecturer Ms. Kiran Chandra',
        'Lecturer Harsita Rai Bagoli'
      ],
      studentList: [
        'YEAR 1: Rajesh Kumar, Pooja Nair, Mohit Tiwari, Sanjana Das, Ravi Kumar (30 students)',
        'YEAR 2: Akhil Pillai, Deepika Rao, Siddharth Iyer, Meera Subramanian, Gaurav Nair (30 students)',
        'YEAR 3: Aditya Sharma, Sunita Desai, Rohan Patel, Priya Singh, Jayesh Modi (35 students)'
      ]
    },
    { 
      icon: '💊', 
      name: 'Pharmacy', 
      description: 'Pharmaceutical sciences', 
      students: 88, 
      teachers: 5, 
      color: '#F59E0B',
      hod: 'Dr. Lakshmi Pillai',
      facultyList: [
        'Dr. Lakshmi Pillai - HOD',
        'Prof. Srinivas Rao',
        'Dr. Anjali Menon',
        'Ms. Radha Iyer',
        'Mr. Rahul Verma'
      ],
      studentList: [
        'YEAR 1: Akhil Pillai, Deepika Rao, Siddharth Iyer, Meera Subramanian (28 students)',
        'YEAR 2: Aditya Sharma, Sunita Desai, Rohan Patel, Priya Singh (30 students)',
        'YEAR 3: Vivek Kumar, Shruti Singh, Ankit Yadav, Pooja Sharma (30 students)'
      ]
    },
    { 
      icon: '🔧', 
      name: 'Mechanical Engineering', 
      description: 'Design & manufacturing', 
      students: 78, 
      teachers: 4, 
      color: '#EF4444',
      hod: 'Dr. Prabhu Modi',
      facultyList: [
        'Dr. Prabhu Modi - HOD',
        'Prof. Swati Reddy',
        'Dr. Rajesh Kumar',
        'Ms. Kavya Sharma'
      ],
      studentList: [
        'YEAR 1: Aditya Sharma, Sunita Desai, Rohan Patel, Priya Singh (25 students)',
        'YEAR 2: Vivek Kumar, Shruti Singh, Ankit Yadav, Pooja Sharma (25 students)',
        'YEAR 3: Arjun Singh, Neha Kumari, Gaurav Verma, Swati Gupta (28 students)'
      ]
    }
  ];

  // GPL Lohaghat Gallery - Actual College Photos
  // College/campus themed photos for slide gallery
  const defaultGallery = [
    // Main Campus Building - Aerial View
    'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // College Entrance with Library Theme
    'https://images.pexels.com/photos/159775/library-adult-reading-students-159775.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // Modern Classroom Building
    'https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // Campus Library Interior
    'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // Students Studying Together
    'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // Laboratory/Workshop Facility
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // Campus Study Area
    'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
    // Engineering Workshop
    'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop'
  ];
  
  // Local images fallback
  const localImages = [];

  const [gallery, setGallery] = useState(defaultGallery);

  // Default Features Data (Fallback) - No portal mentions, no clickable links
  const defaultFeatures = [
    { icon: '📚', title: 'Quality Education', description: 'Industry-relevant curriculum with hands-on training for real-world success.', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { icon: '💼', title: 'Placement Support', description: '55% placement success rate with top companies and dedicated placement cell.', bg: 'linear-gradient(135deg, #10b981, #059669)' },
    { icon: '🏗️', title: 'Modern Labs', description: 'State-of-the-art laboratories with latest equipment and technology.', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { icon: '🎓', title: 'Expert Faculty', description: 'Experienced faculty from industry and academia with proven track record.', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { icon: '📖', title: 'Digital Library', description: 'Access thousands of e-books and journals online anytime, anywhere.', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { icon: '🚀', title: 'Innovation Hub', description: 'Cutting-edge research facilities and innovation centers for students.', bg: 'linear-gradient(135deg, #ef4444, #dc2626)' }
  ];

  // Placement Details (can be added to database later if needed)
  const placementDetails = {
    percentage: 55,
    companies: ['TCS', 'Infosys', 'Wipro', 'L&T Construction', 'Tata Motors', 'Tech Mahindra'],
    packages: 'INR 2.5 LPA - 6 LPA',
    sectors: ['IT Services', 'Manufacturing', 'Pharmaceuticals', 'Construction', 'Automotive']
  };

  // Default Events Data (Fallback)
  const defaultEvents = [
    { date: '12 Nov', title: 'Hackathon 2025', time: '09:00 AM', location: 'Auditorium', description: '48-hour coding challenge with exciting prizes and industry recognition.' },
    { date: '20 Nov', title: 'IoT Workshop', time: '10:00 AM', location: 'ECE Lab', description: 'Hands-on workshop with sensors, microcontrollers, and cloud integration.' },
    { date: '05 Dec', title: 'Career Fair', time: '09:30 AM', location: 'Sports Complex', description: 'Meet top recruiters and alumni mentors in our annual career fair.' }
  ];

  useEffect(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // Animate stats on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setShowStats(true);
        }
      });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    // Animate cards on scroll
    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setAnimateCards(true);
        }
      });
    }, { threshold: 0.2 });

    const cardsSection = document.getElementById('departments');
    if (cardsSection) {
      cardsObserver.observe(cardsSection);
    }

    // API Base URL
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Load gallery images from backend API
    const loadGallery = async () => {
      try {
        const apiResponse = await fetch(`${API_BASE_URL}/api/gallery`);
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData.success && apiData.data && Array.isArray(apiData.data) && apiData.data.length > 0) {
            setGallery(apiData.data);
            return;
          } else {
            // silent fallback to other sources
          }
        } else {
          // non-OK response, will fallback
        }
      } catch (apiError) {
        // API fetch failed, try local file fallback next
      }

      // Fallback to local JSON file
      try {
        const response = await fetch('/images/gallery.json');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length) {
            setGallery(data);
            return;
          }
        }
      } catch (fileError) {
        // Local file fetch failed, will fallback to default gallery
      }

      // Final fallback to default gallery
      setGallery(defaultGallery);
    };

    // Load all homepage data from backend API (single call for efficiency)
    const loadHomepageData = async () => {
      try {
        // Try fetching all data in one call
        const apiResponse = await fetch(`${API_BASE_URL}/api/homepage/all`);
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          if (apiData.success && apiData.data) {
            // Set departments
            if (apiData.data.departments && Array.isArray(apiData.data.departments) && apiData.data.departments.length > 0) {
              setDepartments(apiData.data.departments);
            } else {
              setDepartments(defaultDepartments);
            }
            
            // Set features - filter out portal-related content and invalid icons
            if (apiData.data.features && Array.isArray(apiData.data.features) && apiData.data.features.length > 0) {
              const filteredFeatures = apiData.data.features
                .filter(f => 
                  !f.title?.toLowerCase().includes('portal') && 
                  !f.description?.toLowerCase().includes('portal') &&
                  f.icon && !f.icon.includes('?') && f.icon.trim() !== ''
                )
                .map(f => ({
                  ...f,
                  icon: f.icon || '✨' // Ensure valid icon
                }));
              setFeatures(filteredFeatures.length > 0 ? filteredFeatures : defaultFeatures);
            } else {
              setFeatures(defaultFeatures);
            }
            
            // Set events
            if (apiData.data.events && Array.isArray(apiData.data.events) && apiData.data.events.length > 0) {
              setEvents(apiData.data.events);
            } else {
              setEvents(defaultEvents);
            }
            
            return;
          }
        }
      } catch (error) {
        // If all-data endpoint fails, try individual endpoints below
      }

      // Fallback: Try individual endpoints
      try {
        const deptResponse = await fetch(`${API_BASE_URL}/api/homepage/departments`);
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          if (deptData.success && deptData.data && deptData.data.length > 0) {
            setDepartments(deptData.data);
          } else {
            setDepartments(defaultDepartments);
          }
        } else {
          setDepartments(defaultDepartments);
        }
      } catch (e) {
        setDepartments(defaultDepartments);
      }

      try {
        const featResponse = await fetch(`${API_BASE_URL}/api/homepage/features`);
        if (featResponse.ok) {
          const featData = await featResponse.json();
          if (featData.success && featData.data && featData.data.length > 0) {
            // Filter out portal-related content and invalid icons
            const filteredFeatures = featData.data
              .filter(f => 
                !f.title?.toLowerCase().includes('portal') && 
                !f.description?.toLowerCase().includes('portal') &&
                f.icon && !f.icon.includes('?') && f.icon.trim() !== ''
              )
              .map(f => ({
                ...f,
                icon: f.icon || '✨' // Ensure valid icon
              }));
            setFeatures(filteredFeatures.length > 0 ? filteredFeatures : defaultFeatures);
          } else {
            setFeatures(defaultFeatures);
          }
        } else {
          setFeatures(defaultFeatures);
        }
      } catch (e) {
        setFeatures(defaultFeatures);
      }

      try {
        const evtResponse = await fetch(`${API_BASE_URL}/api/homepage/events`);
        if (evtResponse.ok) {
          const evtData = await evtResponse.json();
          if (evtData.success && evtData.data && evtData.data.length > 0) {
            setEvents(evtData.data);
          } else {
            setEvents(defaultEvents);
          }
        } else {
          setEvents(defaultEvents);
        }
      } catch (e) {
        setEvents(defaultEvents);
      }
    };

    // Load all data from backend
    loadGallery();
    loadHomepageData();

    // Auto-play slideshow
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (gallery?.length || defaultGallery.length));
    }, 5000);

    return () => {
      observer.disconnect();
      cardsObserver.disconnect();
      clearInterval(slideInterval);
    };
  }, []);

  return (
    <div className="home-page-smart">
      {/* Hero Section - Ultra Modern */}
      <section className="hero-smart">
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i % 4}`} />
          ))}
        </div>
        <div className="hero-content-smart">
          <div className="hero-badge-smart">
            <span className="pulse-dot"></span>
            Established 1975 · Government Polytechnic
          </div>
          <h1 className="hero-title-smart">
            <span className="gradient-text">Smart Campus</span>
            <br />
            <span className="gradient-text">Smart Future</span>
          </h1>
          <p className="hero-desc-smart">
            Empowering tomorrow's engineers with cutting-edge technology and excellence in technical education
          </p>
          <div className="hero-buttons-smart">
            <a href="#departments" className="btn-smart btn-primary-smart">
              <span>Explore Programs</span>
              <span className="btn-icon">→</span>
            </a>
            <a href="/contact" className="btn-smart btn-secondary-smart">
              <span>Contact Us</span>
              <span className="btn-icon">📞</span>
            </a>
          </div>
          {/* Hero mini-stats removed */}
        </div>
      </section>

      {/* Notes Board Section - Public Notices */}
      <section className="notes-board-section">
        <div className="container-smart">
          <NotesBoard />
        </div>
      </section>

      {/* Campus Gallery (Slideshow) */}
      <section className="gallery-smart">
        <div className="container-smart">
          <div className="section-header-smart">
            <span className="section-badge-smart">Campus Gallery</span>
            <h2 className="section-title-smart">Moments from GPL Lohaghat</h2>
          </div>
          <div className="slider-smart" role="region" aria-label="Campus Gallery">
            <div className="slides-smart">
              {gallery.map((src, i) => (
                <div 
                  key={i} 
                  className={`slide-smart ${i === currentSlide ? 'active' : ''}`}
                >
                  <img 
                    src={src} 
                    alt={`GPL Lohaghat Campus Photo ${i+1}`} 
                    loading="lazy"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { 
                      // Fallback for failed image load
                      e.target.onerror = null; // Prevent infinite loop
                      // Try Picsum as fallback
                      e.target.src = `https://picsum.photos/1200/600?random=${i}`;
                      e.target.onerror = function() {
                        // Final fallback - colored placeholder
                        this.onerror = null;
                        this.style.display = 'none';
                        const parent = this.parentElement;
                        if (parent && !parent.querySelector('.gallery-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'gallery-placeholder';
                          placeholder.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;padding:2rem;text-align:center;';
                          placeholder.innerHTML = `
                            <div style="font-size:4rem;margin-bottom:1rem;">🏛️</div>
                            <div style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;">Government Polytechnic Lohaghat</div>
                            <div style="font-size:1rem;opacity:0.9;">Photo ${i+1} - Loading...</div>
                          `;
                          parent.appendChild(placeholder);
                        }
                      };
                    }}
                    onLoad={(e) => {
                      const parent = e.target.parentElement;
                      const placeholder = parent?.querySelector('.gallery-placeholder');
                      if (placeholder) placeholder.remove();
                    }}
                  />
                </div>
              ))}
            </div>

            <button 
              className="arrow-btn arrow-prev" 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length)}
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button 
              className="arrow-btn arrow-next" 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % gallery.length)}
              aria-label="Next slide"
            >
              ›
            </button>

            <div className="controls-smart">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  className={`dot-btn ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i+1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments Showcase */}
      <section id="departments" className="departments-smart">
        <div className="container-smart">
          <div className="section-header-smart">
            <span className="section-badge-smart">Academic Programs</span>
            <h2 className="section-title-smart">Explore Departments</h2>
            <p className="section-desc-smart">5 specialized diploma programs across diverse engineering fields</p>
          </div>
          <div className="departments-grid-smart">
            {(departments.length > 0 ? departments : defaultDepartments).map((dept, idx) => (
              <DeptCard key={idx} dept={dept} idx={idx} animateCards={animateCards} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-smart">
        <div className="container-smart">
          <div className="section-header-smart">
            <span className="section-badge-smart">Campus Features</span>
            <h2 className="section-title-smart">Why Choose Us</h2>
            <p className="section-desc-smart">State-of-the-art facilities designed for student success</p>
          </div>
          <div className="features-grid-smart">
            {(features.length > 0 ? features.filter(f => !f.title?.toLowerCase().includes('portal') && !f.description?.toLowerCase().includes('portal')) : defaultFeatures.filter(f => !f.title?.toLowerCase().includes('portal') && !f.description?.toLowerCase().includes('portal'))).map((feature, idx) => {
              // Remove all clickable links - just display cards
              // Ensure icon is valid - filter out question marks or invalid icons
              const validIcon = feature.icon && !feature.icon.includes('?') && feature.icon.trim() !== '' 
                ? feature.icon 
                : '✨'; // Default fallback icon
              
              return (
                <div key={idx} className="feature-card-smart" style={{ background: feature.bg }}>
                  <div className="feature-icon-smart">{validIcon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Placement Section */}
      <section className="placement-section-smart">
        <div className="container-smart">
          <div className="section-header-smart">
            <span className="section-badge-smart">Placements</span>
            <h2 className="section-title-smart">Career Opportunities</h2>
            <p className="section-desc-smart">Connecting students with leading companies</p>
          </div>
          <div className="placement-stats-smart">
            <div className="placement-stat-card">
              <div className="placement-percentage">{placementDetails.percentage}%</div>
              <div className="placement-label">Placement Rate</div>
              <div className="placement-details">
                <div className="placement-detail">
                  <span>💰 Package:</span>
                  <span>{placementDetails.packages}</span>
                </div>
                <div className="placement-detail">
                  <span>🏢 Companies:</span>
                  <span>{placementDetails.companies.join(', ')}</span>
                </div>
                <div className="placement-detail">
                  <span>🏭 Sectors:</span>
                  <span>{placementDetails.sectors.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-smart">
        <div className="container-smart">
          <div className="section-header-smart">
            <span className="section-badge-smart">Upcoming Events</span>
            <h2 className="section-title-smart">What's Happening</h2>
            <p className="section-desc-smart">Join us for exciting events and workshops</p>
          </div>
          <div className="events-grid-smart">
            {(events.length > 0 ? events : defaultEvents).map((event, idx) => (
              <div key={idx} className="event-card-smart">
                <div className="event-date-smart">
                  <span className="date-num">{event.date}</span>
                  <span className="event-time">{event.time}</span>
                </div>
                <div className="event-content-smart">
                  <h3>{event.title}</h3>
                  <p className="event-loc">{event.location}</p>
                  <p className="event-desc">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-smart">
        <div className="container-smart">
          <div className="cta-content-smart">
            <h2 className="cta-title-smart">Ready to Start Your Journey?</h2>
            <p className="cta-desc-smart">Join hundreds of students building their future at Government Polytechnic, Lohaghat</p>
            <div className="cta-buttons-smart">
              <a href="/auth" className="btn-cta-primary">Apply Now</a>
              <a href="/contact" className="btn-cta-secondary">Get More Info</a>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Notice Popup - Shows important notices automatically */}
      <SmartNoticePopup />
    </div>
  );
};

export default Home;
