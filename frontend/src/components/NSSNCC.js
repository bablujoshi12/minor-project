import React, { useState, useEffect } from 'react';
import './NSSNCC.css';
import api from '../config/api';

const NSSNCC = () => {
  const [activeTab, setActiveTab] = useState('nss'); // 'nss' or 'ncc'
  const [searchTerm, setSearchTerm] = useState('');
  const [nssData, setNssData] = useState([]);
  const [nccData, setNccData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch NSS and NCC data from API
  useEffect(() => {
    loadNSSNCCData();
  }, []);

  const loadNSSNCCData = async () => {
    try {
      setLoading(true);
      const [nssRes, nccRes] = await Promise.all([
        fetch(api.nss.getAll),
        fetch(api.ncc.getAll)
      ]);
      
      const nssResult = await nssRes.json();
      const nccResult = await nccRes.json();
      
      if (nssResult.success) {
        // Transform API data to match component format
        const transformedNss = nssResult.data.map(student => ({
          id: student.registration_id,
          name: student.name,
          location: student.location,
          father: student.father_name,
          mother: student.mother_name,
          program: student.program,
          category: student.category,
          dob: student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-') : '',
          gender: student.gender,
          email: student.email || '',
          phone: student.phone || ''
        }));
        setNssData(transformedNss);
      }
      
      if (nccResult.success) {
        // Transform API data to match component format
        const transformedNcc = nccResult.data.map(student => ({
          id: student.registration_id,
          name: student.name,
          location: student.location,
          father: student.father_name,
          mother: student.mother_name,
          program: student.program,
          category: student.category,
          dob: student.dob ? new Date(student.dob).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-') : '',
          gender: student.gender,
          email: student.email || '',
          phone: student.phone || ''
        }));
        setNccData(transformedNcc);
      }
    } catch (error) {
      console.error('Error loading NSS/NCC data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentData = activeTab === 'nss' ? nssData : nccData;

  const filteredData = currentData.filter(student => {
    const search = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(search) ||
      student.id.toLowerCase().includes(search) ||
      student.location.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      student.program.toLowerCase().includes(search)
    );
  });

  return (
    <div className="nssncc-container">
      <section className="nssncc-hero">
        <h1>NSS & NCC Programs</h1>
        <p>National Service Scheme & National Cadet Corps at GPL Lohaghat</p>
      </section>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'nss' ? 'active' : ''}`}
          onClick={() => setActiveTab('nss')}
        >
          🟢 NSS (National Service Scheme)
        </button>
        <button
          className={`tab-btn ${activeTab === 'ncc' ? 'active' : ''}`}
          onClick={() => setActiveTab('ncc')}
        >
          🎖️ NCC (National Cadet Corps)
        </button>
      </div>

      {/* Info Sections */}
      {activeTab === 'nss' && (
        <section className="info-section">
          <div className="info-card">
            <h2>About NSS (National Service Scheme)</h2>
            <p>The National Service Scheme (NSS) is a Central Sector Scheme of the Government of India, Ministry of Youth Affairs & Sports. It provides opportunity to students to take part in various Government led community service activities & programmes.</p>
            <div className="info-points">
              <h3>Key Objectives:</h3>
              <ul>
                <li>Understand the community in which they work</li>
                <li>Understand themselves in relation to their community</li>
                <li>Identify the needs and problems of the community</li>
                <li>Develop among themselves a sense of social and civic responsibility</li>
                <li>Apply their education to find practical solutions</li>
              </ul>
              <h3>Activities:</h3>
              <ul>
                <li>Blood Donation Camps</li>
                <li>Tree Plantation Drives</li>
                <li>Health Awareness Programs</li>
                <li>Village Cleanliness Campaigns</li>
                <li>Disaster Relief Activities</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'ncc' && (
        <section className="info-section">
          <div className="info-card">
            <h2>About NCC (National Cadet Corps)</h2>
            <p>The National Cadet Corps (NCC) is the largest uniformed youth organization in the world. It aims at developing character, comradeship, discipline, leadership, secular outlook, spirit of adventure, and ideals of selfless service among young citizens.</p>
            <div className="info-points">
              <h3>Key Objectives:</h3>
              <ul>
                <li>Develop character, comradeship, discipline, leadership</li>
                <li>Create a human resource of organized, trained and motivated youth</li>
                <li>Provide leadership in all walks of life</li>
                <li>Provide a suitable environment to motivate the youth to take up a career in the armed forces</li>
              </ul>
              <h3>Activities:</h3>
              <ul>
                <li>Drill & Parade Training</li>
                <li>Adventure Training (Trekking, Mountaineering)</li>
                <li>Weapon Training</li>
                <li>Leadership Camps</li>
                <li>Social Service Activities</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder={`Search ${activeTab.toUpperCase()} students by name, ID, location, email...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="result-count">
          {loading ? 'Loading...' : `${filteredData.length} ${filteredData.length === 1 ? 'student' : 'students'} found`}
        </span>
      </div>

      {/* Student Data Table */}
      <section className="data-section">
        <div className="table-container">
          <table className="student-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>ID/Registration</th>
                <th>Name</th>
                <th>Location</th>
                <th>Father's Name</th>
                <th>Mother's Name</th>
                <th>Program</th>
                <th>Category</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="no-data">
                    Loading students data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="no-data">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredData.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.id}</td>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.location}</td>
                    <td>{student.father}</td>
                    <td>{student.mother}</td>
                    <td><span className="program-badge">{student.program}</span></td>
                    <td><span className="category-badge">{student.category}</span></td>
                    <td>{student.dob}</td>
                    <td>{student.gender === 'M' ? '👨 Male' : '👩 Female'}</td>
                    <td><a href={`mailto:${student.email}`}>{student.email}</a></td>
                    <td><a href={`tel:${student.phone}`}>{student.phone}</a></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-card">
          <h3>Contact NSS/NCC Coordinators</h3>
          <div className="contact-info">
            <div>
              <strong>NSS Program Officer:</strong>
              <p>Prof. Sonu Kumar<br />Email: nss@gplohaghat.ac.in<br />Phone: [Contact Number]</p>
            </div>
            <div>
              <strong>NCC Officer:</strong>
              <p>Lt. Vivek Morya<br />Email: ncc@gplohaghat.ac.in<br />Phone: [Contact Number]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NSSNCC;

