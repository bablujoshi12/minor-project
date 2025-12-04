import React from 'react';
import './DepartmentDetails.css';

const DepartmentDetails = ({ department, onClose }) => {
  const departments = {
    'Civil Engineering': {
      hod: 'Mr. Govind Ballabh',
      teachers: [
        'Dr. Ramesh Kumar (HOD)',
        'Prof. Sunita Sharma',
        'Dr. Vikram Singh'
      ],
      students: [
        'Rahul Sharma', 'Priya Verma', 'Aman Kumar', 'Riya Patel', 'Vikas Singh',
        'Anjali Joshi', 'Aditya Nair', 'Sneha Reddy', 'Mohit Gupta', 'Kavya Menon',
        'Rajesh Patel', 'Divya Das', 'Siddharth Iyer', 'Meera Subramanian', 'Gaurav Nair',
        'Preeti Krishnan', 'Karan Mehta', 'Anushka Rao', 'Rohan Pillai', 'Deepika Joshi',
        'Akash Modi', 'Nisha Sharma', 'Arjun Verma', 'Sanjana Patel'
      ],
      totalStudents: 24,
      totalTeachers: 3
    },
    'Electronics Engineering': {
      hod: 'Mr. Anil Rautela',
      teachers: [
        'Dr. Ashok Menon (HOD)',
        'Prof. Deepa Krishnan',
        'Dr. Ravi Pillai',
        'Ms. Kavita Joshi'
      ],
      students: [
        'Arjun Mehta', 'Sneha Reddy', 'Karan Malhotra', 'Divya Agarwal', 'Akash Gupta',
        'Nisha Sharma', 'Rajesh Kumar', 'Pooja Nair', 'Mohit Tiwari', 'Sanjana Das',
        'Ravi Kumar', 'Kavya Menon', 'Vikram Singh', 'Anjali Verma', 'Rohan Patel',
        'Priya Singh', 'Jayesh Modi', 'Anushka Reddy', 'Siddharth Rao', 'Meera Desai'
      ],
      totalStudents: 20,
      totalTeachers: 4
    },
    'Information Technology': {
      hod: 'Dr. Pradeep Kumar',
      teachers: [
        'Dr. Neeraj Verma (HOD)',
        'Dr. Ravi Sharma (Sir)',
        'Ms. Kavita Das (Madam)',
        'Ms. Priya Verma (Madam)'
      ],
      students: [
        'Rajesh Kumar', 'Pooja Nair', 'Mohit Tiwari', 'Sanjana Das', 'Ravi Kumar',
        'Kavya Menon', 'Aman Kumar', 'Riya Patel', 'Siddharth Iyer', 'Meera Subramanian',
        'Gaurav Nair', 'Preeti Krishnan', 'Vikram Singh', 'Anjali Verma', 'Arjun Mehta',
        'Sneha Reddy', 'Karan Malhotra', 'Divya Agarwal', 'Akash Gupta', 'Nisha Sharma',
        'Rohan Patel', 'Priya Singh', 'Aditya Kumar'
      ],
      totalStudents: 23,
      totalTeachers: 4
    },
    'Pharmacy': {
      hod: 'Dr. Sarita Joshi',
      teachers: [
        'Dr. Lakshmi Pillai (HOD)',
        'Prof. Srinivas Rao',
        'Dr. Anjali Menon',
        'Ms. Radha Iyer'
      ],
      students: [
        'Akhil Pillai', 'Deepika Rao', 'Siddharth Iyer', 'Meera Subramanian', 'Gaurav Nair',
        'Preeti Krishnan', 'Rajesh Kumar', 'Pooja Nair', 'Mohit Tiwari', 'Sanjana Das',
        'Ravi Kumar', 'Kavya Menon', 'Vikram Singh', 'Anjali Verma', 'Arjun Mehta',
        'Sneha Reddy', 'Karan Malhotra', 'Divya Agarwal', 'Akash Gupta', 'Nisha Sharma',
        'Rohan Patel', 'Priya Singh'
      ],
      totalStudents: 22,
      totalTeachers: 4
    },
    'Mechanical Engineering': {
      hod: 'Mr. Suresh Kumar',
      teachers: [
        'Dr. Prabhu Modi (HOD)',
        'Prof. Swati Reddy',
        'Dr. Rajesh Kumar',
        'Ms. Kavya Sharma'
      ],
      students: [
        'Aditya Sharma', 'Sunita Desai', 'Rohan Patel', 'Priya Singh', 'Jayesh Modi',
        'Anushka Reddy', 'Vikram Singh', 'Anjali Verma', 'Arjun Mehta', 'Sneha Reddy',
        'Karan Malhotra', 'Divya Agarwal', 'Akash Gupta', 'Nisha Sharma', 'Rajesh Kumar',
        'Pooja Nair', 'Mohit Tiwari', 'Sanjana Das', 'Ravi Kumar', 'Kavya Menon',
        'Siddharth Iyer', 'Meera Subramanian', 'Gaurav Nair', 'Preeti Krishnan', 'Aman Kumar'
      ],
      totalStudents: 25,
      totalTeachers: 4
    }
  };

  const dept = departments[department];

  if (!dept) return null;

  return (
    <div className="dept-details-overlay" onClick={onClose}>
      <div className="dept-details-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2>{department} Department</h2>
        
        <div className="dept-info">
          <div className="info-box">
            <h3>👨‍🎓 Head of Department</h3>
            <p>{dept.hod}</p>
          </div>
          
          <div className="info-box">
            <h3>👨‍🏫 Faculty Members</h3>
            <div className="teachers-list">
              {dept.teachers.map((teacher, idx) => (
                <div key={idx} className="teacher-item">{teacher}</div>
              ))}
            </div>
            <p className="count">Total Teachers: {dept.totalTeachers}</p>
          </div>
          
          <div className="info-box">
            <h3>📚 Students List</h3>
            <div className="students-grid">
              {dept.students.map((student, idx) => (
                <div key={idx} className="student-item">{student}</div>
              ))}
            </div>
            <p className="count">Total Students: {dept.totalStudents}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetails;

