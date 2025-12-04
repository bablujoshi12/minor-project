import React from 'react';
import './ServicesModal.css';

const ServicesModal = ({ service, onClose }) => {
  const servicesData = {
    'Library Services': {
      icon: '📚',
      title: 'Library Services',
      description: 'Comprehensive library resources for academic excellence',
      details: [
        {
          title: '📖 Resources',
          info: [
            '50,000+ Printed Books',
            '2,000+ E-books',
            '100+ National & International Journals',
            'Research Papers & Publications',
            'Previous Year Question Papers'
          ]
        },
        {
          title: '💻 Digital Access',
          info: [
            '24/7 Online Library Portal',
            'Digital Repositories',
            'Remote Access to E-resources',
            'OPAC (Online Public Access Catalogue)',
            'Plagiarism Check Software'
          ]
        },
        {
          title: '🏢 Facilities',
          info: [
            'Reading Rooms (Capacity: 150)',
            'Study Cubicles',
            'Group Discussion Area',
            'Computer Lab (40 Systems)',
            'Wi-Fi Enabled'
          ]
        },
        {
          title: '🕐 Timings',
          info: [
            'Monday to Saturday: 9:00 AM - 6:00 PM',
            'Sunday: Closed',
            'During Exams: Extended Hours'
          ]
        }
      ],
      contact: {
        librarian: 'Mrs. Sunita Sharma',
        phone: '+91-5946-XXXXX',
        email: 'library@gplohaghat.ac.in',
        location: '2nd Floor, Main Building'
      }
    },
    'Placement Services': {
      icon: '💼',
      title: 'Placement Services',
      description: 'Connecting students with leading companies for successful careers',
      details: [
        {
          title: '📊 Placement Stats',
          info: [
            'Success Rate: 55%',
            'Average Package: ₹3.5 LPA',
            'Highest Package: ₹6 LPA',
            'Total Companies: 25+',
            'Regular Campus Drives'
          ]
        },
        {
          title: '🏢 Top Recruiters',
          info: [
            'TCS - Technology Services',
            'Infosys - IT Solutions',
            'Wipro - Business Solutions',
            'L&T - Construction',
            'Tata Motors - Automotive',
            'Tech Mahindra - Digital Services'
          ]
        },
        {
          title: '🎯 Services Offered',
          info: [
            'Career Counseling Sessions',
            'Resume Building Workshops',
            'Mock Interview Preparation',
            'Aptitude Test Training',
            'Technical Skills Development'
          ]
        },
        {
          title: '📈 Training Programs',
          info: [
            'Summer Internship Assistance',
            'Industry Visits',
            'Guest Lectures from Experts',
            'Soft Skills Development',
            'Professional Development Sessions'
          ]
        }
      ],
      contact: {
        placementOfficer: 'Mr. Rajesh Kumar',
        phone: '+91-5946-XXXXX',
        email: 'placement@gplohaghat.ac.in',
        location: 'Ground Floor, Administration Block'
      }
    },
    'Medical Facilities': {
      icon: '🏥',
      title: 'Medical Facilities',
      description: 'Comprehensive healthcare services for students and staff',
      details: [
        {
          title: '🏥 Medical Center',
          info: [
            'Fully equipped clinic with doctor',
            'First Aid services available',
            'Emergency medical assistance',
            'Regular health checkups',
            'Medical records maintenance'
          ]
        },
        {
          title: '👨‍⚕️ Healthcare Services',
          info: [
            'Consultation with qualified doctor',
            'Basic treatment & medicines',
            'Health monitoring',
            'Vaccination programs',
            'Mental health counseling'
          ]
        },
        {
          title: '💊 Support Services',
          info: [
            'Ambulance service available',
            'Tie-up with local hospitals',
            'Medical insurance guidance',
            'Health awareness programs',
            'NSS health camps'
          ]
        },
        {
          title: '📋 Health Programs',
          info: [
            'Annual Health Checkups',
            'Blood Donation Camps',
            'AIDS Awareness Programs',
            'Dental Checkup Camps',
            'Yoga & Wellness Sessions'
          ]
        }
      ],
      contact: {
        doctor: 'Dr. Priya Verma',
        phone: '+91-5946-XXXXX',
        email: 'medical@gplohaghat.ac.in',
        location: 'Medical Block, Near Canteen'
      }
    }
  };

  const data = servicesData[service];

  if (!data) return null;

  return (
    <div className="services-modal-overlay" onClick={onClose}>
      <div className="services-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="services-modal-close" onClick={onClose}>×</button>
        
        <div className="services-modal-header">
          <div className="service-modal-icon">{data.icon}</div>
          <div>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
          </div>
        </div>

        <div className="services-modal-body">
          {data.details.map((section, idx) => (
            <div key={idx} className="service-detail-section">
              <h3>{section.title}</h3>
              <ul>
                {section.info.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="services-modal-footer">
          <div className="service-contact-info">
            <h4>📞 Contact Information</h4>
            <div className="contact-details">
              <p><strong>{data.contact.doctor || data.contact.librarian || data.contact.placementOfficer}</strong></p>
              <p>📞 {data.contact.phone}</p>
              <p>✉️ {data.contact.email}</p>
              <p>📍 {data.contact.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;





