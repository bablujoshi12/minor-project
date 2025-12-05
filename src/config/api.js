const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  // Auth endpoints
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
    logout: `${API_BASE_URL}/auth/logout`
  },
  
  // Student endpoints
  student: {
    uploadAssignment: `${API_BASE_URL}/student/upload-assignment`,
    submitAssignment: `${API_BASE_URL}/student/submit-assignment`,
    attendanceDashboard: `${API_BASE_URL}/student/attendance-dashboard`,
    testMarks: `${API_BASE_URL}/student/test-marks`,
    semesterResults: `${API_BASE_URL}/student/semester-results`,
    updateHealthInfo: `${API_BASE_URL}/student/health-info`,
    profile: `${API_BASE_URL}/student/profile`,
    notices: `${API_BASE_URL}/student/notices`,
    assignments: `${API_BASE_URL}/student/assignments`
  },
  
  // Teacher endpoints
  teacher: {
    students: `${API_BASE_URL}/teacher/students`,
    assignments: `${API_BASE_URL}/teacher/assignments`,
    assignmentsWithCounts: `${API_BASE_URL}/teacher/assignments-with-counts`,
    assignmentSubmissions: `${API_BASE_URL}/teacher/assignment-submissions`,
    updateAssignment: `${API_BASE_URL}/teacher/assignments`,
    attendanceGraph: `${API_BASE_URL}/teacher/attendance-graph`,
    insertAttendance: `${API_BASE_URL}/teacher/attendance`,
    insertMarks: `${API_BASE_URL}/teacher/marks`,
    sendMessage: `${API_BASE_URL}/teacher/send-message`,
    messages: `${API_BASE_URL}/teacher/messages`,
    sendNotice: `${API_BASE_URL}/teacher/send-notice`,
    notices: `${API_BASE_URL}/teacher/notices`
  },
  
  // Parent endpoints
  parent: {
    children: `${API_BASE_URL}/parent/children`,
    selectChild: `${API_BASE_URL}/parent/select-child`,
    childAttendance: `${API_BASE_URL}/parent/child-attendance`,
    childAssignments: `${API_BASE_URL}/parent/child-assignments`,
    childMarks: `${API_BASE_URL}/parent/child-marks`,
    childSemesterResults: `${API_BASE_URL}/parent/child-semester-results`,
    sendMessage: `${API_BASE_URL}/parent/send-message`,
    messages: `${API_BASE_URL}/parent/messages`,
    notices: `${API_BASE_URL}/parent/notices`
  },
  
  // Admin endpoints
  admin: {
    // Statistics
    statistics: `${API_BASE_URL}/admin/statistics`,
    statisticsEnhanced: `${API_BASE_URL}/admin/statistics/enhanced`,
    // Students
    students: `${API_BASE_URL}/admin/students`,
    studentById: (id) => `${API_BASE_URL}/admin/students/${id}`,
    createStudent: `${API_BASE_URL}/admin/students`,
    updateStudent: (id) => `${API_BASE_URL}/admin/students/${id}`,
    deleteStudent: (id) => `${API_BASE_URL}/admin/user/student/${id}`,
    // Teachers
    teachers: `${API_BASE_URL}/admin/teachers`,
    teacherById: (id) => `${API_BASE_URL}/admin/teachers/${id}`,
    createTeacher: `${API_BASE_URL}/admin/teachers`,
    updateTeacher: (id) => `${API_BASE_URL}/admin/teachers/${id}`,
    deleteTeacher: (id) => `${API_BASE_URL}/admin/user/teacher/${id}`,
    // Parents
    parents: `${API_BASE_URL}/admin/parents`,
    deleteParent: (id) => `${API_BASE_URL}/admin/user/parent/${id}`,
    // Departments
    departments: `${API_BASE_URL}/admin/departments`,
    departmentById: (id) => `${API_BASE_URL}/admin/departments/${id}`,
    createDepartment: `${API_BASE_URL}/admin/departments`,
    updateDepartment: (id) => `${API_BASE_URL}/admin/departments/${id}`,
    deleteDepartment: (id) => `${API_BASE_URL}/admin/departments/${id}`,
    // Branches
    branches: `${API_BASE_URL}/admin/branches`,
    createBranch: `${API_BASE_URL}/admin/branches`,
    updateBranch: (id) => `${API_BASE_URL}/admin/branches/${id}`,
    deleteBranch: (id) => `${API_BASE_URL}/admin/branches/${id}`,
    // HOD Management
    hods: `${API_BASE_URL}/admin/hods`,
    assignHOD: `${API_BASE_URL}/admin/hods/assign`,
    removeHOD: (departmentId) => `${API_BASE_URL}/admin/hods/${departmentId}`,
    // Notices
    sendNotice: `${API_BASE_URL}/admin/send-notice`,
    notices: `${API_BASE_URL}/admin/notices`,
    updateNotice: (id) => `${API_BASE_URL}/admin/notices/${id}`,
    deleteNotice: (id) => `${API_BASE_URL}/admin/notices/${id}`,
    // Legacy
    deleteUser: (type, id) => `${API_BASE_URL}/admin/user/${type}/${id}`
  },
  
  // Departments
  departments: {
    getAll: `${API_BASE_URL}/departments`,
    getById: (id) => `${API_BASE_URL}/departments/${id}`
  },
  
  // Students
  students: {
    getAll: `${API_BASE_URL}/students`,
    getByRollNo: (rollNo) => `${API_BASE_URL}/students/roll/${rollNo}`,
    getByDepartment: (id) => `${API_BASE_URL}/students/department/${id}`
  },
  
  // Faculty
  faculty: {
    getAll: `${API_BASE_URL}/faculty`,
    getByDepartment: (id) => `${API_BASE_URL}/faculty/department/${id}`
  },
  
  // Events
  events: {
    getAll: `${API_BASE_URL}/events`,
    getHomepage: `${API_BASE_URL}/homepage/events`
  },
  
  // Placement
  placement: {
    getAll: `${API_BASE_URL}/placement`
  },
  
  // Announcements
  announcements: {
    getAll: `${API_BASE_URL}/announcements`,
    getById: (id) => `${API_BASE_URL}/announcements/${id}`
  },
  
  // Feedback
  feedback: {
    submit: `${API_BASE_URL}/feedback`,
    getAll: `${API_BASE_URL}/feedback`
  },

  // Chatbot
  chatbot: {
    chat: `${API_BASE_URL}/chatbot/chat`
  },
  notesBoard: {
    public: `${API_BASE_URL}/notes-board/public`,
    all: `${API_BASE_URL}/notes-board/all`,
    create: `${API_BASE_URL}/notes-board/create`,
    update: (id) => `${API_BASE_URL}/notes-board/${id}`,
    delete: (id) => `${API_BASE_URL}/notes-board/${id}`
  },
  
  // NSS/NCC endpoints
  nss: {
    getAll: `${API_BASE_URL}/nss/students`,
    add: `${API_BASE_URL}/nss/students`,
    update: (id) => `${API_BASE_URL}/nss/students/${id}`,
    delete: (id) => `${API_BASE_URL}/nss/students/${id}`
  },
  ncc: {
    getAll: `${API_BASE_URL}/ncc/students`,
    add: `${API_BASE_URL}/ncc/students`,
    update: (id) => `${API_BASE_URL}/ncc/students/${id}`,
    delete: (id) => `${API_BASE_URL}/ncc/students/${id}`
  },
  
  // Subjects endpoints
  subjects: {
    getAll: `${API_BASE_URL}/subjects`,
    getBySemester: (semester) => `${API_BASE_URL}/subjects/semester/${semester}`,
    getById: (id) => `${API_BASE_URL}/subjects/${id}`
  }
};

export default api;

