// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: translations.js                                      ║
// ║  PATH: frontend/src/utils/translations.js                   ║
// ║                                                              ║
// ║  KYA HAI? → English/Hindi translations for the whole app.   ║
// ║  → useLanguage() hook se t('key') call karo, translation    ║
// ║    mil jayega current language ke hisaab se.                ║
// ╚══════════════════════════════════════════════════════════════╝

const translations = {
  // ════════════════════════════════════════════════════════════
  // NAVBAR
  // ════════════════════════════════════════════════════════════
  nav: {
    home:           { en: 'Home',          hi: 'होम' },
    about:          { en: 'About',         hi: 'हमारे बारे में' },
    courses:        { en: 'Courses',       hi: 'पाठ्यक्रम' },
    faculty:        { en: 'Faculty',       hi: 'संकाय' },
    gallery:        { en: 'Gallery',       hi: 'गैलरी' },
    events:         { en: 'Events',        hi: 'कार्यक्रम' },
    contact:        { en: 'Contact',       hi: 'संपर्क' },
    login:          { en: 'Login',         hi: 'लॉगिन' },
    applyNow:       { en: 'Apply Now',     hi: 'अभी आवेदन करें' },
    logOut:         { en: 'Log Out',       hi: 'लॉग आउट' },
    loggedOut:      { en: 'Logged out successfully', hi: 'सफलतापूर्वक लॉग आउट हो गया' },
    adminPanel:     { en: 'Admin Panel',   hi: 'एडमिन पैनल' },
    myFees:         { en: 'My Fees',       hi: 'मेरी फीस' },
    myResults:      { en: 'My Results',    hi: 'मेरे परिणाम' },
    myAttendance:   { en: 'My Attendance', hi: 'मेरी उपस्थिति' },
    myIdCard:       { en: 'My ID Card',    hi: 'मेरा आई.डी. कार्ड' },
    myTimetable:    { en: 'My Timetable',  hi: 'मेरा टाइमटेबल' },
    myHallTicket:   { en: 'My Hall Ticket', hi: 'मेरा हॉल टिकट' },
    myLeave:        { en: 'My Leave',      hi: 'मेरी छुट्टी' },
    myLibrary:      { en: 'My Library',    hi: 'मेरी लाइब्रेरी' },
    myScholarships: { en: 'My Scholarships', hi: 'मेरी छात्रवृत्ति' },
    myFeedback:     { en: 'My Feedback',   hi: 'मेरी प्रतिक्रिया' },
    myCertificates: { en: 'My Certificates', hi: 'मेरे प्रमाणपत्र' },
    myExams:        { en: 'My Exams',        hi: 'मेरी परीक्षाएँ' },
    myProfile:      { en: 'My Profile',    hi: 'मेरी प्रोफ़ाइल' },
    dashboard:      { en: 'Dashboard',     hi: 'डैशबोर्ड' },
    attendance:     { en: 'Attendance',    hi: 'उपस्थिति' },
    idCard:         { en: 'ID Card',       hi: 'आई.डी. कार्ड' },
    hallTicket:     { en: 'Hall Ticket',   hi: 'हॉल टिकट' },
    leave:          { en: 'Leave',         hi: 'छुट्टी' },
    library:        { en: 'Library',       hi: 'लाइब्रेरी' },
    scholarships:   { en: 'Scholarships',  hi: 'छात्रवृत्ति' },
    feedback:       { en: 'Feedback',      hi: 'प्रतिक्रिया' },
    certificates:   { en: 'Certificates',  hi: 'प्रमाणपत्र' },
    apply:          { en: 'Apply',         hi: 'आवेदन' },
  },

  // ════════════════════════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════════════════════════
  footer: {
    brand:          { en: 'Kingswell College',   hi: 'किंग्सवेल कॉलेज' },
    brandDesc:      { en: 'Shaping futures through excellence in education. Empowering students to achieve their highest potential since 1985.',
                      hi: 'शिक्षा में उत्कृष्टता के माध्यम से भविष्य को आकार देना। 1985 से छात्रों को उनकी सर्वोच्च क्षमता प्राप्त करने के लिए सशक्त बनाना।' },
    quickLinks:     { en: 'Quick Links',         hi: 'त्वरित लिंक' },
    aboutUs:        { en: 'About Us',            hi: 'हमारे बारे में' },
    admissions:     { en: 'Admissions',          hi: 'प्रवेश' },
    contactInfo:    { en: 'Contact Info',        hi: 'संपर्क जानकारी' },
    address:        { en: '123 College Road, Nairobi, Kenya', hi: '123 कॉलेज रोड, नैरोबी, केन्या' },
    officeHours:    { en: 'Mon–Fri: 8:00 AM – 5:00 PM', hi: 'सोम–शुक्र: सुबह 8:00 – शाम 5:00' },
    newsletter:     { en: 'Newsletter',          hi: 'न्यूज़लेटर' },
    newsletterDesc: { en: 'Stay updated with admissions, events, and news.', hi: 'प्रवेश, कार्यक्रम और समाचार से अपडेट रहें।' },
    emailPlaceholder: { en: 'Enter your email',  hi: 'अपना ईमेल दर्ज करें' },
    subscribe:      { en: 'Subscribe',           hi: 'सब्सक्राइब करें' },
    copyright:      { en: 'Kingswell Institute of Technology. All rights reserved.',
                      hi: 'किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी। सर्वाधिकार सुरक्षित।' },
    privacy:        { en: 'Privacy Policy',      hi: 'गोपनीयता नीति' },
    terms:          { en: 'Terms of Use',        hi: 'उपयोग की शर्तें' },
  },

  // ════════════════════════════════════════════════════════════
  // HOME PAGE
  // ════════════════════════════════════════════════════════════
  home: {
    whyBadge:       { en: 'Why Kingswell?',      hi: 'किंग्सवेल क्यों?' },
    whyTitle:       { en: 'A College Built for',  hi: 'उत्कृष्टता के लिए बना' },
    whyHighlight:   { en: 'Excellence',           hi: 'कॉलेज' },
    whySubtitle:    { en: 'We combine academic rigour with practical experience to prepare students for a competitive world.',
                      hi: 'हम छात्रों को प्रतिस्पर्धी दुनिया के लिए तैयार करने हेतु अकादमिक कठोरता को व्यावहारिक अनुभव से जोड़ते हैं।' },
    feat1Title:     { en: 'Accredited Programs',  hi: 'मान्यता प्राप्त कार्यक्रम' },
    feat1Desc:      { en: 'All our programs are nationally and internationally accredited, ensuring quality education.',
                      hi: 'हमारे सभी कार्यक्रम राष्ट्रीय और अंतरराष्ट्रीय स्तर पर मान्यता प्राप्त हैं, जो गुणवत्तापूर्ण शिक्षा सुनिश्चित करते हैं।' },
    feat2Title:     { en: 'Expert Faculty',       hi: 'विशेषज्ञ संकाय' },
    feat2Desc:      { en: 'Learn from industry professionals and experienced academics with proven track records.',
                      hi: 'उद्योग पेशेवरों और अनुभवी शिक्षाविदों से सीखें जिनके पास सिद्ध ट्रैक रिकॉर्ड है।' },
    feat3Title:     { en: 'Modern Curriculum',    hi: 'आधुनिक पाठ्यक्रम' },
    feat3Desc:      { en: 'Industry-aligned curriculum updated regularly to meet current market demands.',
                      hi: 'वर्तमान बाज़ार की माँगों को पूरा करने के लिए नियमित रूप से अपडेट किया गया उद्योग-संरेखित पाठ्यक्रम।' },
    feat4Title:     { en: 'Global Exposure',      hi: 'वैश्विक एक्सपोज़र' },
    feat4Desc:      { en: 'Exchange programs and partnerships with top universities around the world.',
                      hi: 'दुनिया भर के शीर्ष विश्वविद्यालयों के साथ विनिमय कार्यक्रम और साझेदारियाँ।' },

    coursesBadge:    { en: 'Academic Programmes',  hi: 'शैक्षणिक कार्यक्रम' },
    coursesTitle:   { en: 'Explore Our',          hi: 'हमारे पाठ्यक्रम' },
    coursesHL:      { en: 'Courses',              hi: 'देखें' },
    coursesSub:     { en: 'From certificates to postgraduate degrees — find the programme that fits your ambitions.',
                      hi: 'प्रमाणपत्र से स्नातकोत्तर डिग्री तक — अपनी महत्वाकांक्षा के अनुकूल कार्यक्रम खोजें।' },
    viewAll:        { en: 'View All Programmes',  hi: 'सभी कार्यक्रम देखें' },

    graduates:      { en: 'Graduates',            hi: 'स्नातक' },
    programmes:     { en: 'Programmes',           hi: 'कार्यक्रम' },
    facultyMembers: { en: 'Faculty Members',      hi: 'संकाय सदस्य' },
    yearsOp:        { en: 'Years of Operation',   hi: 'संचालन के वर्ष' },

    storiesBadge:   { en: 'Student Stories',      hi: 'छात्र अनुभव' },
    storiesTitle:   { en: 'What Our',             hi: 'हमारे छात्र' },
    storiesHL:      { en: 'Students Say',         hi: 'क्या कहते हैं' },

    noticeBadge:    { en: 'Announcements',        hi: 'घोषणाएँ' },
    noticeTitle:    { en: 'Notice',               hi: 'सूचना' },
    noticeHL:       { en: 'Board',                hi: 'पट्ट' },
    noticeSub:      { en: 'Stay updated with the latest news, events and important announcements.',
                      hi: 'नवीनतम समाचार, कार्यक्रम और महत्वपूर्ण घोषणाओं से अपडेट रहें।' },
    pinned:         { en: 'Pinned',               hi: 'पिन किया गया' },

    ctaTitle:       { en: 'Ready to Start Your',  hi: 'अपनी यात्रा शुरू' },
    ctaHL:          { en: 'Journey?',             hi: 'करने के लिए तैयार?' },
    ctaDesc:        { en: 'Applications for the 2026/2027 academic year are now open. Secure your spot today.',
                      hi: '2026/2027 शैक्षणिक वर्ष के आवेदन अब खुले हैं। आज ही अपनी सीट सुरक्षित करें।' },
    ctaApply:       { en: 'Apply for Admission',  hi: 'प्रवेश के लिए आवेदन करें' },
    ctaAdvisor:     { en: 'Talk to an Advisor',   hi: 'सलाहकार से बात करें' },
  },

  // ════════════════════════════════════════════════════════════
  // ABOUT PAGE
  // ════════════════════════════════════════════════════════════
  about: {
    badge:          { en: 'Our Story',            hi: 'हमारी कहानी' },
    title:          { en: 'About',                hi: 'के बारे में' },
    highlight:      { en: 'Kingswell Institute of Technology', hi: 'किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी' },
    desc:           { en: 'For over 40 years, Kingswell Institute of Technology has been at the forefront of quality education in East Africa, transforming lives and communities through academic excellence.',
                      hi: '40 से अधिक वर्षों से, किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी पूर्वी अफ्रीका में गुणवत्तापूर्ण शिक्षा में अग्रणी रहा है, शैक्षणिक उत्कृष्टता के माध्यम से जीवन और समुदायों को बदल रहा है।' },

    mission:        { en: 'Mission',              hi: 'मिशन' },
    missionText:    { en: 'To provide accessible, quality education that empowers students with knowledge, skills, and values to thrive in a rapidly evolving world.',
                      hi: 'सुलभ, गुणवत्तापूर्ण शिक्षा प्रदान करना जो छात्रों को ज्ञान, कौशल और मूल्यों से सशक्त बनाती है ताकि वे तेज़ी से बदलती दुनिया में सफल हो सकें।' },
    vision:         { en: 'Vision',               hi: 'विज़न' },
    visionText:     { en: 'To be a globally recognised centre of academic excellence and innovation, shaping the leaders of tomorrow.',
                      hi: 'शैक्षणिक उत्कृष्टता और नवाचार का विश्व स्तर पर मान्यता प्राप्त केंद्र बनना, कल के नेताओं को आकार देना।' },
    coreValues:     { en: 'Core Values',          hi: 'मूल मूल्य' },
    coreValuesText: { en: 'Integrity, Excellence, Innovation, Inclusivity, and Community Service form the cornerstone of everything we do at Kingswell Institute of Technology.',
                      hi: 'ईमानदारी, उत्कृष्टता, नवाचार, समावेशिता और सामुदायिक सेवा किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी में हमारे हर काम की आधारशिला हैं।' },

    journeyBadge:   { en: 'Our Journey',          hi: 'हमारी यात्रा' },
    journeyTitle:   { en: 'College',              hi: 'कॉलेज' },
    journeyHL:      { en: 'Timeline',             hi: 'समयरेखा' },

    mile1:          { en: 'Kingswell Institute of Technology founded with 200 students and 3 programmes.',
                      hi: 'किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी की स्थापना 200 छात्रों और 3 कार्यक्रमों के साथ हुई।' },
    mile2:          { en: 'Expanded to new campus, introducing Health Sciences faculty.',
                      hi: 'नए कैंपस में विस्तार, स्वास्थ्य विज्ञान संकाय की शुरुआत।' },
    mile3:          { en: 'Achieved national accreditation and launched first undergraduate degrees.',
                      hi: 'राष्ट्रीय मान्यता प्राप्त की और पहली स्नातक डिग्री शुरू की।' },
    mile4:          { en: 'Reached 10,000 alumni milestone; opened Technology Innovation Hub.',
                      hi: '10,000 पूर्व छात्रों का मील का पत्थर; प्रौद्योगिकी नवाचार हब खोला।' },
    mile5:          { en: 'Launched online learning platform, serving students across 20 countries.',
                      hi: 'ऑनलाइन लर्निंग प्लेटफ़ॉर्म लॉन्च किया, 20 देशों के छात्रों को सेवा प्रदान की।' },

    achieveBadge:   { en: 'Achievements',         hi: 'उपलब्धियाँ' },
    achieveTitle:   { en: 'Our',                  hi: 'हमारी' },
    achieveHL:      { en: 'Accomplishments',      hi: 'उपलब्धियाँ' },
    ach1:           { en: 'Nationally accredited by the Kenya National Qualifications Authority',
                      hi: 'केन्या राष्ट्रीय योग्यता प्राधिकरण द्वारा राष्ट्रीय स्तर पर मान्यता प्राप्त' },
    ach2:           { en: 'Member of the Association of African Universities (AAU)',
                      hi: 'अफ़्रीकी विश्वविद्यालय संघ (AAU) का सदस्य' },
    ach3:           { en: 'ISO 9001:2015 certified for quality management systems',
                      hi: 'गुणवत्ता प्रबंधन प्रणालियों के लिए ISO 9001:2015 प्रमाणित' },
    ach4:           { en: '3 consecutive years ranked Top 10 colleges in East Africa',
                      hi: 'लगातार 3 वर्ष पूर्वी अफ्रीका के शीर्ष 10 कॉलेजों में स्थान' },
    ach5:           { en: 'Over ₹ 50 million in student scholarships awarded annually',
                      hi: 'सालाना ₹ 5 करोड़ से अधिक छात्र छात्रवृत्तियाँ प्रदान' },
    ach6:           { en: 'Technology Innovation Hub partnered with 20+ tech companies',
                      hi: 'प्रौद्योगिकी नवाचार हब 20+ टेक कंपनियों के साथ साझेदारी' },
  },

  // ════════════════════════════════════════════════════════════
  // CONTACT PAGE
  // ════════════════════════════════════════════════════════════
  contact: {
    badge:          { en: 'Get in Touch',         hi: 'सम्पर्क करें' },
    title:          { en: 'Contact',              hi: 'सम्पर्क' },
    highlight:      { en: 'Us',                   hi: 'करें' },
    subtitle:       { en: 'Have questions? Our team is ready to assist you.',
                      hi: 'कोई प्रश्न हैं? हमारी टीम आपकी सहायता के लिए तैयार है।' },
    addressLabel:   { en: 'Address',              hi: 'पता' },
    phoneLabel:     { en: 'Phone',                hi: 'फ़ोन' },
    emailLabel:     { en: 'Email',                hi: 'ईमेल' },
    officeLabel:    { en: 'Office Hours',         hi: 'कार्यालय समय' },
    mapReady:       { en: 'Map integration ready', hi: 'मैप इंटीग्रेशन तैयार' },
    mapAdd:         { en: 'Add Google Maps embed here', hi: 'यहाँ Google Maps एम्बेड करें' },
    formTitle:      { en: 'Send a Message',       hi: 'संदेश भेजें' },
    nameLabel:      { en: 'Full Name',            hi: 'पूरा नाम' },
    phonePlaceholder: { en: '+254 700 000 000',   hi: '+254 700 000 000' },
    subjectLabel:   { en: 'Subject',              hi: 'विषय' },
    selectSubject:  { en: 'Select a subject',     hi: 'विषय चुनें' },
    subAdmission:   { en: 'Admission Inquiry',    hi: 'प्रवेश संबंधी पूछताछ' },
    subCourse:      { en: 'Course Information',   hi: 'पाठ्यक्रम जानकारी' },
    subFee:         { en: 'Fee Structure',        hi: 'शुल्क संरचना' },
    subSupport:     { en: 'Student Support',      hi: 'छात्र सहायता' },
    subGeneral:     { en: 'General Inquiry',      hi: 'सामान्य पूछताछ' },
    messageLabel:   { en: 'Message',              hi: 'संदेश' },
    messagePlaceholder: { en: 'Write your message here...', hi: 'यहाँ अपना संदेश लिखें...' },
    sendBtn:        { en: 'Send Message',         hi: 'संदेश भेजें' },
    sending:        { en: 'Sending...',           hi: 'भेज रहे हैं...' },
    sentTitle:      { en: 'Message Sent!',        hi: 'संदेश भेजा गया!' },
    sentDesc:       { en: "We'll get back to you within 24 hours.", hi: 'हम 24 घंटे के भीतर आपसे संपर्क करेंगे।' },
    sendAnother:    { en: 'Send Another Message', hi: 'एक और संदेश भेजें' },
    optional:       { en: 'optional',             hi: 'वैकल्पिक' },
    fillRequired:   { en: 'Please fill in all required fields', hi: 'कृपया सभी आवश्यक फ़ील्ड भरें' },
    sentSuccess:    { en: 'Message sent successfully!', hi: 'संदेश सफलतापूर्वक भेजा गया!' },
    sentFail:       { en: 'Failed to send message. Please try again.', hi: 'संदेश भेजने में विफल। कृपया पुनः प्रयास करें।' },
  },

  // ════════════════════════════════════════════════════════════
  // LOGIN PAGE
  // ════════════════════════════════════════════════════════════
  login: {
    welcome:        { en: 'Welcome',              hi: 'स्वागत' },
    back:           { en: 'Back',                 hi: 'है' },
    subtitle:       { en: 'Sign in to your Kingswell Institute of Technology account',
                      hi: 'अपने किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी खाते में साइन इन करें' },
    emailLabel:     { en: 'Email Address',        hi: 'ईमेल पता' },
    password:       { en: 'Password',             hi: 'पासवर्ड' },
    forgot:         { en: 'Forgot password?',     hi: 'पासवर्ड भूल गए?' },
    signIn:         { en: 'Sign In',              hi: 'साइन इन' },
    signingIn:      { en: 'Signing in...',        hi: 'साइन इन हो रहा है...' },
    noAccount:      { en: "Don't have an account?", hi: 'खाता नहीं है?' },
    registerHere:   { en: 'Register here',        hi: 'यहाँ रजिस्टर करें' },
    demoCreds:      { en: 'Demo Credentials',     hi: 'डेमो क्रेडेंशियल' },
    useAdmin:       { en: 'Use Admin',            hi: 'एडमिन उपयोग करें' },
    useStudent:     { en: 'Use Student',          hi: 'छात्र उपयोग करें' },
    fillAll:        { en: 'Please fill in all fields', hi: 'कृपया सभी फ़ील्ड भरें' },
    welcomeBack:    { en: 'Welcome back',         hi: 'फिर से स्वागत है' },
    invalid:        { en: 'Invalid email or password', hi: 'अमान्य ईमेल या पासवर्ड' },
  },

  // ════════════════════════════════════════════════════════════
  // ADMISSION PAGE
  // ════════════════════════════════════════════════════════════
  admission: {
    badge:          { en: 'Join Us',              hi: 'हमसे जुड़ें' },
    title:          { en: 'Online',               hi: 'ऑनलाइन' },
    highlight:      { en: 'Admission',            hi: 'प्रवेश' },
    subtitle:       { en: 'Complete the form below to apply for a place at Kingswell Institute of Technology.',
                      hi: 'किंग्सवेल इंस्टिट्यूट ऑफ़ टेक्नोलॉजी में प्रवेश के लिए नीचे फ़ॉर्म भरें।' },
    step0:          { en: 'Personal Info',        hi: 'व्यक्तिगत जानकारी' },
    step1:          { en: 'Academic Info',        hi: 'शैक्षणिक जानकारी' },
    step2:          { en: 'Review & Submit',      hi: 'समीक्षा और सबमिट' },
    firstName:      { en: 'First Name',           hi: 'पहला नाम' },
    lastName:       { en: 'Last Name',            hi: 'अंतिम नाम' },
    email:          { en: 'Email Address',        hi: 'ईमेल पता' },
    phone:          { en: 'Phone Number',         hi: 'फ़ोन नंबर' },
    dob:            { en: 'Date of Birth',        hi: 'जन्म तिथि' },
    gender:         { en: 'Gender',               hi: 'लिंग' },
    male:           { en: 'Male',                 hi: 'पुरुष' },
    female:         { en: 'Female',               hi: 'महिला' },
    other:          { en: 'Other',                hi: 'अन्य' },
    address:        { en: 'Home Address',         hi: 'घर का पता' },
    city:           { en: 'City',                 hi: 'शहर' },
    country:        { en: 'Country',              hi: 'देश' },
    idProofType:    { en: 'ID Proof Type',        hi: 'आई.डी. प्रमाण प्रकार' },
    aadhar:         { en: 'Aadhar Card',          hi: 'आधार कार्ड' },
    passport:       { en: 'Passport',             hi: 'पासपोर्ट' },
    nationalId:     { en: 'National ID',          hi: 'राष्ट्रीय आई.डी.' },
    drivingLicense: { en: 'Driving License',      hi: 'ड्राइविंग लाइसेंस' },
    idNumber:       { en: 'ID Proof Number',      hi: 'आई.डी. प्रमाण नंबर' },
    guardianName:   { en: 'Parent / Guardian Name', hi: 'अभिभावक का नाम' },
    emergencyContact: { en: 'Emergency Contact Number', hi: 'आपातकालीन संपर्क नंबर' },
    programme:      { en: 'Programme Applying For', hi: 'आवेदन किया जा रहा कार्यक्रम' },
    prevSchool:     { en: 'Previous School / Institution', hi: 'पिछला स्कूल / संस्थान' },
    prevGrade:      { en: 'Previous Academic Grade / Results', hi: 'पिछले शैक्षणिक ग्रेड / परिणाम' },
    review:         { en: 'Review Your Application', hi: 'अपने आवेदन की समीक्षा करें' },
    next:           { en: 'Next',                 hi: 'अगला' },
    previous:       { en: 'Previous',             hi: 'पिछला' },
    submit:         { en: 'Submit',               hi: 'सबमिट करें' },
    submitting:     { en: 'Submitting...',        hi: 'सबमिट हो रहा है...' },
    successTitle:   { en: 'Application Submitted!', hi: 'आवेदन सबमिट हो गया!' },
    successMsg:     { en: 'Your application has been received. We will review and contact you within 5–7 business days.',
                      hi: 'आपका आवेदन प्राप्त हो गया है। हम 5–7 कार्य दिवसों के भीतर समीक्षा करके आपसे संपर्क करेंगे।' },
    submitAnother:  { en: 'Submit Another Application', hi: 'एक और आवेदन सबमिट करें' },
  },

  // ════════════════════════════════════════════════════════════
  // COURSES PAGE
  // ════════════════════════════════════════════════════════════
  courses: {
    badge:          { en: 'Academic Programmes',  hi: 'शैक्षणिक कार्यक्रम' },
    title:          { en: 'Explore Our',          hi: 'हमारे पाठ्यक्रम' },
    highlight:      { en: 'Courses',              hi: 'देखें' },
    subtitle:       { en: 'From certificates to postgraduate degrees — find the programme that fits your ambitions.',
                      hi: 'प्रमाणपत्र से स्नातकोत्तर डिग्री तक — अपनी महत्वाकांक्षा के अनुकूल कार्यक्रम खोजें।' },
    allLevels:      { en: 'All',                  hi: 'सभी' },
    certificate:    { en: 'Certificate',          hi: 'प्रमाणपत्र' },
    diploma:        { en: 'Diploma',              hi: 'डिप्लोमा' },
    undergraduate:  { en: 'Undergraduate',        hi: 'स्नातक' },
    postgraduate:   { en: 'Postgraduate',         hi: 'स्नातकोत्तर' },
    professional:   { en: 'Professional',         hi: 'प्रोफेशनल' },
    department:     { en: 'Department',           hi: 'विभाग' },
    allDepts:       { en: 'All',                  hi: 'सभी' },
    technology:     { en: 'Technology',           hi: 'प्रौद्योगिकी' },
    business:       { en: 'Business',             hi: 'व्यापार' },
    healthSciences: { en: 'Health Sciences',      hi: 'स्वास्थ्य विज्ञान' },
    law:            { en: 'Law',                  hi: 'कानून' },
    finance:        { en: 'Finance',              hi: 'वित्त' },
    engineering:    { en: 'Engineering',          hi: 'इंजीनियरिंग' },
    arts:           { en: 'Arts',                 hi: 'कला' },
    duration:       { en: 'Duration',             hi: 'अवधि' },
    years:          { en: 'Years',                hi: 'वर्ष' },
    annualFee:      { en: 'Annual Fee',           hi: 'वार्षिक शुल्क' },
    applyNow:       { en: 'Apply Now',            hi: 'अभी आवेदन करें' },
    noCourses:      { en: 'No courses found matching your filters.', hi: 'आपके फ़िल्टर से कोई पाठ्यक्रम नहीं मिला।' },
  },

  // ════════════════════════════════════════════════════════════
  // EVENTS PAGE
  // ════════════════════════════════════════════════════════════
  events: {
    badge:          { en: 'Campus Life',          hi: 'कैंपस जीवन' },
    title:          { en: 'Events &',             hi: 'कार्यक्रम और' },
    highlight:      { en: 'Calendar',             hi: 'कैलेंडर' },
    all:            { en: 'All',                  hi: 'सभी' },
    academic:       { en: 'Academic',             hi: 'शैक्षणिक' },
    cultural:       { en: 'Cultural',             hi: 'सांस्कृतिक' },
    sports:         { en: 'Sports',               hi: 'खेल' },
    seminar:        { en: 'Seminar',              hi: 'सेमिनार' },
    workshop:       { en: 'Workshop',             hi: 'कार्यशाला' },
    holiday:        { en: 'Holiday',              hi: 'छुट्टी' },
    exam:           { en: 'Exam',                 hi: 'परीक्षा' },
    featured:       { en: 'Featured Events',      hi: 'मुख्य कार्यक्रम' },
    noEvents:       { en: 'No events found',      hi: 'कोई कार्यक्रम नहीं मिला' },
  },

  // ════════════════════════════════════════════════════════════
  // GALLERY PAGE
  // ════════════════════════════════════════════════════════════
  gallery: {
    badge:          { en: 'Campus Gallery',       hi: 'कैंपस गैलरी' },
    title:          { en: 'Photo',                hi: 'फ़ोटो' },
    highlight:      { en: 'Gallery',              hi: 'गैलरी' },
    all:            { en: 'All',                  hi: 'सभी' },
    campus:         { en: 'Campus',               hi: 'कैंपस' },
    graduation:     { en: 'Graduation',           hi: 'दीक्षांत' },
    academics:      { en: 'Academics',            hi: 'शैक्षणिक' },
    other:          { en: 'Other',                hi: 'अन्य' },
  },

  // ════════════════════════════════════════════════════════════
  // FACULTY PAGE
  // ════════════════════════════════════════════════════════════
  faculty: {
    badge:          { en: 'Meet the Team',        hi: 'टीम से मिलें' },
    title:          { en: 'Our',                  hi: 'हमारे' },
    highlight:      { en: 'Faculty',              hi: 'संकाय' },
  },

  // ════════════════════════════════════════════════════════════
  // COMMON / SHARED
  // ════════════════════════════════════════════════════════════
  common: {
    loading:        { en: 'Loading...',           hi: 'लोड हो रहा है...' },
    error:          { en: 'Something went wrong', hi: 'कुछ गलत हो गया' },
    save:           { en: 'Save',                 hi: 'सेव करें' },
    cancel:         { en: 'Cancel',               hi: 'रद्द करें' },
    delete:         { en: 'Delete',               hi: 'मिटाएँ' },
    edit:           { en: 'Edit',                 hi: 'संपादित करें' },
    search:         { en: 'Search',               hi: 'खोजें' },
    noData:         { en: 'No data found',        hi: 'कोई डेटा नहीं मिला' },
    viewAll:        { en: 'View All',             hi: 'सभी देखें' },
    readMore:       { en: 'Read More',            hi: 'और पढ़ें' },
    showMore:       { en: 'Show More',            hi: 'और दिखाएँ' },
    showLess:       { en: 'Show Less',            hi: 'कम दिखाएँ' },
  },

  // ════════════════════════════════════════════════════════════
  // PWA INSTALL PROMPT
  // ════════════════════════════════════════════════════════════
  pwa: {
    title:          { en: 'Install Kingswell App', hi: 'किंग्सवेल ऐप इंस्टॉल करें' },
    desc:           { en: 'Add to your home screen for quick access, offline support & a native app experience.',
                      hi: 'त्वरित एक्सेस, ऑफ़लाइन सपोर्ट और नेटिव ऐप अनुभव के लिए होम स्क्रीन पर जोड़ें।' },
    install:        { en: 'Install',              hi: 'इंस्टॉल करें' },
    notNow:         { en: 'Not Now',              hi: 'अभी नहीं' },
  },

  // ════════════════════════════════════════════════════════════
  // ONLINE EXAMS
  // ════════════════════════════════════════════════════════════
  exams: {
    title:          { en: 'My Exams',                            hi: 'मेरी परीक्षाएँ' },
    subtitle:       { en: 'Take MCQ exams online and view your results', hi: 'ऑनलाइन MCQ परीक्षा दें और अपने परिणाम देखें' },
    available:      { en: 'Available',                           hi: 'उपलब्ध' },
    upcoming:       { en: 'Upcoming',                            hi: 'आगामी' },
    completed:      { en: 'Completed',                           hi: 'पूर्ण' },
    availableTab:   { en: 'Available / Upcoming',                hi: 'उपलब्ध / आगामी' },
    completedTab:   { en: 'Completed',                           hi: 'पूर्ण' },
    noExams:        { en: 'No exams available right now',        hi: 'अभी कोई परीक्षा उपलब्ध नहीं है' },
    noCompleted:    { en: 'No completed exams yet',              hi: 'अभी तक कोई पूर्ण परीक्षा नहीं' },
  },
};

export default translations;
