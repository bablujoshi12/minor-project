import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import HeaderLogo from './HeaderLogo';
import './Chatbot.css';
import api from '../config/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 Welcome to Smart Campus AI!\n\n🏛️ Government Polytechnic, Lohaghat\n\nI am your intelligent assistant for:\n• 🎓 Admissions & Courses\n• 🏗️ All Departments\n• 👨‍🎓 Student Services\n• 📚 Academic Resources\n• 💼 Career Guidance\n• 🏠 Campus Life\n\nHow may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [studentFlow, setStudentFlow] = useState({ active: false, step: null, dept: null });
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [lastUserInput, setLastUserInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const hasGreeted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setCurrentLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const getBestVoice = (lang = 'en-US') => {
    if (!('speechSynthesis' in window)) return null;
    
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Preferred voice names for better quality
    const preferredNames = [
      'Microsoft Zira',  // High quality English
      'Google UK English Female',
      'Microsoft Ravi',  // Hindi
      'Google हिन्दी',
      'Microsoft Kalpana', // Hindi
      'Niranjana', // Hindi
      'Hazel', // UK English
      'Microsoft Susan',
      'Google US English'
    ];

    // Try to find preferred voice first
    for (const name of preferredNames) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }

    // Find voice by language (prefer female voices)
    const langCode = lang.split('-')[0];
    const langVoices = voices.filter(v => v.lang.startsWith(langCode));
    
    // Prefer female voices (they sound better in TTS)
    const femaleVoice = langVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      const langLower = langCode.toLowerCase();
      
      // Hindi voice checks
      if (langLower === 'hi') {
        return nameLower.includes('female') || 
               nameLower.includes('woman') ||
               nameLower.includes('kalpana') ||
               nameLower.includes('niranjana') ||
               nameLower.includes('ravi');
      }
      
      // English voice checks
      return nameLower.includes('female') || 
             nameLower.includes('woman') ||
             nameLower.includes('zira') ||
             nameLower.includes('susan') ||
             nameLower.includes('hazel');
    });
    if (femaleVoice) return femaleVoice;

    // Fallback to any voice in the language
    if (langVoices.length > 0) return langVoices[0];

    // Last resort - return any voice
    return voices[0];
  };

  // Fallback departments shown if backend data is unavailable
  const defaultDepartments = [
    { id: 101, name: 'Information Technology', code: 'IT', total_students: 100, total_faculty: 4 },
    { id: 102, name: 'Civil Engineering', code: 'CE', total_students: 120, total_faculty: 3 },
    { id: 103, name: 'Electronics Engineering', code: 'EE', total_students: 90, total_faculty: 3 },
    { id: 104, name: 'Mechanical Engineering', code: 'ME', total_students: 110, total_faculty: 4 },
    { id: 105, name: 'Pharmacy', code: 'PH', total_students: 80, total_faculty: 5 }
  ];

  const speakText = (text, lang = 'en-US') => {
    if (isMuted) return;
    
    if (synthRef.current) {
      synthRef.current.cancel();
      
      // Clean text for better speech (remove emojis, special chars)
      const cleanText = text
        .replace(/[🔥✨🎯💼🎓🏗️💻📚📞📍📋📅💰🏢🤔🤗✅❌]/g, '')
        .replace(/•/g, '')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Better voice quality settings
      utterance.rate = 0.95;  // Slightly slower for clarity
      utterance.pitch = 1.0;   // Natural pitch
      utterance.volume = 1.0;  // Full volume for better clarity
      utterance.lang = lang;

      // Set the best voice
      const voice = getBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    // Auto greet with voice when opened
    if (isOpen && !hasGreeted.current) {
      hasGreeted.current = true;
      const greeting = currentLang === 'hi' 
        ? 'नमस्ते! मैं CampusBot हूं। मैं आपकी कैसे मदद कर सकता हूं?' 
        : 'Hello sir ! I am CampusBot. How can I help you?';

      setTimeout(() => {
        speakText(greeting, currentLang === 'hi' ? 'hi-IN' : 'en-US');
      }, 500);
    }
    
    return () => {
      hasGreeted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        // Forces voice list to be loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          setTimeout(loadVoices, 100);
        }
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Fetch departments and students data
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      setDataError(null);
      
      try {
        // Fetch departments
        const deptResponse = await fetch(api.departments.getAll);
        if (!deptResponse.ok) {
          throw new Error(`Failed to fetch departments: ${deptResponse.status}`);
        }
        const deptData = await deptResponse.json();
        if (deptData.success) {
          setDepartments(deptData.data);
        }

        // Fetch all students
        const studentResponse = await fetch(api.students.getAll);
        if (!studentResponse.ok) {
          throw new Error(`Failed to fetch students: ${studentResponse.status}`);
        }
        const studentData = await studentResponse.json();
        if (studentData.success) {
          setStudents(studentData.data);
        }
      } catch (error) {
        setDataError(error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
    
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setTimeout(() => {
          sendMessage(transcript);
          setInput('');
        }, 500);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);


  const getResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase().trim();

    // Simple web/college search helpers
    const buildWebSearch = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    const buildCollegeSearch = (q) => `https://www.google.com/search?q=${encodeURIComponent(q + ' site:gplohaghat.org.in')}`;
    
    // AI-powered responses for general questions
    if (lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('when') || lowerInput.includes('where') || lowerInput.includes('why') || 
        lowerInput.includes('क्या') || lowerInput.includes('कैसे') || lowerInput.includes('कब') || lowerInput.includes('कहाँ') || lowerInput.includes('क्यों')) {
      
      // Course related questions
      if (lowerInput.includes('course') || lowerInput.includes('subject') || lowerInput.includes('पाठ्यक्रम') || lowerInput.includes('विषय')) {
        return {
          text: currentLang === 'hi' 
            ? '📚 पाठ्यक्रम जानकारी:\n\n• डिप्लोमा इंजीनियरिंग (3 वर्ष)\n• सेमेस्टर: 6 (प्रति वर्ष 2)\n• विषय: C, C++, Java, Web Development, Database\n• प्रैक्टिकल: प्रयोगशाला में hands-on training\n\nविस्तृत जानकारी के लिए विभाग से संपर्क करें।'
            : '📚 Course Information:\n\n• Diploma Engineering (3 years)\n• Semesters: 6 (2 per year)\n• Subjects: C, C++, Java, Web Development, Database\n• Practical: Hands-on lab training\n\nContact department for detailed syllabus.',
          quickActions: currentLang === 'hi' ? ['विभाग', 'प्रवेश'] : ['Departments', 'Admissions']
        };
      }
      
      // Exam related questions
      if (lowerInput.includes('exam') || lowerInput.includes('test') || lowerInput.includes('परीक्षा') || lowerInput.includes('टेस्ट')) {
        return {
          text: currentLang === 'hi'
            ? '📝 परीक्षा जानकारी:\n\n• मिड-सेमेस्टर: अक्टूबर/मार्च\n• सेमेस्टर एंड: दिसंबर/मई\n• पासिंग: 40% (थ्योरी + प्रैक्टिकल)\n• रिजल्ट: 15 दिन में\n• री-एग्जाम: अगले सेमेस्टर'
            : '📝 Exam Information:\n\n• Mid-semester: October/March\n• Semester End: December/May\n• Passing: 40% (Theory + Practical)\n• Results: Within 15 days\n• Re-exam: Next semester',
          quickActions: currentLang === 'hi' ? ['समय सारणी', 'शुल्क'] : ['Timetable', 'Fees']
        };
      }
      
      // General AI response
      return {
        text: currentLang === 'hi'
          ? '🤖 मैं आपकी मदद कर सकता हूं:\n\n• प्रवेश, शुल्क, छात्रवृत्ति\n• विभाग, छात्र विवरण\n• परीक्षा, समय सारणी\n• हॉस्टल, परिवहन\n• प्लेसमेंट, लाइब्रेरी\n\nकृपया विशिष्ट प्रश्न पूछें।'
          : '🤖 I can help you with:\n\n• Admissions, Fees, Scholarships\n• Departments, Student Details\n• Exams, Timetable\n• Hostel, Transport\n• Placements, Library\n\nPlease ask specific questions.',
        quickActions: currentLang === 'hi' ? ['प्रवेश', 'विभाग', 'छात्र विवरण'] : ['Admissions', 'Departments', 'Student Details']
      };
    }
    
    // Student flow: choose department
    if (studentFlow.active && studentFlow.step === 'chooseDept') {
      const list = (Array.isArray(departments) && departments.length > 0) ? departments : defaultDepartments;
      const match = list.find((d, idx) => {
        const name = String(d.name || '').toLowerCase();
        const code = String(d.code || '').toLowerCase();
        return name.includes(lowerInput) || code === lowerInput || lowerInput === String(idx + 1);
      });
      if (match) {
        return {
          studentFlowNext: { step: 'enterRoll', dept: match.code },
          text: currentLang === 'hi'
            ? `✅ विभाग चुना गया: ${match.name} (${match.code})\n\nकृपया रोल नंबर दर्ज करें (उदाहरण: 23010120023)`
            : `✅ Department selected: ${match.name} (${match.code})\n\nPlease enter roll number (e.g., 23010120023)`,
          quickActions: []
        };
      }
    }

    // Student flow: expect roll number
    if (studentFlow.active && studentFlow.step === 'enterRoll') {
      const rollInline = userInput.match(/([0-9]{5,})/);
      if (rollInline) {
        return { isAsync: true, rollNo: rollInline[1].toUpperCase(), fromStudentFlow: true };
      }
    }

    // Direct search intents
    if (lowerInput.startsWith('search ') || lowerInput.startsWith('find ')) {
      const query = userInput.replace(/^\s*(search|find)\s*/i, '');
      return {
        text: currentLang === 'hi'
          ? `🔎 वेब खोज खोली जा रही है:\n\n${query}`
          : `🔎 Opening web search:\n\n${query}`,
        redirectTo: buildWebSearch(query),
        quickActions: []
      };
    }
    if (lowerInput.startsWith('college search ') || lowerInput.startsWith('site search ') || lowerInput.includes('college search')) {
      const query = userInput.replace(/^\s*(college search|site search)\s*/i, '') || lastUserInput || 'Government Polytechnic Lohaghat';
      return {
        text: currentLang === 'hi'
          ? `🏛️ कॉलेज साइट खोज खोली जा रही है:\n\n${query}`
          : `🏛️ Opening college site search:\n\n${query}`,
        redirectTo: buildCollegeSearch(query),
        quickActions: []
      };
    }

    // Enhanced Greeting with Smart Campus context
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('namaste') || lowerInput.includes('helo') || lowerInput.includes('hey')) {
      const currentTime = new Date().getHours();
      const timeGreeting = currentTime < 12 ? 'Good Morning' : currentTime < 18 ? 'Good Afternoon' : 'Good Evening';
      const timeGreetingHi = currentTime < 12 ? 'सुप्रभात' : currentTime < 18 ? 'नमस्कार' : 'शुभ संध्या';
      
      return {
        text: currentLang === 'hi' 
          ? `👋 ${timeGreetingHi}! मैं Smart Campus AI हूं - आपका बुद्धिमान सहायक।\n\n🏛️ Government Polytechnic, Lohaghat में आपका स्वागत है!\n\n📚 उपलब्ध पाठ्यक्रम:\n• सिविल इंजीनियरिंग (3 वर्ष)\n• इलेक्ट्रॉनिक्स इंजीनियरिंग (3 वर्ष)\n• सूचना प्रौद्योगिकी (3 वर्ष)\n• फार्मेसी (2 वर्ष)\n\nमैं आपकी मदद कर सकता हूं:\n• 🎓 प्रवेश और शैक्षणिक जानकारी\n• 🏗️ सभी विभागों की जानकारी\n• 👨‍🎓 छात्र विवरण और परिणाम\n• 📚 पुस्तकालय और संसाधन\n• 💼 प्लेसमेंट और करियर\n• 🏠 हॉस्टल और परिवहन\n• 📞 प्रिंसिपल से संपर्क\n\nकृपया अपना प्रश्न पूछें या नीचे दिए विकल्पों में से चुनें!`
          : `👋 ${timeGreeting}! I am Smart Campus AI - your intelligent assistant.\n\n🏛️ Welcome to Government Polytechnic, Lohaghat!\n\n📚 Available Courses:\n• Civil Engineering (3 years)\n• Electronics Engineering (3 years)\n• Information Technology (3 years)\n• Pharmacy (2 years)\n\nI can help you with:\n• 🎓 Admissions & Academic Information\n• 🏗️ All Departments Details\n• 👨‍🎓 Student Details & Results\n• 📚 Library & Resources\n• 💼 Placements & Career\n• 🏠 Hostel & Transport\n• 📞 Contact Principal\n\nPlease ask your question or choose from options below!`,
        quickActions: currentLang === 'hi' ? ['सभी विभाग', 'छात्र खोजें', 'छात्र परिणाम', 'भवन डिजाइन', 'प्रिंसिपल पोर्टल'] : ['All Departments', 'Student Search', 'Student Result', 'Building Design', 'Principal Portal']
      };
    }
    
    // Enhanced Admissions with Smart Campus context
    if (lowerInput.includes('admission') || lowerInput.includes('apply') || lowerInput.includes('प्रवेश') || lowerInput.includes('admit') || lowerInput.includes('enrollment')) {
      return {
        text: currentLang === 'hi' 
          ? '🎓 प्रवेश जानकारी - Government Polytechnic, Lohaghat\n\n📅 प्रवेश प्रक्रिया 2024-25:\n• ऑनलाइन आवेदन: मार्च-अप्रैल\n• प्रवेश परीक्षा: मई-जून\n• मेरिट लिस्ट: जुलाई\n• कक्षाएं शुरू: अगस्त\n\n📚 उपलब्ध पाठ्यक्रम:\n• सिविल इंजीनियरिंग (3 वर्षीय डिप्लोमा)\n• इलेक्ट्रॉनिक्स इंजीनियरिंग (3 वर्षीय डिप्लोमा)\n• सूचना प्रौद्योगिकी (3 वर्षीय डिप्लोमा)\n• फार्मेसी (2 वर्षीय डिप्लोमा)\n\n📋 आवश्यक दस्तावेज:\n• 10वीं/12वीं मार्कशीट (कम से कम 60%)\n• जन्म प्रमाण पत्र\n• आधार कार्ड\n• पासपोर्ट साइज फोटो (4 कॉपी)\n• जाति प्रमाण पत्र (यदि लागू)\n\n💰 शुल्क संरचना:\n• ट्यूशन फीस: ₹12,000/वर्ष\n• लैब फीस: ₹2,000/वर्ष\n• लाइब्रेरी: ₹500/वर्ष\n• अन्य: ₹500/वर्ष\n\n🎯 पात्रता: 10वीं/12वीं में कम से कम 60% अंक\n\n🌐 आधिकारिक वेबसाइट: https://www.gplohaghat.org.in\n📞 प्रवेश कार्यालय: 05965-222345'
          : '🎓 Admission Information - Government Polytechnic, Lohaghat\n\n📅 Admission Process 2024-25:\n• Online Application: March-April\n• Entrance Exam: May-June\n• Merit List: July\n• Classes Start: August\n\n📚 Available Courses:\n• Civil Engineering (3-year Diploma)\n• Electronics Engineering (3-year Diploma)\n• Information Technology (3-year Diploma)\n• Pharmacy (2-year Diploma)\n\n📋 Required Documents:\n• 10th/12th Mark sheet (minimum 60%)\n• Birth Certificate\n• Aadhar Card\n• Passport size photos (4 copies)\n• Caste Certificate (if applicable)\n\n💰 Fee Structure:\n• Tuition Fee: ₹12,000/year\n• Lab Fee: ₹2,000/year\n• Library: ₹500/year\n• Others: ₹500/year\n\n🎯 Eligibility: Minimum 60% in 10th/12th\n\n🌐 Official Website: https://www.gplohaghat.org.in\n📞 Admission Office: 05965-222345',
        quickActions: currentLang === 'hi' ? ['शुल्क', 'विभाग', 'छात्रवृत्ति', 'संपर्क'] : ['Fees', 'Departments', 'Scholarships', 'Contact']
      };
    }

    // Fees
    if (lowerInput.includes('fee') || lowerInput.includes('fees') || lowerInput.includes('शुल्क')) {
      return {
        text: currentLang === 'hi'
          ? '💳 शुल्क जानकारी:\n\n• डिप्लोमा (प्रति सेमेस्टर): ₹6,500\n• परीक्षा शुल्क: ₹1,200\n• लाइब्रेरी/आईडी: ₹300\n\nभुगतान मोड: ऑनलाइन/ऑफलाइन कैश काउंटर\nसमय सीमा: नोटिस के अनुसार'
          : '💳 Fee Details:\n\n• Diploma (per semester): ₹6,500\n• Exam Fee: ₹1,200\n• Library/ID: ₹300\n\nPayment: Online or Cash Counter\nDeadline: As per notice',
        quickActions: currentLang === 'hi' ? ['छात्रवृत्ति'] : ['Scholarships']
      };
    }

    // Scholarships
    if (lowerInput.includes('scholarship') || lowerInput.includes('छात्रवृत्ति')) {
      return {
        text: currentLang === 'hi'
          ? '🎖️ छात्रवृत्ति:\n\n• राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)\n• सामाजिक कल्याण विभाग छात्रवृत्ति\n• मेधावी छात्र सहायता\n\nदस्तावेज़: आधार, आय प्रमाण, पासबुक, फोटो, पूर्व अंकपत्र\nसमय: अगस्त-नवंबर'
          : '🎖️ Scholarships:\n\n• National Scholarship Portal (NSP)\n• Social Welfare Department Scholarship\n• Merit Assistance\n\nDocs: Aadhaar, Income Cert, Bank Passbook, Photo, Previous marksheet\nWindow: Aug-Nov',
        quickActions: currentLang === 'hi' ? ['शुल्क'] : ['Fees']
      };
    }

    // Timetable
    if (lowerInput.includes('timetable') || lowerInput.includes('time table') || lowerInput.includes('समय सारणी')) {
      return {
        text: currentLang === 'hi'
          ? '🕒 समय सारणी:\n\n• कक्षा समय: 9:30 AM - 4:30 PM\n• ब्रेक: 1:00 PM - 2:00 PM\n• विस्तृत समय सारणी विभाग नोटिस बोर्ड/ERP पर उपलब्ध'
          : '🕒 Timetable:\n\n• Class Hours: 9:30 AM - 4:30 PM\n• Break: 1:00 PM - 2:00 PM\n• Detailed timetable is on department notice/ERP',
        quickActions: currentLang === 'hi' ? ['कार्यक्रम'] : ['Events']
      };
    }

    // Hostel
    if (lowerInput.includes('hostel') || lowerInput.includes('हॉस्टल')) {
      return {
        text: currentLang === 'hi'
          ? '🏠 हॉस्टल जानकारी:\n\n• सीटें सीमित, प्रवेश मेरिट/उपलब्धता पर\n• शुल्क: ₹8,000/सेमेस्टर (डेमो)\n• सुविधाएं: वाई-फाई, मेस, अध्ययन कक्ष\n• संपर्क: वार्डन ऑफिस'
          : '🏠 Hostel Info:\n\n• Limited seats, merit/availability based\n• Fee: ₹8,000/sem (demo)\n• Facilities: Wi‑Fi, Mess, Study room\n• Contact: Warden office',
        quickActions: currentLang === 'hi' ? ['परिवहन'] : ['Transport']
      };
    }

    // Transport
    if (lowerInput.includes('transport') || lowerInput.includes('bus') || lowerInput.includes('परिवहन')) {
      return {
        text: currentLang === 'hi'
          ? '🚌 परिवहन:\n\n• कॉलेज बसें मुख्य रूट पर उपलब्ध\n• पास: प्रशासन कार्यालय से\n• समय: सुबह 8:30 AM, शाम 4:45 PM'
          : '🚌 Transport:\n\n• College buses available on main routes\n• Pass: From Admin Office\n• Timings: 8:30 AM morning, 4:45 PM evening',
        quickActions: currentLang === 'hi' ? ['कैंपस मैप'] : ['Campus Map']
      };
    }

    // Events / Announcements
    if (lowerInput.includes('event') || lowerInput.includes('announcement') || lowerInput.includes('कार्यक्रम') || lowerInput.includes('सूचना')) {
      return {
        text: currentLang === 'hi'
          ? '📣 आगामी कार्यक्रम/सूचनाएं (डेमो):\n\n• Tech Fest — 15 Nov\n• Placement Drive — 28 Nov\n• Sports Week — 10 Dec\n\nविवरण के लिए: प्रशासन ऑफिस/वेबसाइट नोटिस'
          : '📣 Upcoming Events/Announcements (demo):\n\n• Tech Fest — 15 Nov\n• Placement Drive — 28 Nov\n• Sports Week — 10 Dec\n\nDetails: Admin office/website notice',
        quickActions: currentLang === 'hi' ? ['समय सारणी'] : ['Timetable']
      };
    }

    // Campus Map
    if (lowerInput.includes('map') || lowerInput.includes('कैंपस मैप') || lowerInput.includes('campus map')) {
      return {
        text: currentLang === 'hi'
          ? '🗺️ कैंपस मैप: Google Maps पर देखें — Government Polytechnic, Lohaghat'
          : '🗺️ Campus Map: View on Google Maps — Government Polytechnic, Lohaghat',
        quickActions: currentLang === 'hi' ? ['परिवहन'] : ['Transport']
      };
    }

    // Results
    if (lowerInput.includes('results') || lowerInput.includes('result') || lowerInput.includes('परिणाम') || lowerInput.includes('exam result') || lowerInput.includes('semester result')) {
      return {
        text: currentLang === 'hi'
          ? '📊 सेमेस्टर परिणाम\n\nआपको UBTER परीक्षा पोर्टल पर भेजा जा रहा है जहाँ आप अपने परिणाम देख सकते हैं।\n\n🔗 https://ubterex.in/Student/Login.aspx\n\n📝 लॉगिन करने के लिए:\n• Registration Number या Roll Number\n• Password (8-12 characters)'
          : '📊 Semester Results\n\nRedirecting you to UBTER exam portal where you can check your results.\n\n🔗 https://ubterex.in/Student/Login.aspx\n\n📝 To login:\n• Registration Number OR Roll Number\n• Password (8-12 characters)',
        redirectTo: 'https://ubterex.in/Student/Login.aspx',
        quickActions: []
      };
    }

    // Building Design
    if (lowerInput.includes('building design') || lowerInput.includes('building') || lowerInput.includes('भवन डिजाइन') || lowerInput.includes('campus design') || lowerInput.includes('college design')) {
      return {
        text: currentLang === 'hi'
          ? '🏛️ Government Polytechnic, Lohaghat - भवन डिजाइन\n\n📐 कैंपस लेआउट:\n\n🏢 मुख्य भवन (L-आकार):\n• प्रशासनिक कार्यालय\n• प्रिंसिपल कार्यालय\n• कंप्यूटर लैब\n• कक्षा कक्ष (20+)\n\n🏗️ विभागीय भवन:\n• सिविल इंजीनियरिंग विभाग\n• इलेक्ट्रॉनिक्स विभाग\n• आईटी विभाग\n• फार्मेसी विभाग\n• मैकेनिकल विभाग\n\n🏠 छात्र सुविधाएं:\n• पुस्तकालय (2 मंजिला)\n• हॉस्टल (लड़के/लड़कियां)\n• कैंटीन\n• खेल का मैदान\n• बास्केटबॉल कोर्ट\n\n🛣️ कैंपस रोड:\n• मुख्य सड़क (कर्ब्ड)\n• पार्किंग क्षेत्र\n• पैदल मार्ग\n\n📊 डेटा स्थिति: 40% पूर्ण\n🔄 अपडेट: जल्दी आने वाला है\n\n📞 अधिक जानकारी: 05965-222345'
          : '🏛️ Government Polytechnic, Lohaghat - Building Design\n\n📐 Campus Layout:\n\n🏢 Main Building (L-Shaped):\n• Administrative Office\n• Principal Office\n• Computer Labs\n• Classrooms (20+)\n\n🏗️ Department Buildings:\n• Civil Engineering Department\n• Electronics Department\n• IT Department\n• Pharmacy Department\n• Mechanical Department\n\n🏠 Student Facilities:\n• Library (2 Floors)\n• Hostel (Boys/Girls)\n• Canteen\n• Sports Ground\n• Basketball Court\n\n🛣️ Campus Roads:\n• Main Road (Curved)\n• Parking Area\n• Walking Paths\n\n📊 Data Status: 40% Complete\n🔄 Update: Coming Soon\n\n📞 More Info: 05965-222345',
        quickActions: currentLang === 'hi' ? ['कैंपस मैप', 'विभाग', 'संपर्क'] : ['Campus Map', 'Departments', 'Contact']
      };
    }

    // Smart Campus Features
    if (lowerInput.includes('smart campus') || lowerInput.includes('स्मार्ट कैंपस') || lowerInput.includes('ai features') || lowerInput.includes('ai सुविधाएं')) {
      return {
        text: currentLang === 'hi'
          ? '🤖 Smart Campus AI सुविधाएं:\n\n🧠 बुद्धिमान सहायक:\n• 24/7 उपलब्ध AI सहायक\n• बहुभाषी समर्थन (हिंदी/अंग्रेजी)\n• आवाज पहचान और बोलने की क्षमता\n• संदर्भ-जागरूक बातचीत\n\n📚 शैक्षणिक सहायता:\n• पाठ्यक्रम जानकारी\n• छात्र विवरण और परिणाम\n• उपस्थिति ट्रैकिंग\n• परीक्षा अनुसूची\n\n🏛️ कैंपस सेवाएं:\n• विभाग जानकारी\n• प्रवेश प्रक्रिया\n• शुल्क संरचना\n• छात्रवृत्ति जानकारी\n\n🔧 तकनीकी सुविधाएं:\n• वास्तविक समय डेटा\n• सुरक्षित डेटा प्रबंधन\n• मोबाइल अनुकूल\n• तेज प्रतिक्रिया समय\n\n🌐 आधिकारिक वेबसाइट: https://www.gplohaghat.org.in'
          : '🤖 Smart Campus AI Features:\n\n🧠 Intelligent Assistant:\n• 24/7 Available AI Assistant\n• Multilingual Support (Hindi/English)\n• Voice Recognition & Speech\n• Context-Aware Conversations\n\n📚 Academic Support:\n• Course Information\n• Student Details & Results\n• Attendance Tracking\n• Exam Schedules\n\n🏛️ Campus Services:\n• Department Information\n• Admission Process\n• Fee Structure\n• Scholarship Information\n\n🔧 Technical Features:\n• Real-time Data\n• Secure Data Management\n• Mobile Responsive\n• Fast Response Time\n\n🌐 Official Website: https://www.gplohaghat.org.in',
        quickActions: currentLang === 'hi' ? ['विभाग', 'छात्र विवरण', 'प्रवेश', 'संपर्क'] : ['Departments', 'Student Details', 'Admissions', 'Contact']
      };
    }

    // Help and Support
    if (lowerInput.includes('help') || lowerInput.includes('सहायता') || lowerInput.includes('support') || lowerInput.includes('मदद')) {
      return {
        text: currentLang === 'hi'
          ? '🆘 सहायता और समर्थन:\n\n🤖 मैं आपकी कैसे मदद कर सकता हूं:\n• प्रश्न पूछें - मैं आपके सवालों का जवाब दूंगा\n• विकल्प चुनें - नीचे दिए गए बटनों का उपयोग करें\n• आवाज का उपयोग करें - माइक बटन दबाकर बोलें\n• भाषा बदलें - हिंदी/अंग्रेजी में बात करें\n\n📞 संपर्क जानकारी:\n• प्रिंसिपल: 05965-222345\n• प्रवेश कार्यालय: 05965-222346\n• ईमेल: info@gplohaghat.org.in\n• वेबसाइट: https://www.gplohaghat.org.in\n\n🕒 कार्य समय:\n• सोमवार-शुक्रवार: 9:00 AM - 5:00 PM\n• शनिवार: 9:00 AM - 1:00 PM'
          : '🆘 Help and Support:\n\n🤖 How I can help you:\n• Ask Questions - I\'ll answer your queries\n• Use Options - Click buttons below\n• Use Voice - Press mic button to speak\n• Change Language - Switch between Hindi/English\n\n📞 Contact Information:\n• Principal: 05965-222345\n• Admission Office: 05965-222346\n• Email: info@gplohaghat.org.in\n• Website: https://www.gplohaghat.org.in\n\n🕒 Working Hours:\n• Monday-Friday: 9:00 AM - 5:00 PM\n• Saturday: 9:00 AM - 1:00 PM',
        quickActions: currentLang === 'hi' ? ['प्रवेश', 'विभाग', 'छात्र विवरण', 'संपर्क'] : ['Admissions', 'Departments', 'Student Details', 'Contact']
      };
    }

    // Principal Portal
    if (lowerInput.includes('principal') || lowerInput.includes('प्रिंसिपल') || lowerInput.includes('principal portal')) {
      return {
        text: currentLang === 'hi'
          ? '👨‍💼 प्रिंसिपल पोर्टल\n\nआपको Contact पेज पर भेजा जा रहा है जहाँ आप प्रिंसिपल को संदेश भेज सकते हैं।'
          : '👨‍💼 Principal Portal\n\nRedirecting you to Contact page where you can send message to Principal.',
        redirectTo: '/contact',
        quickActions: []
      };
    }

    // All Departments - Show list (with fallback)
    if (lowerInput.includes('departments') || lowerInput.includes('विभाग') || lowerInput.includes('all departments')) {
      if (dataLoading) {
        return {
          text: currentLang === 'hi' 
            ? '⏳ विभाग डेटा लोड हो रहा है...\n\nकृपया थोड़ी देर रुकें।'
            : '⏳ Loading department data...\n\nPlease wait a moment.',
          quickActions: []
        };
      }

      const list = (Array.isArray(departments) && departments.length > 0) ? departments : defaultDepartments;

      let deptText = currentLang === 'hi' ? '🏛️ सभी विभाग:\n\n' : '🏛️ All Departments:\n\n';
      list.forEach((dept, idx) => {
        deptText += `${idx + 1}. ${dept.name} (${dept.code})\n   👨‍🎓 Students: ${dept.total_students || 0} | 👨‍🏫 Faculty: ${dept.total_faculty || 0}\n\n`;
      });
      deptText += currentLang === 'hi' ? 'विस्तृत जानकारी के लिए विभाग का नाम पूछें।' : 'Ask for specific department for detailed information.';

      return {
        text: deptText,
        quickActions: ['IT', 'Civil', 'Electronics', 'Mechanical', 'Pharmacy']
      };
    }

    // Student details entry: ask for department first
    if (lowerInput.includes('student details')) {
      const list = (Array.isArray(departments) && departments.length > 0) ? departments : defaultDepartments;
      let promptText = currentLang === 'hi' ? '👨‍🎓 छात्र विवरण - कृपया विभाग चुनें:\n\n' : '👨‍🎓 Student Details - Please choose a department:\n\n';
      list.forEach((d, idx) => {
        promptText += `${idx + 1}. ${d.name} (${d.code})\n   👨‍🎓 Students: ${d.total_students || 0} | 👨‍🏫 Faculty: ${d.total_faculty || 0}\n\n`;
      });
      return { studentFlowStart: true, text: promptText, quickActions: ['IT','Civil','Electronics','Mechanical','Pharmacy'] };
    }

    // Attendance check by roll number (demo)
    if (lowerInput.includes('attendance') || lowerInput.includes('attandance') || lowerInput.includes('attandence') || lowerInput.includes('उपस्थिति') || lowerInput.includes('हाजिरी')) {
      const rollMatchA = userInput.match(/roll\s*(no|number)?[\s:]*([A-Z0-9]+)/i) || userInput.match(/([0-9]{5,})/);
      if (!rollMatchA || (!rollMatchA[2] && !rollMatchA[1])) {
        return {
          text: currentLang === 'hi'
            ? '🗓️ उपस्थिति देखने के लिए:\n\nप्रारूप: "Attendance roll no 23010120023"'
            : '🗓️ To check attendance:\n\nFormat: "Attendance roll no 23010120023"',
          quickActions: []
        };
      }

      const rollA = (rollMatchA[2] || rollMatchA[1]).toUpperCase();
      const demo = {
        '23010120023': { name: 'Deepesh Joshi', month: 'October 2025', workingDays: 24, present: 22 },
        '23010120001': { name: 'Bablu Joshi',   month: 'October 2025', workingDays: 24, present: 21 }
      };
      const rec = demo[rollA];
      if (!rec) {
        return {
          text: currentLang === 'hi' ? `❌ रोल नंबर ${rollA} के लिए उपस्थिति रिकॉर्ड नहीं मिला।` : `❌ No attendance record found for roll ${rollA}.`,
          quickActions: []
        };
      }
      const absent = Math.max(0, rec.workingDays - rec.present);
      const percent = ((rec.present / rec.workingDays) * 100).toFixed(1);
      const text = currentLang === 'hi'
        ? `🗓️ मासिक उपस्थिति (${rec.month})\n\n📛 नाम: ${rec.name}\n🎫 रोल: ${rollA}\n\n✅ उपस्थित दिन: ${rec.present}\n❌ अनुपस्थित दिन: ${absent}\n📅 कुल कार्य दिवस: ${rec.workingDays}\n\n📈 औसत उपस्थिति: ${percent}%`
        : `🗓️ Monthly Attendance (${rec.month})\n\n📛 Name: ${rec.name}\n🎫 Roll: ${rollA}\n\n✅ Present Days: ${rec.present}\n❌ Absent Days: ${absent}\n📅 Working Days: ${rec.workingDays}\n\n📈 Average Attendance: ${percent}%`;
      return { text, quickActions: [] };
    }

    // Student search
    if (lowerInput.includes('student') || lowerInput.includes('roll no') || lowerInput.includes('roll number')) {
      // Extract roll number from input
      const rollMatch = userInput.match(/roll\s*(no|number)?[\s:]*([A-Z0-9]+)/i);
      
      if (rollMatch && rollMatch[2]) {
        const rollNo = rollMatch[2].toUpperCase();
        const student = Array.isArray(students) && students.length > 0 ? students.find(s => s.roll_no && s.roll_no.toUpperCase() === rollNo) : null;
        
        if (student) {
          return {
            isAsync: true,
            rollNo: rollNo
          };
        } else {
          return {
            text: currentLang === 'hi' 
              ? `❌ रोल नंबर ${rollNo} नहीं मिला। कृपया सही रोल नंबर दें।`
              : `❌ Roll number ${rollNo} not found. Please provide correct roll number.`,
            quickActions: []
          };
        }
      } else {
        return {
          text: currentLang === 'hi' 
            ? '🔍 छात्र की जानकारी के लिए:\n\nप्रारूप: "Student roll no 23010120001"\n\nउदाहरण: "Student roll no 23010120001"'
            : '🔍 To find student information:\n\nFormat: "Student roll no 23010120001"\n\nExample: "Student roll no 23010120001"',
          quickActions: []
        };
      }
    }

    // IT Department
    if (lowerInput.includes('it') || lowerInput.includes('information technology') || lowerInput.includes('computer')) {
      if (lowerInput.includes('3rd year') || lowerInput.includes('third year') || lowerInput.includes('3 year')) {
        // Show IT 3rd year students
        const itStudents = Array.isArray(students) && students.length > 0 ? students.filter(s => {
          const dept = Array.isArray(departments) && departments.length > 0 ? departments.find(d => d.id === s.department_id) : null;
          return (dept && (dept.code === 'IT' || dept.name.toLowerCase().includes('information'))) && s.year === 3;
        }) : [];
        
        if (itStudents.length > 0) {
          let studentText = currentLang === 'hi' ? '👨‍🎓 IT तीसरे वर्ष के छात्र:\n\n' : '👨‍🎓 IT 3rd Year Students:\n\n';
          itStudents.forEach((student, idx) => {
            studentText += `${idx + 1}. ${student.name}\n   🎫 Roll No: ${student.roll_no}\n   📧 Email: ${student.email || 'N/A'}\n\n`;
          });
          
          return {
            text: studentText,
            quickActions: currentLang === 'hi' ? ['विभाग'] : ['Departments']
          };
        } else {
          return {
            text: currentLang === 'hi' 
              ? '❌ IT तीसरे वर्ष के छात्र नहीं मिले।'
              : '❌ No IT 3rd year students found.',
            quickActions: []
          };
        }
      }
      
      // Faculty information
      if (lowerInput.includes('teacher') || lowerInput.includes('faculty') || lowerInput.includes('staff') || lowerInput.includes('शिक्षक') || lowerInput.includes('अध्यापक')) {
        return {
          text: currentLang === 'hi'
            ? '👨‍🏫 IT विभाग के शिक्षक:\n\n🎓 HOD:\n• Mr. Govind Ballabh Pant\n\n👨‍🏫 Faculty Members:\n• Lecturer Mayank Bisht\n• Lecturer Ms. Kiran Chandra\n• Lecturer Harsita Rai Bagoli\n\n📞 विभाग कार्यालय से संपर्क करें।'
            : '👨‍🏫 IT Department Faculty:\n\n🎓 HOD:\n• Mr. Govind Ballabh Pant\n\n👨‍🏫 Faculty Members:\n• Lecturer Mayank Bisht\n• Lecturer Ms. Kiran Chandra\n• Lecturer Harsita Rai Bagoli\n\n📞 Contact department office.',
          quickActions: currentLang === 'hi' ? ['विभाग', 'छात्र विवरण'] : ['Departments', 'Student Details']
        };
      }
      
      return {
        text: currentLang === 'hi' 
          ? '💻 IT विभाग:\n\n👨‍🎓 HOD: Mr. Govind Ballabh Pant\n👨‍🏫 शिक्षक: 4\n👨‍🎓 छात्र: 95\n\n📚 फोकस: Programming, Web Development, Database, Networking\n\n💡 IT करियर के लिए बेहतरीन!'
          : '💻 IT Department:\n\n👨‍🎓 HOD: Mr. Govind Ballabh Pant\n👨‍🏫 Teachers: 4\n👨‍🎓 Students: 95\n\n📚 Focus: Programming, Web Development, Database, Networking\n\n💡 Great for IT career!',
        quickActions: currentLang === 'hi' ? ['शिक्षक', 'अन्य विभाग'] : ['Teachers', 'Other Departments']
      };
    }

    // Civil
    if (lowerInput.includes('civil')) {
      return {
        text: currentLang === 'hi' 
          ? '🏗️ सिविल इंजीनियरिंग:\n\n👨‍🎓 HOD: Dr. Ramesh Kumar\n👨‍🏫 शिक्षक: 5\n👨‍🎓 छात्र: 85\n\n📚 फोकस: Infrastructure, Construction\n\n💡 निर्माण उद्योग के लिए सही!'
          : '🏗️ Civil Engineering:\n\n👨‍🎓 HOD: Dr. Ramesh Kumar\n👨‍🏫 Teachers: 5\n👨‍🎓 Students: 85\n\n📚 Focus: Infrastructure, Construction\n\n💡 Perfect for construction industry!',
        quickActions: ['Departments']
      };
    }

    // Electronics
    if (lowerInput.includes('electronic') || lowerInput.includes('ece')) {
      return {
        text: currentLang === 'hi' 
          ? '📱 इलेक्ट्रॉनिक्स इंजीनियरिंग:\n\n👨‍🎓 HOD: Dr. Ashok Menon\n👨‍🏫 शिक्षक: 5\n👨‍🎓 छात्र: 75\n\n📚 फोकस: Circuits, Embedded Systems\n\n💡 इलेक्ट्रॉनिक्स के लिए बेहतर!'
          : '📱 Electronics Engineering:\n\n👨‍🎓 HOD: Dr. Ashok Menon\n👨‍🏫 Teachers: 5\n👨‍🎓 Students: 75\n\n📚 Focus: Circuits, Embedded Systems\n\n💡 Great for electronics industry!',
        quickActions: ['Departments']
      };
    }

    // Mechanical
    if (lowerInput.includes('mechanical') || lowerInput.includes('mech')) {
      return {
        text: currentLang === 'hi' 
          ? '🔧 मैकेनिकल इंजीनियरिंग:\n\n👨‍🎓 HOD: Dr. Prabhu Modi\n👨‍🏫 शिक्षक: 4\n👨‍🎓 छात्र: 78\n\n📚 फोकस: Manufacturing, Design\n\n💡 निर्माण के लिए उत्कृष्ट!'
          : '🔧 Mechanical Engineering:\n\n👨‍🎓 HOD: Dr. Prabhu Modi\n👨‍🏫 Teachers: 4\n👨‍🎓 Students: 78\n\n📚 Focus: Manufacturing, Design\n\n💡 Excellent for manufacturing!',
        quickActions: ['Departments']
      };
    }

    // Pharmacy
    if (lowerInput.includes('pharm') || lowerInput.includes('pharmacy')) {
      return {
        text: currentLang === 'hi' 
          ? '💊 फार्मेसी विभाग:\n\n👨‍🎓 HOD: Dr. Lakshmi Pillai\n👨‍🏫 शिक्षक: 5\n👨‍🎓 छात्र: 88\n\n📚 फोकस: Drug Formulation, Healthcare\n\n💡 फार्मा उद्योग के लिए सही!'
          : '💊 Pharmacy Department:\n\n👨‍🎓 HOD: Dr. Lakshmi Pillai\n👨‍🏫 Teachers: 5\n👨‍🎓 Students: 88\n\n📚 Focus: Drug Formulation, Healthcare\n\n💡 Perfect for pharma industry!',
        quickActions: ['Departments']
      };
    }

    // Placement
    if (lowerInput.includes('placement') || lowerInput.includes('job') || lowerInput.includes('career')) {
      return {
        text: currentLang === 'hi' 
          ? '💼 प्लेसमेंट सहायता:\n\n🎯 सफलता दर: 55%\n💰 पैकेज: 2.5 से 6 LPA\n\n🏢 कंपनियां:\n• TCS, Infosys, Wipro\n• L&T, Tata Motors\n• Tech Mahindra\n\n📞 placement@gplohaghat.ac.in'
          : '💼 Placement Support:\n\n🎯 Success Rate: 55%\n💰 Package: 2.5 to 6 LPA\n\n🏢 Companies: TCS, Infosys, Wipro, L&T, Tata Motors, Tech Mahindra\n\n📞 placement@gplohaghat.ac.in',
        quickActions: ['Departments']
      };
    }

    // Library
    if (lowerInput.includes('library') || lowerInput.includes('books') || lowerInput.includes('lib')) {
      return {
        text: currentLang === 'hi' 
          ? '📚 लाइब्रेरी सेवाएं:\n\n🕐 समय: सुबह 9 से शाम 6 बजे\n💻 डिजिटल पहुंच: 24/7\n📖 संग्रह: 50,000+ किताबें\n\n✨ सुविधाएं:\n• पढ़ने के कमरे\n• ई-बुक्स\n• अध्ययन कक्ष\n\n📍 मुख्य भवन की दूसरी मंजिल'
          : '📚 Library Services:\n\n🕐 Timings: 9 AM - 6 PM\n💻 Digital Access: 24/7\n📖 Collection: 50,000+ books\n\n✨ Features: Reading rooms, E-books, Study zones\n\n📍 2nd floor, Main building',
        quickActions: ['Contact']
      };
    }

    // Contact
    if (lowerInput.includes('contact') || lowerInput.includes('phone') || lowerInput.includes('address') || lowerInput.includes('number')) {
      return {
        text: currentLang === 'hi' 
          ? '📞 संपर्क जानकारी:\n\n📍 पता:\nGovernment Polytechnic, Lohaghat\nChampawat, Uttarakhand - 262524\n\n📞 Phone: +91-5946-XXXXX\n✉️ Email: info@gplohaghat.ac.in\n\n🕐 सोम-शनि: सुबह 9 से शाम 5 बजे'
          : '📞 Contact Information:\n\n📍 Address:\nGovernment Polytechnic, Lohaghat\nChampawat, Uttarakhand - 262524\n\n📞 Phone: +91-5946-XXXXX\n✉️ Email: info@gplohaghat.ac.in\n\n🕐 Mon-Sat: 9 AM - 5 PM',
        quickActions: currentLang === 'hi' ? ['स्थान'] : ['Location']
      };
    }

    // Help
    if (lowerInput.includes('help') || lowerInput.includes('help me') || lowerInput.includes('what can')) {
      return {
        text: currentLang === 'hi' 
          ? '🤔 मैं इन विषयों में मदद कर सकता हूं:\n\n🎓 प्रवेश जानकारी\n🏗️ विभाग विवरण\n💼 प्लेसमेंट\n📚 लाइब्रेरी\n📍 कैंपस स्थान\n\nकृपया कोई विषय चुनें!'
          : '🤔 I can help with:\n\n🎓 Admissions\n🏗️ Departments\n💼 Placements\n📚 Library\n📍 Location\n\nPlease choose a topic!',
        quickActions: currentLang === 'hi' ? ['प्रवेश', 'विभाग', 'प्लेसमेंट'] : ['Admissions', 'Departments', 'Placements']
      };
    }

    // Enhanced fallback with more intelligent responses
    const fallbackResponses = currentLang === 'hi' ? [
      '🤖 मुझे आपका प्रश्न समझ नहीं आया। क्या आप इसे अलग तरीके से पूछ सकते हैं?',
      '🤔 मैं आपकी बात समझ नहीं पाया। कृपया अपना प्रश्न स्पष्ट करें।',
      '😊 मुझे लगता है कि मैं आपके प्रश्न को पूरी तरह समझ नहीं पाया। क्या आप मुझे और जानकारी दे सकते हैं?',
      '🤖 मैं अभी भी सीख रहा हूं। कृपया नीचे दिए गए विकल्पों में से चुनें।'
    ] : [
      '🤖 I didn\'t understand your question. Could you rephrase it?',
      '🤔 I\'m not sure I caught that. Please clarify your question.',
      '😊 I think I need more context. Could you provide more details?',
      '🤖 I\'m still learning. Please choose from the options below.'
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      text: `${randomResponse}\n\n${currentLang === 'hi' 
        ? 'मैं इन विषयों में मदद कर सकता हूं:\n• प्रवेश और शुल्क\n• विभाग और छात्र जानकारी\n• परीक्षा और समय सारणी\n• हॉस्टल और परिवहन\n• प्लेसमेंट और लाइब्रेरी\n• प्रिंसिपल से संपर्क\n\nकृपया नीचे दिए गए विकल्पों में से चुनें या अपना प्रश्न स्पष्ट करें।'
        : 'I can help you with:\n• Admissions and Fees\n• Departments and Student Info\n• Exams and Timetable\n• Hostel and Transport\n• Placements and Library\n• Contact Principal\n\nPlease choose from options below or clarify your question.'}`,
      quickActions: currentLang === 'hi' ? ['प्रवेश', 'विभाग', 'छात्र विवरण', 'छात्र परिणाम', 'भवन डिजाइन', 'प्रिंसिपल पोर्टल', 'वेब खोज', 'कॉलेज खोज'] : ['Admissions', 'Departments', 'Student Details', 'Student Result', 'Building Design', 'Principal Portal', 'Search Web', 'College Search']
    };
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setLastUserInput(text);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { type: 'user', text, time: now }]);
    setInput('');
    setIsTyping(true);

    // Check for special flows first (student flow, redirects, etc.)
    const localResponse = getResponse(text);
    
    // Handle student flow state transitions
    if (localResponse.studentFlowStart) {
      setStudentFlow({ active: true, step: 'chooseDept', dept: null });
      await typeOut(localResponse.text, localResponse.quickActions || []);
      return;
    }
    if (localResponse.studentFlowNext) {
      setStudentFlow({ active: true, step: localResponse.studentFlowNext.step, dept: localResponse.studentFlowNext.dept || null });
      await typeOut(localResponse.text, localResponse.quickActions || []);
      return;
    }

    // Handle redirects
    if (localResponse.redirectTo) {
      // Check if it's an external URL
      if (localResponse.redirectTo.startsWith('http')) {
        window.open(localResponse.redirectTo, '_blank');
      } else {
        window.location.href = localResponse.redirectTo;
      }
      await typeOut(localResponse.text, localResponse.quickActions || []);
      return;
    }

    // Handle async responses (like fetching student details)
    if (localResponse.isAsync && localResponse.rollNo) {
      try {
        const apiResponse = await fetch(api.students.getByRollNo(localResponse.rollNo));
        const data = await apiResponse.json();
        
        if (data.success && data.data) {
          let resultText = currentLang === 'hi' 
            ? `👨‍🎓 छात्र का पूरा विवरण:\n\n📛 नाम: ${data.data.name}\n🎫 रोल नंबर: ${data.data.roll_no}\n🏛️ विभाग: ${data.data.department_name}\n📅 वर्ष: ${data.data.year}\n📧 ईमेल: ${data.data.email || 'N/A'}\n📞 फोन: ${data.data.phone || 'N/A'}\n📍 पता: ${data.data.address || 'N/A'}\n\n`
            : `👨‍🎓 Complete Student Details:\n\n📛 Name: ${data.data.name}\n🎫 Roll No: ${data.data.roll_no}\n🏛️ Department: ${data.data.department_name}\n📅 Year: ${data.data.year}\n📧 Email: ${data.data.email || 'N/A'}\n📞 Phone: ${data.data.phone || 'N/A'}\n📍 Address: ${data.data.address || 'N/A'}\n\n`;
          
          await typeOut(resultText, []);
          if (localResponse.fromStudentFlow) {
            setStudentFlow({ active: false, step: null, dept: null });
          }
        }
      } catch (error) {
        await typeOut(localResponse.text, localResponse.quickActions || []);
      }
      return;
    }

    // Use Gemini AI for ALL questions (ultra-smart mode)
    try {
      // Build conversation history for better context (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Always try Gemini AI first for intelligent responses
      const response = await fetch(api.chatbot.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          language: currentLang,
          conversationHistory: conversationHistory
        })
      });

      const data = await response.json();
      
      if (data.success && data.response) {
        // Use Gemini AI response - it's smart enough for everything!
        // Only use local quickActions if they exist
        await typeOut(data.response, localResponse.quickActions || []);
      } else {
        // Fallback to local response only if Gemini completely fails
        await typeOut(localResponse.text, localResponse.quickActions || []);
      }
    } catch (error) {
      console.error('Chatbot Gemini API error:', error);
      // Fallback to local response if API fails completely
      await typeOut(localResponse.text, localResponse.quickActions || []);
    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  const editMessage = (index) => {
    setEditingMessage(index);
  };

  const saveEditedMessage = (index, newText) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, text: newText } : msg
    ));
    setEditingMessage(null);
  };

  const deleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  // Instant message display (no typing animation)
  const typeOut = (fullText, quickActions = []) => {
    return new Promise((resolve) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsTyping(false);
      
      // Show message instantly
      setMessages(prev => [...prev, { type: 'bot', text: fullText, quickActions, time: now }]);
      
      // Speak text if not muted
      if (!isMuted && fullText) {
        setTimeout(() => {
          speakText(fullText, currentLang === 'hi' ? 'hi-IN' : 'en-US');
        }, 100);
      }
      
      resolve();
    });
  };

  const quickButtons = [
    { en: '🎓 Admissions', hi: '🎓 प्रवेश' },
    { en: '🏗️ All Departments', hi: '🏗️ सभी विभाग' },
    { en: '👨‍🎓 Student Details', hi: '👨‍🎓 छात्र विवरण' },
    { en: '📊 Student Result', hi: '📊 छात्र परिणाम' },
    { en: '🏛️ Building Design', hi: '🏛️ भवन डिजाइन' },
    { en: '🔎 Search Web', hi: '🔎 वेब खोज' },
    { en: '🏛️ College Search', hi: '🏛️ कॉलेज खोज' },
    { en: '🤖 Smart Campus', hi: '🤖 स्मार्ट कैंपस' },
    { en: '🗓️ Attendance', hi: '🗓️ उपस्थिति' },
    { en: '👨‍💼 Principal Portal', hi: '👨‍💼 प्रिंसिपल पोर्टल' },
    { en: '🆘 Help', hi: '🆘 सहायता' },
    { en: '💼 Placements', hi: '💼 प्लेसमेंट' },
    { en: '📚 Library', hi: '📚 लाइब्रेरी' },
    { en: '🎖️ Scholarships', hi: '🎖️ छात्रवृत्ति' },
    { en: '💳 Fees', hi: '💳 शुल्क' },
    { en: '🕒 Timetable', hi: '🕒 समय सारणी' },
    { en: '🏠 Hostel', hi: '🏠 हॉस्टल' },
    { en: '🚌 Transport', hi: '🚌 परिवहन' },
    { en: '📣 Events', hi: '📣 कार्यक्रम' },
    { en: '🗺️ Campus Map', hi: '🗺️ कैंपस मैप' },
    { en: '📞 Contact', hi: '📞 संपर्क' }
  ];

  return (
    <>
      {/* Quick Action Buttons - Below Chatbot */}
      {!isOpen && (
        <div className="chatbot-quick-actions">
          <NavLink to="/timetable" className={({ isActive }) => `quick-action-btn ${isActive ? 'active' : ''}`} title="Timetable">
            📅
          </NavLink>
          <NavLink to="/nssncc" className={({ isActive }) => `quick-action-btn ${isActive ? 'active' : ''}`} title="NSS & NCC">
            🎖️
          </NavLink>
          <a 
            href="/contact" 
            className="quick-action-btn principal-action-btn"
            title="Principal Portal"
          >
            👨‍💼
          </a>
        </div>
      )}
      
      <button className="chatbot-fab-new" onClick={() => {
        setIsOpen(!isOpen);
        if (!isOpen) {
          setIsFullscreen(true); // Always open in fullscreen
        }
      }}>
        {!isOpen && (
          <div className="chatbot-logo-icon">
            <HeaderLogo size={48} animated={true} />
          </div>
        )}
        {isOpen && <span className="close-icon">✕</span>}
      </button>

      {isOpen && (
        <div className={`chatbot-panel-new ${isFullscreen ? 'fullscreen' : ''}`}>
          {/* Top Header */}
          <div className="chatbot-top-header">
            <div className="header-left">
              <div className="logo-grid">🏛️</div>
              <span className="logo-text">CampusBot</span>
            </div>
            <div className="header-center">
              <h2>AI Chat</h2>
            </div>
            <div className="header-right">
              <button className="icon-btn" onClick={() => sendMessage('results')} title="History">🕐</button>
              <button className="icon-btn" onClick={() => setIsMuted(!isMuted)} title="Settings">⚙️</button>
              <button className="icon-btn" onClick={() => setIsOpen(false)} title="Close">×</button>
            </div>
          </div>

          <div className="chatbot-main-layout">
            {/* Left Sidebar */}
            <div className="chatbot-sidebar-left">
              <div className="sidebar-search">
                <input 
                  type="text" 
                  placeholder="Search... ⌘K" 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <nav className="sidebar-nav">
                <div className="nav-item active" onClick={() => sendMessage('hello')}>💬 AI Chat</div>
                <div className="nav-item" onClick={() => sendMessage('all departments')}>📁 Projects</div>
                <div className="nav-item" onClick={() => sendMessage('admissions')}>📋 Templates</div>
                <div className="nav-item" onClick={() => sendMessage('student details')}>📄 Documents <span>+</span></div>
                <div className="nav-item" onClick={() => sendMessage('help')}>👥 Community <span className="badge">NEW</span></div>
                <div className="nav-item" onClick={() => sendMessage('results')}>🕐 History</div>
                <div className="nav-divider"></div>
                <div className="nav-item" onClick={() => setIsMuted(!isMuted)}>⚙️ Settings & Help</div>
                <div className="nav-item" onClick={() => sendMessage('help')}>❓ Help</div>
              </nav>
              <div className="sidebar-footer">
                <div className="theme-toggle">
                  <span className={currentLang === 'en' ? 'active' : ''} onClick={() => setCurrentLang('en')}>🇬🇧 EN</span>
                  <span className={currentLang === 'hi' ? 'active' : ''} onClick={() => setCurrentLang('hi')}>🇮🇳 HI</span>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="chatbot-main-content">
              {messages.length === 1 && (
                <div className="welcome-section">
                  <h1>Welcome to CampusBot</h1>
                  <p>Get started by asking a question and CampusBot can do the rest. Not sure where to start?</p>
                  <div className="quick-actions-grid">
                    <button className="quick-action-card" onClick={() => sendMessage('🎓 Admissions')}>
                      <span className="action-icon yellow">🎓</span>
                      <span className="action-text">Admissions</span>
                      <span className="action-arrow">→</span>
                    </button>
                    <button className="quick-action-card" onClick={() => sendMessage('🏗️ Departments')}>
                      <span className="action-icon blue">🏗️</span>
                      <span className="action-text">Departments</span>
                      <span className="action-arrow">→</span>
                    </button>
                    <button className="quick-action-card" onClick={() => sendMessage('👨‍🎓 Student Details')}>
                      <span className="action-icon green">👨‍🎓</span>
                      <span className="action-text">Student Info</span>
                      <span className="action-arrow">→</span>
                    </button>
                    <button className="quick-action-card" onClick={() => sendMessage('📊 Results')}>
                      <span className="action-icon pink">📊</span>
                      <span className="action-text">Results</span>
                      <span className="action-arrow">→</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="chatbot-messages-new">
            {messages.map((msg, idx) => (
              <div key={idx} className="message-wrapper">
                <div className={`message-new ${msg.type}`}>
                  {editingMessage === idx ? (
                    <div className="edit-message-form">
                      <textarea
                        value={msg.text}
                        onChange={(e) => setMessages(prev => prev.map((message, i) => 
                          i === idx ? { ...message, text: e.target.value } : message
                        ))}
                        className="edit-textarea"
                        rows="3"
                      />
                      <div className="edit-buttons">
                        <button onClick={() => saveEditedMessage(idx, msg.text)} className="save-btn">
                          Save
                        </button>
                        <button onClick={() => setEditingMessage(null)} className="cancel-btn">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre>{msg.text}</pre>
                  )}
                  {isAdminMode && msg.type === 'bot' && editingMessage !== idx && (
                    <div className="admin-controls">
                      <button onClick={() => editMessage(idx)} className="edit-btn" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => deleteMessage(idx)} className="delete-btn" title="Delete">
                        🗑️
                      </button>
                    </div>
                  )}
                  {/* meta row with timestamp if available */}
                  {msg.time && (
                    <div className="meta-row">{msg.time}</div>
                  )}
                </div>
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="quick-actions-new">
                    {msg.quickActions.map((action, i) => (
                      <button
                        key={i}
                        className="quick-action-btn-new"
                        onClick={() => sendMessage(action)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message-new bot">
                <div className="typing-indicator-new">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="chatbot-input-new">
                <div className="input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "👂 Listening..." : currentLang === 'hi' ? "प्रश्न पूछें..." : "Ask anything..."}
                    disabled={isListening || isTyping}
                    className="main-input"
                  />
                  <div className="input-actions-left">
                    <button type="button" className="input-action-btn" onClick={() => sendMessage('help')} title="Attach">📎</button>
                    <button 
                      type="button" 
                      className={`input-action-btn ${isListening ? 'listening' : ''}`}
                      onClick={isListening ? () => { setIsListening(false); recognitionRef.current?.stop(); } : () => { setIsListening(true); recognitionRef.current?.start(); }}
                      title={isListening ? 'Stop listening' : 'Voice Message'}
                      disabled={isTyping}
                    >
                      {isListening ? '🛑' : '🎤'}
                    </button>
                    <button type="button" className="input-action-btn" onClick={() => sendMessage('all departments')} title="Browse Prompts">📁</button>
                  </div>
                  <div className="input-actions-right">
                    <span className="char-count">{1000 - input.length}</span>
                    <button type="submit" disabled={isListening || isTyping} className="send-btn">
                      {isTyping ? '⏳' : '→'}
                    </button>
                  </div>
                </div>
                <div className="input-footer">
                  <button type="button" className="footer-btn" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? '🔇 Muted' : '🔊 Voice On'}
                  </button>
                  {isSpeaking && (
                    <button type="button" className="footer-btn" onClick={stopSpeaking}>⏹️ Stop</button>
                  )}
                  <span className="disclaimer">CampusBot may generate inaccurate information. CampusBot AI v1.0</span>
                </div>
              </form>
            </div>

            {/* Right Sidebar */}
            <div className="chatbot-sidebar-right">
              <div className="sidebar-section">
                <div className="section-header">
                  <h3>Quick Actions</h3>
                  <span className="section-badge">75%</span>
                </div>
                <button className="new-project-btn" onClick={() => sendMessage('help')}>+ New Action</button>
                <div className="suggestions-list">
                  <div className="suggestion-item" onClick={() => sendMessage('admissions')}>
                    <div className="suggestion-title">🎓 Admissions Info</div>
                    <div className="suggestion-desc">Get admission details...</div>
                  </div>
                  <div className="suggestion-item" onClick={() => sendMessage('all departments')}>
                    <div className="suggestion-title">🏗️ Department List</div>
                    <div className="suggestion-desc">View all departments...</div>
                  </div>
                  <div className="suggestion-item" onClick={() => sendMessage('student details')}>
                    <div className="suggestion-title">👨‍🎓 Student Search</div>
                    <div className="suggestion-desc">Find student by roll no...</div>
                  </div>
                  <div className="suggestion-item" onClick={() => sendMessage('results')}>
                    <div className="suggestion-title">📊 Check Results</div>
                    <div className="suggestion-desc">View semester results...</div>
                  </div>
                  <div className="suggestion-item" onClick={() => sendMessage('contact')}>
                    <div className="suggestion-title">📞 Contact Info</div>
                    <div className="suggestion-desc">College contact details...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
