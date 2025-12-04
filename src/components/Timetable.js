import React, { useState } from 'react';
import './Timetable.css';

const Timetable = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const branches = [
    { id: 'it', name: 'Information Technology', icon: '💻', code: 'IT' },
    { id: 'civil', name: 'Civil Engineering', icon: '🏗️', code: 'CE' },
    { id: 'electronics', name: 'Electronics Engineering', icon: '📱', code: 'ECE' },
    { id: 'mechanical', name: 'Mechanical Engineering', icon: '🔧', code: 'ME' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊', code: 'PH' }
  ];

  // Sample Timetable Data
  const timetableData = {
    it: {
      'First Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Mathematics', teacher: 'Prof. A. Kumar', room: 'IT-101' },
          { time: '10:30-11:30', subject: 'Physics', teacher: 'Prof. B. Singh', room: 'PH-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'C Programming', teacher: 'Prof. C. Verma', room: 'IT-Lab-1' },
          { time: '12:45-1:45', subject: 'English', teacher: 'Prof. D. Joshi', room: 'IT-102' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Workshop', teacher: 'Prof. E. Sharma', room: 'WS-101' },
          { time: '3:45-4:30', subject: 'Practical: C Programming', teacher: 'Prof. C. Verma', room: 'IT-Lab-1' }
        ],
        'Tuesday': [
          { time: '9:30-10:30', subject: 'Chemistry', teacher: 'Prof. F. Patel', room: 'CH-301' },
          { time: '10:30-11:30', subject: 'Mathematics', teacher: 'Prof. A. Kumar', room: 'IT-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Physics Lab', teacher: 'Prof. B. Singh', room: 'PH-Lab' },
          { time: '12:45-1:45', subject: 'Workshop', teacher: 'Prof. E. Sharma', room: 'WS-101' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'English', teacher: 'Prof. D. Joshi', room: 'IT-102' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ],
        'Wednesday': [
          { time: '9:30-10:30', subject: 'C Programming', teacher: 'Prof. C. Verma', room: 'IT-101' },
          { time: '10:30-11:30', subject: 'Mathematics', teacher: 'Prof. A. Kumar', room: 'IT-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Chemistry Lab', teacher: 'Prof. F. Patel', room: 'CH-Lab' },
          { time: '12:45-1:45', subject: 'Physics', teacher: 'Prof. B. Singh', room: 'PH-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Practical: C Programming', teacher: 'Prof. C. Verma', room: 'IT-Lab-1' },
          { time: '3:45-4:30', subject: 'Workshop', teacher: 'Prof. E. Sharma', room: 'WS-101' }
        ],
        'Thursday': [
          { time: '9:30-10:30', subject: 'Physics', teacher: 'Prof. B. Singh', room: 'PH-201' },
          { time: '10:30-11:30', subject: 'Chemistry', teacher: 'Prof. F. Patel', room: 'CH-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Mathematics', teacher: 'Prof. A. Kumar', room: 'IT-101' },
          { time: '12:45-1:45', subject: 'C Programming', teacher: 'Prof. C. Verma', room: 'IT-101' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'English', teacher: 'Prof. D. Joshi', room: 'IT-102' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ],
        'Friday': [
          { time: '9:30-10:30', subject: 'Mathematics', teacher: 'Prof. A. Kumar', room: 'IT-101' },
          { time: '10:30-11:30', subject: 'C Programming', teacher: 'Prof. C. Verma', room: 'IT-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Workshop', teacher: 'Prof. E. Sharma', room: 'WS-101' },
          { time: '12:45-1:45', subject: 'Physics', teacher: 'Prof. B. Singh', room: 'PH-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Chemistry', teacher: 'Prof. F. Patel', room: 'CH-301' },
          { time: '3:45-4:30', subject: 'Practical: C Programming', teacher: 'Prof. C. Verma', room: 'IT-Lab-1' }
        ]
      },
      'Second Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Data Structures', teacher: 'Prof. G. Rai', room: 'IT-201' },
          { time: '10:30-11:30', subject: 'Database Management', teacher: 'Prof. H. Bisht', room: 'IT-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'OOPs with C++', teacher: 'Prof. I. Pant', room: 'IT-Lab-2' },
          { time: '12:45-1:45', subject: 'Web Development', teacher: 'Prof. J. Rawat', room: 'IT-202' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Digital Electronics', teacher: 'Prof. K. Singh', room: 'IT-201' },
          { time: '3:45-4:30', subject: 'Practical: Database', teacher: 'Prof. H. Bisht', room: 'IT-Lab-2' }
        ],
        'Tuesday': [
          { time: '9:30-10:30', subject: 'OOPs with C++', teacher: 'Prof. I. Pant', room: 'IT-201' },
          { time: '10:30-11:30', subject: 'Data Structures', teacher: 'Prof. G. Rai', room: 'IT-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Practical: Web Development', teacher: 'Prof. J. Rawat', room: 'IT-Lab-2' },
          { time: '12:45-1:45', subject: 'Database Management', teacher: 'Prof. H. Bisht', room: 'IT-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Digital Electronics Lab', teacher: 'Prof. K. Singh', room: 'IT-Lab-2' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ],
        'Wednesday': [
          { time: '9:30-10:30', subject: 'Web Development', teacher: 'Prof. J. Rawat', room: 'IT-202' },
          { time: '10:30-11:30', subject: 'OOPs with C++', teacher: 'Prof. I. Pant', room: 'IT-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Data Structures Lab', teacher: 'Prof. G. Rai', room: 'IT-Lab-2' },
          { time: '12:45-1:45', subject: 'Database Management', teacher: 'Prof. H. Bisht', room: 'IT-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Digital Electronics', teacher: 'Prof. K. Singh', room: 'IT-201' },
          { time: '3:45-4:30', subject: 'Practical: C++', teacher: 'Prof. I. Pant', room: 'IT-Lab-2' }
        ],
        'Thursday': [
          { time: '9:30-10:30', subject: 'Digital Electronics', teacher: 'Prof. K. Singh', room: 'IT-201' },
          { time: '10:30-11:30', subject: 'Web Development', teacher: 'Prof. J. Rawat', room: 'IT-202' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Data Structures', teacher: 'Prof. G. Rai', room: 'IT-201' },
          { time: '12:45-1:45', subject: 'OOPs with C++', teacher: 'Prof. I. Pant', room: 'IT-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Database Management', teacher: 'Prof. H. Bisht', room: 'IT-201' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ],
        'Friday': [
          { time: '9:30-10:30', subject: 'Data Structures', teacher: 'Prof. G. Rai', room: 'IT-201' },
          { time: '10:30-11:30', subject: 'Database Management', teacher: 'Prof. H. Bisht', room: 'IT-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Web Development', teacher: 'Prof. J. Rawat', room: 'IT-202' },
          { time: '12:45-1:45', subject: 'OOPs with C++', teacher: 'Prof. I. Pant', room: 'IT-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Digital Electronics', teacher: 'Prof. K. Singh', room: 'IT-201' },
          { time: '3:45-4:30', subject: 'Practical: Web Development', teacher: 'Prof. J. Rawat', room: 'IT-Lab-2' }
        ]
      },
      'Third Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Java Programming', teacher: 'Prof. L. Joshi', room: 'IT-301' },
          { time: '10:30-11:30', subject: 'Computer Networks', teacher: 'Prof. M. Pandey', room: 'IT-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Software Engineering', teacher: 'Prof. N. Tiwari', room: 'IT-302' },
          { time: '12:45-1:45', subject: 'Mobile App Development', teacher: 'Prof. O. Negi', room: 'IT-Lab-3' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Project Work', teacher: 'Prof. All', room: 'IT-Lab-3' },
          { time: '3:45-4:30', subject: 'Industrial Training', teacher: 'Prof. All', room: 'IT-Lab-3' }
        ],
        'Tuesday': [
          { time: '9:30-10:30', subject: 'Computer Networks', teacher: 'Prof. M. Pandey', room: 'IT-301' },
          { time: '10:30-11:30', subject: 'Java Programming', teacher: 'Prof. L. Joshi', room: 'IT-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Practical: Java', teacher: 'Prof. L. Joshi', room: 'IT-Lab-3' },
          { time: '12:45-1:45', subject: 'Software Engineering', teacher: 'Prof. N. Tiwari', room: 'IT-302' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Mobile App Development Lab', teacher: 'Prof. O. Negi', room: 'IT-Lab-3' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ],
        'Wednesday': [
          { time: '9:30-10:30', subject: 'Mobile App Development', teacher: 'Prof. O. Negi', room: 'IT-Lab-3' },
          { time: '10:30-11:30', subject: 'Java Programming', teacher: 'Prof. L. Joshi', room: 'IT-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Computer Networks Lab', teacher: 'Prof. M. Pandey', room: 'IT-Lab-3' },
          { time: '12:45-1:45', subject: 'Software Engineering', teacher: 'Prof. N. Tiwari', room: 'IT-302' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Project Work', teacher: 'Prof. All', room: 'IT-Lab-3' },
          { time: '3:45-4:30', subject: 'Practical: Mobile App', teacher: 'Prof. O. Negi', room: 'IT-Lab-3' }
        ],
        'Thursday': [
          { time: '9:30-10:30', subject: 'Computer Networks', teacher: 'Prof. M. Pandey', room: 'IT-301' },
          { time: '10:30-11:30', subject: 'Software Engineering', teacher: 'Prof. N. Tiwari', room: 'IT-302' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Java Programming', teacher: 'Prof. L. Joshi', room: 'IT-301' },
          { time: '12:45-1:45', subject: 'Mobile App Development', teacher: 'Prof. O. Negi', room: 'IT-Lab-3' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Computer Networks', teacher: 'Prof. M. Pandey', room: 'IT-301' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ],
        'Friday': [
          { time: '9:30-10:30', subject: 'Software Engineering', teacher: 'Prof. N. Tiwari', room: 'IT-302' },
          { time: '10:30-11:30', subject: 'Java Programming', teacher: 'Prof. L. Joshi', room: 'IT-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Mobile App Development', teacher: 'Prof. O. Negi', room: 'IT-Lab-3' },
          { time: '12:45-1:45', subject: 'Computer Networks', teacher: 'Prof. M. Pandey', room: 'IT-301' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Project Work', teacher: 'Prof. All', room: 'IT-Lab-3' },
          { time: '3:45-4:30', subject: 'Industrial Training', teacher: 'Prof. All', room: 'IT-Lab-3' }
        ]
      }
    },
    civil: {
      'First Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Mathematics', teacher: 'Prof. A. Kumar', room: 'CE-101' },
          { time: '10:30-11:30', subject: 'Engineering Mechanics', teacher: 'Prof. P. Singh', room: 'CE-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Engineering Drawing', teacher: 'Prof. Q. Verma', room: 'CE-Drawing' },
          { time: '12:45-1:45', subject: 'Physics', teacher: 'Prof. R. Joshi', room: 'PH-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Chemistry', teacher: 'Prof. S. Patel', room: 'CH-301' },
          { time: '3:45-4:30', subject: 'Workshop', teacher: 'Prof. T. Sharma', room: 'WS-101' }
        ]
      },
      'Second Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Strength of Materials', teacher: 'Prof. U. Rai', room: 'CE-201' },
          { time: '10:30-11:30', subject: 'Building Construction', teacher: 'Prof. V. Bisht', room: 'CE-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Surveying', teacher: 'Prof. W. Pant', room: 'CE-202' },
          { time: '12:45-1:45', subject: 'Concrete Technology', teacher: 'Prof. X. Rawat', room: 'CE-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Fluid Mechanics', teacher: 'Prof. Y. Singh', room: 'CE-201' },
          { time: '3:45-4:30', subject: 'Practical: Surveying', teacher: 'Prof. W. Pant', room: 'CE-Lab' }
        ]
      },
      'Third Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Structural Design', teacher: 'Prof. Z. Joshi', room: 'CE-301' },
          { time: '10:30-11:30', subject: 'Highway Engineering', teacher: 'Prof. AA. Pandey', room: 'CE-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Environmental Engineering', teacher: 'Prof. AB. Tiwari', room: 'CE-302' },
          { time: '12:45-1:45', subject: 'Project Work', teacher: 'Prof. All', room: 'CE-Lab' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Industrial Training', teacher: 'Prof. All', room: 'CE-Lab' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ]
      }
    },
    electronics: {
      'First Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Mathematics', teacher: 'Prof. AC. Kumar', room: 'ECE-101' },
          { time: '10:30-11:30', subject: 'Basic Electronics', teacher: 'Prof. AD. Singh', room: 'ECE-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Electrical Circuits', teacher: 'Prof. AE. Verma', room: 'ECE-Lab-1' },
          { time: '12:45-1:45', subject: 'Physics', teacher: 'Prof. AF. Joshi', room: 'PH-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Chemistry', teacher: 'Prof. AG. Patel', room: 'CH-301' },
          { time: '3:45-4:30', subject: 'Practical: Electronics', teacher: 'Prof. AD. Singh', room: 'ECE-Lab-1' }
        ]
      },
      'Second Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Digital Electronics', teacher: 'Prof. AH. Rai', room: 'ECE-201' },
          { time: '10:30-11:30', subject: 'Microcontrollers', teacher: 'Prof. AI. Bisht', room: 'ECE-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Communication Systems', teacher: 'Prof. AJ. Pant', room: 'ECE-202' },
          { time: '12:45-1:45', subject: 'Control Systems', teacher: 'Prof. AK. Rawat', room: 'ECE-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Practical: Microcontrollers', teacher: 'Prof. AI. Bisht', room: 'ECE-Lab-2' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ]
      },
      'Third Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Embedded Systems', teacher: 'Prof. AL. Singh', room: 'ECE-301' },
          { time: '10:30-11:30', subject: 'VLSI Design', teacher: 'Prof. AM. Joshi', room: 'ECE-301' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'IoT & Sensors', teacher: 'Prof. AN. Pandey', room: 'ECE-Lab-3' },
          { time: '12:45-1:45', subject: 'Project Work', teacher: 'Prof. All', room: 'ECE-Lab-3' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Industrial Training', teacher: 'Prof. All', room: 'ECE-Lab-3' },
          { time: '3:45-4:30', subject: 'Practical: Embedded Systems', teacher: 'Prof. AL. Singh', room: 'ECE-Lab-3' }
        ]
      }
    },
    mechanical: {
      'First Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Mathematics', teacher: 'Prof. AO. Kumar', room: 'ME-101' },
          { time: '10:30-11:30', subject: 'Engineering Mechanics', teacher: 'Prof. AP. Singh', room: 'ME-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Engineering Drawing', teacher: 'Prof. AQ. Verma', room: 'ME-Drawing' },
          { time: '12:45-1:45', subject: 'Thermodynamics', teacher: 'Prof. AR. Joshi', room: 'ME-101' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Workshop Practice', teacher: 'Prof. AS. Patel', room: 'WS-101' },
          { time: '3:45-4:30', subject: 'Practical: Workshop', teacher: 'Prof. AS. Patel', room: 'WS-101' }
        ]
      },
      'Second Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Machine Design', teacher: 'Prof. AT. Sharma', room: 'ME-201' },
          { time: '10:30-11:30', subject: 'Manufacturing Processes', teacher: 'Prof. AU. Rai', room: 'ME-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Thermal Engineering', teacher: 'Prof. AV. Bisht', room: 'ME-202' },
          { time: '12:45-1:45', subject: 'Strength of Materials', teacher: 'Prof. AW. Pant', room: 'ME-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Practical: Manufacturing', teacher: 'Prof. AU. Rai', room: 'ME-Lab' },
          { time: '3:45-4:30', subject: 'Library/Study', teacher: '-', room: 'Library' }
        ]
      },
      'Third Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Automobile Engineering', teacher: 'Prof. AX. Rawat', room: 'ME-301' },
          { time: '10:30-11:30', subject: 'CAD/CAM', teacher: 'Prof. AY. Singh', room: 'ME-Lab-3' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Project Work', teacher: 'Prof. All', room: 'ME-Lab-3' },
          { time: '12:45-1:45', subject: 'Industrial Training', teacher: 'Prof. All', room: 'ME-Lab-3' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Power Plant Engineering', teacher: 'Prof. AZ. Joshi', room: 'ME-301' },
          { time: '3:45-4:30', subject: 'Practical: CAD/CAM', teacher: 'Prof. AY. Singh', room: 'ME-Lab-3' }
        ]
      }
    },
    pharmacy: {
      'First Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Pharmaceutics-I', teacher: 'Prof. BA. Kumar', room: 'PH-101' },
          { time: '10:30-11:30', subject: 'Pharmaceutical Chemistry', teacher: 'Prof. BB. Singh', room: 'PH-101' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Pharmacognosy', teacher: 'Prof. BC. Verma', room: 'PH-Lab-1' },
          { time: '12:45-1:45', subject: 'Human Anatomy', teacher: 'Prof. BD. Joshi', room: 'PH-102' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Pharmaceutical Analysis', teacher: 'Prof. BE. Patel', room: 'PH-Lab-1' },
          { time: '3:45-4:30', subject: 'Practical: Pharmaceutics', teacher: 'Prof. BA. Kumar', room: 'PH-Lab-1' }
        ]
      },
      'Second Year': {
        'Monday': [
          { time: '9:30-10:30', subject: 'Pharmaceutics-II', teacher: 'Prof. BF. Sharma', room: 'PH-201' },
          { time: '10:30-11:30', subject: 'Pharmacology', teacher: 'Prof. BG. Rai', room: 'PH-201' },
          { time: '11:30-11:45', subject: 'Break', teacher: '-', room: '-' },
          { time: '11:45-12:45', subject: 'Hospital Pharmacy', teacher: 'Prof. BH. Bisht', room: 'PH-202' },
          { time: '12:45-1:45', subject: 'Pharmaceutical Marketing', teacher: 'Prof. BI. Pant', room: 'PH-201' },
          { time: '1:45-2:45', subject: 'Lunch Break', teacher: '-', room: '-' },
          { time: '2:45-3:45', subject: 'Practical: Pharmacology', teacher: 'Prof. BG. Rai', room: 'PH-Lab-2' },
          { time: '3:45-4:30', subject: 'Industrial Training', teacher: 'Prof. All', room: 'PH-Lab-2' }
        ]
      }
    }
  };

  // Fill other days for all branches (simplified - same pattern)
  const fillOtherDays = (branchKey, year, mondayData) => {
    const days = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const updatedData = { Monday: mondayData };
    
    days.forEach((day, index) => {
      updatedData[day] = mondayData.map(item => ({
        ...item,
        subject: day === 'Tuesday' ? `${item.subject} (Cont.)` : item.subject,
        time: item.time
      }));
    });
    
    return updatedData;
  };

  // Get available years based on branch
  const getAvailableYears = (branchId) => {
    if (branchId === 'pharmacy') {
      return ['First Year', 'Second Year'];
    }
    return ['First Year', 'Second Year', 'Third Year'];
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setSelectedYear(null);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const getTimetable = () => {
    if (!selectedBranch || !selectedYear) return null;
    
    const branchKey = selectedBranch.id;
    const yearData = timetableData[branchKey]?.[selectedYear];
    
    if (!yearData) return null;

    // Complete all days if only Monday is defined
    const completeData = {};
    Object.keys(yearData).forEach(day => {
      if (day === 'Monday' && yearData[day]) {
        const filled = fillOtherDays(branchKey, selectedYear, yearData[day]);
        Object.assign(completeData, filled);
      } else {
        completeData[day] = yearData[day];
      }
    });

    return completeData;
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="timetable-container">
      <section className="timetable-hero">
        <h1>📅 Class Timetable</h1>
        <p>View your branch-wise and year-wise class schedules</p>
      </section>

      {!selectedBranch ? (
        <section className="branches-section">
          <h2 className="section-title">Select Your Branch</h2>
          <div className="branches-grid">
            {branches.map(branch => (
              <div
                key={branch.id}
                className="branch-card"
                onClick={() => handleBranchSelect(branch)}
              >
                <div className="branch-icon">{branch.icon}</div>
                <h3>{branch.name}</h3>
                <p className="branch-code">{branch.code}</p>
                <div className="branch-arrow">→</div>
              </div>
            ))}
          </div>
        </section>
      ) : !selectedYear ? (
        <section className="years-section">
          <button className="back-btn" onClick={() => setSelectedBranch(null)}>
            ← Back to Branches
          </button>
          <h2 className="section-title">
            {selectedBranch.icon} {selectedBranch.name} - Select Year
          </h2>
          <div className="years-grid">
            {getAvailableYears(selectedBranch.id).map(year => (
              <div
                key={year}
                className="year-card"
                onClick={() => handleYearSelect(year)}
              >
                <div className="year-number">
                  {year === 'First Year' ? '1st' : year === 'Second Year' ? '2nd' : '3rd'}
                </div>
                <h3>{year}</h3>
                <div className="year-arrow">→</div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="timetable-section">
          <div className="timetable-header">
            <button className="back-btn" onClick={() => setSelectedYear(null)}>
              ← Back to Years
            </button>
            <h2 className="section-title">
              {selectedBranch.icon} {selectedBranch.name} - {selectedYear} Timetable
            </h2>
          </div>

          <div className="timetable-wrapper">
            {(() => {
              const timetable = getTimetable();
              if (!timetable) {
                return <div className="no-timetable">Timetable data not available for this year.</div>;
              }

              return (
                <div className="timetable-grid">
                  {weekDays.map(day => (
                    <div key={day} className="day-column">
                      <div className="day-header">{day}</div>
                      <div className="day-slots">
                        {timetable[day]?.map((slot, index) => (
                          <div
                            key={index}
                            className={`time-slot ${slot.subject === 'Break' || slot.subject.includes('Lunch') ? 'break-slot' : slot.subject.includes('Practical') || slot.subject.includes('Lab') ? 'practical-slot' : 'lecture-slot'}`}
                          >
                            <div className="slot-time">{slot.time}</div>
                            <div className="slot-subject">{slot.subject}</div>
                            <div className="slot-teacher">{slot.teacher}</div>
                            <div className="slot-room">{slot.room}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>
      )}
    </div>
  );
};

export default Timetable;

