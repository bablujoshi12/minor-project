const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/database');

// Initialize Gemini AI
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const genAI = geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' 
  ? new GoogleGenerativeAI(geminiApiKey) 
  : null;

// Log Gemini AI status
if (genAI) {
  console.log('✅ Gemini AI initialized successfully');
} else {
  console.log('⚠️ Gemini AI not initialized - API key missing or invalid');
}

// Cache for faster responses (5 minutes TTL)
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const collegeContextCache = { data: null, timestamp: 0, ttl: 10 * 60 * 1000 }; // 10 minutes

// Helper to get cached response
const getCachedResponse = (key) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  responseCache.delete(key);
  return null;
};

// Helper to cache response
const setCachedResponse = (key, response) => {
  responseCache.set(key, { response, timestamp: Date.now() });
  // Clean old cache entries (keep only last 100)
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
};

// Enhanced comprehensive context about the college (with caching)
const getCollegeContext = async () => {
  // Check cache first
  if (collegeContextCache.data && Date.now() - collegeContextCache.timestamp < collegeContextCache.ttl) {
    return collegeContextCache.data;
  }

  let departmentsInfo = '';
  let facultyInfo = '';
  
  try {
    // Fetch real-time data from database (parallel queries for speed)
    const [departments, faculty] = await Promise.all([
      pool.query('SELECT * FROM branches ORDER BY name'),
      pool.query('SELECT f.*, d.name as dept_name FROM faculty f LEFT JOIN departments d ON f.department_id = d.id WHERE f.status = "active" LIMIT 10')
    ]);
    
    if (departments[0] && departments[0].length > 0) {
      departmentsInfo = '\n\nDepartments Details:\n';
      departments[0].forEach(dept => {
        departmentsInfo += `- ${dept.name} (${dept.code || dept.code || 'N/A'}): Students: ${dept.total_students || 0}, Faculty: ${dept.total_faculty || 0}\n`;
      });
    }
    
    if (faculty[0] && faculty[0].length > 0) {
      facultyInfo = '\n\nFaculty Members (Sample):\n';
      faculty[0].slice(0, 10).forEach(f => {
        facultyInfo += `- ${f.name}: ${f.designation || 'Faculty'} (${f.dept_name || 'N/A'}) - ${f.qualification || 'N/A'}\n`;
      });
    }
  } catch (error) {
    console.error('Error fetching context data:', error);
  }
  
  const context = `
You are Smart Campus AI - an ultra-intelligent AI assistant for Government Polytechnic, Lohaghat (GPL Lohaghat).

🏛️ COLLEGE INFORMATION:
- Full Name: Government Polytechnic, Lohaghat
- Established: 1975 (49+ years of excellence)
- Type: Government Polytechnic College
- Location: Lohaghat, Champawat District, Uttarakhand - 262524, India
- Phone: +91-5965-222345
- Website: https://www.gplohaghat.org.in
- Email: info@gplohaghat.ac.in

📚 ACADEMIC PROGRAMS:
1. Diploma in Civil Engineering (CE) - 3 years (6 semesters)
2. Diploma in Electronics Engineering (EE) - 3 years (6 semesters)  
3. Diploma in Information Technology (IT) - 3 years (6 semesters)
4. Diploma in Pharmacy (PH) - 2 years (4 semesters)
5. Diploma in Mechanical Engineering (ME) - 3 years (6 semesters)

📅 ACADEMIC STRUCTURE:
- Academic Year: July to June
- Semesters: 2 per year (Odd: July-Dec, Even: Jan-June)
- Class Timing: 9:30 AM to 4:30 PM
- Break: 1:00 PM to 2:00 PM
- Working Days: Monday to Saturday (9 AM - 5 PM)

🎓 ADMISSIONS:
- Application Period: March-April annually
- Entrance Exam: May-June
- Merit List Declaration: July
- Classes Begin: August
- Eligibility: Minimum 60% in 10th/12th
- Required Documents: 10th/12th Marksheet, Birth Certificate, Aadhar Card, Passport photos (4), Caste Certificate (if applicable)

💰 FEE STRUCTURE:
- Tuition Fee: ₹12,000 per year
- Lab Fee: ₹2,000 per year
- Library Fee: ₹500 per year
- Exam Fee: ₹1,200 per semester
- Library/ID Card: ₹300
- Total per Semester: ₹6,500 approximately

🎖️ SCHOLARSHIPS:
- National Scholarship Portal (NSP)
- Social Welfare Department Scholarships
- Merit-based Assistance
- Application Period: August-November
- Required: Aadhar, Income Certificate, Bank Passbook, Photos, Previous Marksheet

📝 EXAMINATIONS:
- Mid-Semester Exams: October/March
- Semester End Exams: December/May
- Passing Criteria: 40% (Theory + Practical combined)
- Results Declaration: Within 15 days
- Re-examination: Next semester

🏠 HOSTEL FACILITIES:
- Limited seats available
- Selection: Merit and availability based
- Fee: ₹8,000 per semester (approximate)
- Facilities: Wi-Fi, Mess (canteen), Study rooms, Common areas
- Contact: Warden Office

🚌 TRANSPORT:
- College buses on main routes
- Bus Pass: Available from Admin Office
- Morning: 8:30 AM pickup
- Evening: 4:45 PM drop

📚 LIBRARY:
- Timing: 9:00 AM - 6:00 PM (Monday-Saturday)
- Digital Access: 24/7 online resources
- Collection: 50,000+ books
- Facilities: Reading rooms, E-books, Study zones
- Location: 2nd floor, Main building

💼 PLACEMENT & CAREER:
- Industry partnerships
- Campus placement drives
- Career counseling
- Alumni network support
- Contact: Placement Office

📞 CONTACT INFORMATION:
- Principal Office: +91-5965-222345
- Admission Office: +91-5965-222346
- Admin Office: +91-5965-222347
- Email: info@gplohaghat.ac.in
- Website: https://www.gplohaghat.org.in

${departmentsInfo}

${facultyInfo}

🎯 YOUR CAPABILITIES:
- Answer questions about admissions, courses, departments, fees, exams
- Provide information about faculty, students, infrastructure
- Guide about hostel, transport, library facilities
- Help with scholarship and placement queries
- Assist with academic schedules and timetables
- Support in both Hindi and English

📋 IMPORTANT INSTRUCTIONS:
1. Always be helpful, accurate, and friendly
2. Use emojis appropriately to make responses engaging
3. Provide specific, actionable information when possible
4. If information is not available, direct user to contact relevant office
5. For student-specific data (roll numbers, marks), mention they can check through student portal
6. Keep responses concise but informative
7. Always maintain context about GPL Lohaghat in responses
8. Answer in the requested language (Hindi or English)
9. If asked about something outside college scope, politely redirect to college-related topics
10. For technical questions about courses, provide practical, relevant information

Remember: You are the face of Smart Campus AI for GPL Lohaghat. Be professional, knowledgeable, and always helpful!
`;
  
  // Cache the context
  collegeContextCache.data = context;
  collegeContextCache.timestamp = Date.now();
  
  return context;
};

// Chat endpoint with enhanced Gemini AI (Optimized for Speed)
router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Normalize message for cache key
    const cacheKey = `${language}:${message.toLowerCase().trim()}`;
    
    // Check cache first (instant response for common questions)
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log(`✅ Cache hit for: ${message.substring(0, 50)}... (${Date.now() - startTime}ms)`);
      return res.json({
        success: true,
        response: cachedResponse,
        isFallback: false,
        source: 'cache',
        responseTime: Date.now() - startTime
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('⚠️ Gemini API key not configured, using fallback responses');
      // Fallback to simple responses if API key not configured
      const fallbackResp = getFallbackResponse(message, language);
      setCachedResponse(cacheKey, fallbackResp);
      return res.json({
        success: true,
        response: fallbackResp,
        isFallback: true,
        source: 'fallback',
        responseTime: Date.now() - startTime
      });
    }

    // Get comprehensive college context with real-time data (cached)
    const collegeContext = await getCollegeContext();

    // Check if genAI is initialized
    if (!genAI) {
      console.log('⚠️ Gemini AI not initialized, using fallback');
      const fallbackResp = getFallbackResponse(message, language);
      setCachedResponse(cacheKey, fallbackResp);
      return res.json({
        success: true,
        response: fallbackResp,
        isFallback: true,
        source: 'fallback',
        responseTime: Date.now() - startTime
      });
    }

    // Get model - using gemini-1.5-flash for FASTER responses (optimized for speed)
    // gemini-1.5-flash is faster and cheaper while maintaining quality
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Faster model for quick responses
      generationConfig: {
        temperature: 0.8, // Slightly higher for more natural responses
        topK: 32, // Reduced for faster processing
        topP: 0.9, // Slightly reduced for speed
        maxOutputTokens: 800, // Reduced for faster responses (still comprehensive)
      }
    });

    // Build conversation history for context (optimized - only last 5 for speed)
    let historyText = '';
    if (conversationHistory.length > 0) {
      historyText = '\n\n=== RECENT CONVERSATION ===\n';
      conversationHistory.slice(-5).forEach(msg => {
        historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 100)}\n`;
      });
      historyText += '=== END HISTORY ===\n\n';
    }

    // Optimized prompt for faster processing
    const prompt = `${collegeContext}

${historyText}

User Question: ${message}

Provide a helpful, concise response in ${language === 'hi' ? 'Hindi' : 'English'}. Use emojis. Keep it informative and friendly. Response should be under 400 words for speed.`;

    // Generate response using Gemini AI (with timeout)
    const generatePromise = model.generateContent(prompt);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 8000) // 8 second timeout
    );
    
    const result = await Promise.race([generatePromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text().trim();

    // Cache the response for future use
    setCachedResponse(cacheKey, text);

    const responseTime = Date.now() - startTime;
    console.log(`✅ Gemini response generated in ${responseTime}ms for: ${message.substring(0, 50)}...`);

    res.json({
      success: true,
      response: text,
      isFallback: false,
      source: 'gemini-ai',
      responseTime: responseTime
    });

  } catch (error) {
    console.error('Chatbot Gemini AI error:', error);
    
    // Enhanced fallback response on error
    const fallbackResp = getFallbackResponse(req.body.message || '', req.body.language || 'en');
    const cacheKey = `${req.body.language || 'en'}:${(req.body.message || '').toLowerCase().trim()}`;
    setCachedResponse(cacheKey, fallbackResp);
    
    res.json({
      success: true,
      response: fallbackResp,
      isFallback: true,
      source: 'fallback',
      responseTime: Date.now() - startTime,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Fallback response function
function getFallbackResponse(message, language = 'en') {
  const lowerMessage = message.toLowerCase();
  
  if (language === 'hi') {
    if (lowerMessage.includes('प्रवेश') || lowerMessage.includes('admission')) {
      return '🎓 प्रवेश जानकारी:\n\nप्रवेश प्रक्रिया: मार्च-अप्रैल में ऑनलाइन आवेदन\nपात्रता: 10वीं/12वीं में न्यूनतम 60%\nफीस: ₹12,000/वर्ष\n\nविस्तृत जानकारी के लिए प्रवेश कार्यालय से संपर्क करें।';
    }
    if (lowerMessage.includes('विभाग') || lowerMessage.includes('department')) {
      return '🏗️ उपलब्ध विभाग:\n\n1. सिविल इंजीनियरिंग\n2. इलेक्ट्रॉनिक्स इंजीनियरिंग\n3. सूचना प्रौद्योगिकी\n4. फार्मेसी\n5. मैकेनिकल इंजीनियरिंग\n\nविशिष्ट विभाग के बारे में पूछें।';
    }
    return '🤖 मैं Smart Campus AI हूं। मैं आपकी प्रवेश, विभाग, छात्र विवरण, फीस आदि के बारे में जानकारी दे सकता हूं। कृपया अपना प्रश्न पूछें।';
  } else {
    if (lowerMessage.includes('admission')) {
      return '🎓 Admission Information:\n\nAdmission Process: Online application in March-April\nEligibility: Minimum 60% in 10th/12th\nFee: ₹12,000/year\n\nContact admission office for detailed information.';
    }
    if (lowerMessage.includes('department')) {
      return '🏗️ Available Departments:\n\n1. Civil Engineering\n2. Electronics Engineering\n3. Information Technology\n4. Pharmacy\n5. Mechanical Engineering\n\nAsk about specific department for details.';
    }
    return '🤖 I am Smart Campus AI. I can help you with admissions, departments, student details, fees, etc. Please ask your question.';
  }
}

module.exports = router;

