import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* About Header */}
      <section className="about-hero">
        <h1>राजकीय पॉलीटेक्निक लोहाघाट</h1>
        <h2>Government Polytechnic Lohaghat</h2>
        <p>Empowering Students with Knowledge, Skills, and Values since 1975</p>
      </section>

      {/* College History */}
      <section className="history-section">
        <div className="history-content">
          <h2 className="section-title">🏛️ Institute History</h2>
          <div className="history-timeline">
            <div className="timeline-item">
              <div className="timeline-year">1975</div>
              <div className="timeline-content">
                <h3>Inception</h3>
                <p>This institution was established in October 1975 in rented buildings at Fernhill in the border district of Pithoragarh. Initially, the institute started with two diploma programs:</p>
                <ul>
                  <li><strong>Civil Engineering Diploma</strong> (3 years) - 30 seats capacity</li>
                  <li><strong>Stenography & Secretarial Practice Diploma</strong> (2 years) - 30 seats capacity</li>
                </ul>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">1984-85</div>
              <div className="timeline-content">
                <h3>Expansion</h3>
                <p>Electrical Engineering Diploma program started with 30 seats capacity.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">1986-87</div>
              <div className="timeline-content">
                <h3>Program Change</h3>
                <p>Electrical Engineering program was replaced with <strong>Electronics Engineering Diploma</strong> program (30 seats).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="vision-mission">
        <div className="vm-card vision-card">
          <div className="vm-icon">🎯</div>
          <h2>Our Vision</h2>
          <p>To be known as an institute for developing proficient and technically expert diploma holders likely to be consumed in various disciplines of their trade.</p>
        </div>
        <div className="vm-card mission-card">
          <div className="vm-icon">🚀</div>
          <h2>Our Mission</h2>
          <div className="mission-points">
            <div className="mission-item">
              <strong>M1 -</strong> To make an atmosphere of creative thinking and personality development.
            </div>
            <div className="mission-item">
              <strong>M2 -</strong> To provide a suitable environment for students to develop effective communication skills and thinking ability.
            </div>
            <div className="mission-item">
              <strong>M3 -</strong> To nurture ethical, competent, and sustainable values in students to make them self-responsible.
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="departments-section">
        <h2 className="section-title">Our Academic Programs</h2>
        <p className="section-subtitle">5 specialized diploma programs with diverse engineering fields</p>
        <div className="departments-grid">
          <div className="department-card">
            <div className="dept-icon">🏗️</div>
            <h3>Diploma in Civil Engineering</h3>
            <p>Infrastructure development, construction technology, and environmental engineering. Capacity: 135 seats</p>
          </div>
          <div className="department-card">
            <div className="dept-icon">📱</div>
            <h3>Diploma in Electronics Engineering</h3>
            <p>Electronic systems, embedded systems, and VLSI design. Capacity: 60 seats</p>
          </div>
          <div className="department-card">
            <div className="dept-icon">💻</div>
            <h3>Diploma in Information Technology</h3>
            <p>Computer systems, networking, and software development. Capacity: 64 seats</p>
          </div>
          <div className="department-card">
            <div className="dept-icon">💊</div>
            <h3>Diploma in Pharmacy</h3>
            <p>Pharmaceutical sciences, drug formulation, and health care. Capacity: 75 seats</p>
          </div>
          <div className="department-card">
            <div className="dept-icon">🔧</div>
            <h3>Diploma in Mechanical Engineering</h3>
            <p>Design, manufacturing, and automation systems. Capacity: Varies</p>
          </div>
        </div>
      </section>

      {/* Location Map */}
      <section className="map-section">
        <h2 className="section-title">Our Location</h2>
        <div className="map-container">
          <a 
            href="https://www.google.com/maps/place/Government+Polytechnic,+Lohaghat/@29.4160459,80.0751718,17z/data=!3m1!4b1!4m6!3m5!1s0x39a0e144ed745887:0x14a46f9bd107fd96!8m2!3d29.4160459!4d80.0777467!16s%2Fg%2F11h79sq99y?entry=ttu&g_ep=EgoyMDI1MTAyNi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="map-link-about"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3490.456789!2d80.0777467!3d29.4160459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a0e144ed745887%3A0x14a46f9bd107fd96!2sGovernment%20Polytechnic%2C%20Lohaghat!5e0!3m2!1sen!2sin!4v1708900000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{border:0, borderRadius: '16px'}}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Government Polytechnic, Lohaghat Location"
            ></iframe>
            <div className="map-overlay-about">
              Click to open in Google Maps →
            </div>
          </a>
        </div>
        <p className="map-address">
          <strong>📍 Address:</strong> Government Polytechnic, Lohaghat, Champawat, Uttarakhand - 262524
        </p>
      </section>

      {/* Services */}
      <section className="services-section">
        <h2 className="section-title">Campus Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📚</div>
            <h3>Library Services</h3>
            <ul>
              <li>Extensive collection of books & journals</li>
              <li>Digital library access</li>
              <li>24/7 online resources</li>
              <li>Reading rooms & study spaces</li>
            </ul>
          </div>
          <div className="service-card">
            <div className="service-icon">💼</div>
            <h3>Placement Services</h3>
            <ul>
              <li>Career counseling</li>
              <li>Industry connections</li>
              <li>Internship opportunities</li>
              <li>Mock interviews & workshops</li>
            </ul>
          </div>
          <div className="service-card">
            <div className="service-icon">🏥</div>
            <h3>Medical Facilities</h3>
            <ul>
              <li>On-campus clinic</li>
              <li>First aid services</li>
              <li>Health awareness programs</li>
              <li>Emergency medical support</li>
            </ul>
          </div>
          <div className="service-card">
            <div className="service-icon">🚌</div>
            <h3>Transportation</h3>
            <ul>
              <li>Campus bus service</li>
              <li>Vehicle parking facility</li>
              <li>Safe transportation</li>
              <li>City connectivity</li>
            </ul>
          </div>
          <div className="service-card">
            <div className="service-icon">🏃</div>
            <h3>Sports & Recreation</h3>
            <ul>
              <li>Sports facilities</li>
              <li>Gymnasium & fitness center</li>
              <li>Annual sports events</li>
              <li>Cultural activities</li>
            </ul>
          </div>
          <div className="service-card">
            <div className="service-icon">💻</div>
            <h3>IT Services</h3>
            <ul>
              <li>High-speed internet</li>
              <li>Computer labs</li>
              <li>E-learning platforms</li>
              <li>Technical support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="facilities-section">
        <h2 className="section-title">Campus Facilities</h2>
        <div className="facilities-list">
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>State-of-the-art laboratories with modern equipment</span>
          </div>
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>Wi-Fi enabled campus with 24/7 internet access</span>
          </div>
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>Central library with 50,000+ books and digital resources</span>
          </div>
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>Auditorium with seating capacity of 500+</span>
          </div>
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>Hostel facilities with modern amenities</span>
          </div>
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>Cafeteria serving nutritious meals</span>
          </div>
          <div className="facility-item">
            <span className="facility-bullet">✓</span>
            <span>Green campus with beautiful landscaping</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

