import React, { useState } from 'react';
import './About.css';
import DepartmentDetails from './DepartmentDetails';
import ServicesModal from './ServicesModal';

const Services = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Our Institution</h1>
        <p>Empowering Students with Knowledge, Skills, and Values</p>
      </section>

      <section className="vision-mission">
        <div className="vm-card vision-card">
          <div className="vm-icon">🎯</div>
          <h2>Our Vision</h2>
          <p>To become a premier technical institution that produces globally competitive engineers and innovators.</p>
        </div>
        <div className="vm-card mission-card">
          <div className="vm-icon">🚀</div>
          <h2>Our Mission</h2>
          <p>To provide quality technical education through innovative teaching and industry partnerships.</p>
        </div>
      </section>

      <section className="departments-section">
        <h2 className="section-title">Our Departments</h2>
        <div className="departments-grid">
          <div className="department-card" onClick={() => setSelectedDept('Civil Engineering')} style={{cursor: 'pointer'}}>
            <div className="dept-icon">🏗️</div>
            <h3>Civil Engineering</h3>
            <p>Infrastructure development and construction technology.</p>
          </div>
          <div className="department-card" onClick={() => setSelectedDept('Electronics Engineering')} style={{cursor: 'pointer'}}>
            <div className="dept-icon">📱</div>
            <h3>Electronics Engineering</h3>
            <p>Electronic systems, embedded systems and circuits.</p>
          </div>
          <div className="department-card" onClick={() => setSelectedDept('Information Technology')} style={{cursor: 'pointer'}}>
            <div className="dept-icon">💻</div>
            <h3>Information Technology</h3>
            <p>Computer systems, networking, and software development.</p>
          </div>
          <div className="department-card" onClick={() => setSelectedDept('Pharmacy')} style={{cursor: 'pointer'}}>
            <div className="dept-icon">💊</div>
            <h3>Pharmacy</h3>
            <p>Pharmaceutical sciences, drug formulation, and health care.</p>
          </div>
          <div className="department-card" onClick={() => setSelectedDept('Mechanical Engineering')} style={{cursor: 'pointer'}}>
            <div className="dept-icon">🔧</div>
            <h3>Mechanical Engineering</h3>
            <p>Design, manufacturing, and automation systems.</p>
          </div>
        </div>
      </section>
      
      {selectedDept && <DepartmentDetails department={selectedDept} onClose={() => setSelectedDept(null)} />}

      <section className="services-section">
        <h2 className="section-title">Campus Services</h2>
        <div className="services-grid">
          <div className="service-card" onClick={() => setSelectedService('Library Services')} style={{cursor: 'pointer'}}>
            <div className="service-icon">📚</div>
            <h3>Library Services</h3>
            <ul>
              <li>Extensive collection of books & journals</li>
              <li>Digital library access</li>
              <li>24/7 online resources</li>
            </ul>
            <div className="service-click-hint">Click for more details →</div>
          </div>
          <div className="service-card" onClick={() => setSelectedService('Placement Services')} style={{cursor: 'pointer'}}>
            <div className="service-icon">💼</div>
            <h3>Placement Services</h3>
            <ul>
              <li>Career counseling</li>
              <li>Industry connections</li>
              <li>Mock interviews & workshops</li>
            </ul>
            <div className="service-click-hint">Click for more details →</div>
          </div>
          <div className="service-card" onClick={() => setSelectedService('Medical Facilities')} style={{cursor: 'pointer'}}>
            <div className="service-icon">🏥</div>
            <h3>Medical Facilities</h3>
            <ul>
              <li>On-campus clinic</li>
              <li>First aid services</li>
              <li>Health awareness programs</li>
            </ul>
            <div className="service-click-hint">Click for more details →</div>
          </div>
        </div>
      </section>
      
      {selectedService && <ServicesModal service={selectedService} onClose={() => setSelectedService(null)} />}
    </div>
  );
};

export default Services;
