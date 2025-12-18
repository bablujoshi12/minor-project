import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const to = 'vlogsnature05@gmail.com';
    const subject = encodeURIComponent(`New inquiry from ${formData.name}`);
    const body = encodeURIComponent(`From: ${formData.name} <${formData.email}>\n\n${formData.message}`);

    // Try Gmail compose first
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    const opened = window.open(gmailUrl, '_blank');

    // Fallback to mailto if popup blocked or Gmail not available
    if (!opened) {
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    }

    setSubmitted(true);
  };

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <h1>Contact Government Polytechnic, Lohaghat</h1>
        <p>Have questions? Reach out to us. We're here to help.</p>
      </section>

      <div className="contact-grid">
        <div className="contact-card form-card">
          <h2>Send us a message</h2>
          {!submitted ? (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">Submit</button>
            </form>
          ) : (
            <div className="thankyou">
              <div className="tick">✓</div>
              <h3>Thank you! Your message has been received.</h3>
              <p>We will get back to you shortly.</p>
            </div>
          )}
        </div>

        <div className="contact-card info-card">
          <div className="maps-container">
            <div className="map-section standard-map-section">
              <div className="map-section-header">
                <h3>📍 Standard Map</h3>
              </div>
              <div className="standard-map-wrapper">
                <a 
                  href="https://www.google.com/maps/place/Government+Polytechnic,+Lohaghat/@29.4160459,80.0751718,17z/data=!3m1!4b1!4m6!3m5!1s0x39a0e144ed745887:0x14a46f9bd107fd96!8m2!3d29.4160459!4d80.0777467!16s%2Fg%2F11h79sq99y?entry=ttu&g_ep=EgoyMDI1MTAyNi4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3490.456789!2d80.0777467!3d29.4160459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a0e144ed745887%3A0x14a46f9bd107fd96!2sGovernment%20Polytechnic%2C%20Lohaghat!5e0!3m2!1sen!2sin!4v1708900000000!5m2!1sen!2sin"
                    width="100%"
                    height="500"
                    style={{border: 0, borderRadius: '12px'}}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Government Polytechnic, Lohaghat Map"
                  ></iframe>
                  <div className="map-overlay">
                    <div className="map-overlay-content">
                      <h3>📍 Government Polytechnic, Lohaghat</h3>
                      <p>Click to open in Google Maps</p>
                      <div className="map-link-btn">Open in Google Maps →</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

          </div>

          <h2 style={{marginTop: '2rem'}}>Campus Information</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <strong>Address</strong>
                <p>Government Polytechnic, Lohaghat, Champawat, Uttarakhand, 262524</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">☎️</span>
              <div>
                <strong>Phone</strong>
                <p>+91-5946-XXXXX</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <p>info@gplohaghat.ac.in</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏰</span>
              <div>
                <strong>Office Hours</strong>
                <p>Mon - Sat: 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
