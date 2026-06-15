$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..\..')
$OutDir = Join-Path $Root 'outputs\college_project_report'
$BuildDir = Join-Path $PSScriptRoot 'pptx_build'
$OutFile = Join-Path $OutDir 'college_management_system_full_project_report.pptx'

$resolvedScratch = [System.IO.Path]::GetFullPath($PSScriptRoot)
$resolvedBuild = [System.IO.Path]::GetFullPath($BuildDir)
if (-not $resolvedBuild.StartsWith($resolvedScratch, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Build path is outside scratch directory."
}
if (Test-Path $BuildDir) { Remove-Item -LiteralPath $BuildDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $BuildDir, $OutDir | Out-Null

$SlideW = 12192000
$SlideH = 6858000
$PX = 9525

function E([string]$s) {
  if ($null -eq $s) { return '' }
  return [System.Security.SecurityElement]::Escape($s)
}

function EMU([double]$v) { return [int64]([math]::Round($v * $PX)) }

function Add-File([string]$relative, [string]$content) {
  $path = Join-Path $BuildDir $relative
  $parent = Split-Path $path -Parent
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
}

function SolidFill([string]$hex) {
  if ([string]::IsNullOrWhiteSpace($hex) -or $hex -eq 'none') { return '<a:noFill/>' }
  $clean = $hex.TrimStart('#')
  return "<a:solidFill><a:srgbClr val=`"$clean`"/></a:solidFill>"
}

function Text-Paragraph([string]$text, [int]$size, [string]$color, [bool]$bold, [string]$font, [string]$align) {
  $b = if ($bold) { ' b="1"' } else { '' }
  $al = if ($align) { " algn=`"$align`"" } else { '' }
  $escaped = E $text
  $clr = $color.TrimStart('#')
  return "<a:p><a:pPr$al/><a:r><a:rPr lang=`"en-US`" sz=`"$($size * 100)`"$b><a:solidFill><a:srgbClr val=`"$clr`"/></a:solidFill><a:latin typeface=`"$font`"/></a:rPr><a:t>$escaped</a:t></a:r><a:endParaRPr lang=`"en-US`" sz=`"$($size * 100)`"/></a:p>"
}

function Add-ShapeXml(
  [int]$id, [string]$name, [string]$geometry,
  [double]$x, [double]$y, [double]$w, [double]$h,
  [string]$fill, [string]$line,
  [string[]]$paragraphs,
  [int]$fontSize, [string]$fontColor, [bool]$bold, [string]$font, [string]$align,
  [int]$inset = 14
) {
  $offX = EMU $x; $offY = EMU $y; $extW = EMU $w; $extH = EMU $h
  $fillXml = SolidFill $fill
  $lineXml = if ([string]::IsNullOrWhiteSpace($line) -or $line -eq 'none') {
    '<a:ln><a:noFill/></a:ln>'
  } else {
    "<a:ln w=`"12700`"><a:solidFill><a:srgbClr val=`"$($line.TrimStart('#'))`"/></a:solidFill></a:ln>"
  }
  $textXml = ''
  if ($paragraphs -and $paragraphs.Count -gt 0) {
    $body = ($paragraphs | ForEach-Object { Text-Paragraph $_ $fontSize $fontColor $bold $font $align }) -join ''
    $in = EMU $inset
    $textXml = "<p:txBody><a:bodyPr wrap=`"square`" lIns=`"$in`" tIns=`"$in`" rIns=`"$in`" bIns=`"$in`"><a:normAutofit/></a:bodyPr><a:lstStyle/>$body</p:txBody>"
  }
  return @"
<p:sp>
  <p:nvSpPr><p:cNvPr id="$id" name="$(E $name)"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
  <p:spPr><a:xfrm><a:off x="$offX" y="$offY"/><a:ext cx="$extW" cy="$extH"/></a:xfrm><a:prstGeom prst="$geometry"><a:avLst/></a:prstGeom>$fillXml$lineXml</p:spPr>
  $textXml
</p:sp>
"@
}

function Add-TextBoxXml(
  [int]$id, [string]$name,
  [double]$x, [double]$y, [double]$w, [double]$h,
  [string[]]$paragraphs,
  [int]$fontSize, [string]$fontColor, [bool]$bold = $false, [string]$font = 'Aptos', [string]$align = 'l'
) {
  return Add-ShapeXml $id $name 'rect' $x $y $w $h 'none' 'none' $paragraphs $fontSize $fontColor $bold $font $align 4
}

function Slide-Xml([int]$num, [string]$title, [string]$subtitle, [array]$blocks, [string]$section = 'Project Report') {
  $shapes = New-Object System.Collections.Generic.List[string]
  $id = 2
  $shapes.Add((Add-ShapeXml $id 'Background' 'rect' 0 0 1280 720 '#07111f' 'none' @() 1 '#FFFFFF' $false 'Aptos' 'l')); $id++
  $shapes.Add((Add-ShapeXml $id 'Top Accent' 'rect' 0 0 1280 10 '#D4AF37' 'none' @() 1 '#FFFFFF' $false 'Aptos' 'l')); $id++
  $shapes.Add((Add-TextBoxXml $id 'Section' 54 22 420 28 @($section) 12 '#D4AF37' $true 'Aptos' 'l')); $id++
  $shapes.Add((Add-TextBoxXml $id 'Title' 54 62 760 70 @($title) 31 '#FFFFFF' $true 'Aptos Display' 'l')); $id++
  if ($subtitle) { $shapes.Add((Add-TextBoxXml $id 'Subtitle' 56 126 820 46 @($subtitle) 14 '#A7B4C8' $false 'Aptos' 'l')); $id++ }
  $shapes.Add((Add-TextBoxXml $id 'Slide Number' 1120 660 110 24 @("$(('{0:d2}' -f $num)) / 30") 10 '#7D8EA8' $false 'Aptos' 'r')); $id++

  foreach ($b in $blocks) {
    if ($b.Kind -eq 'card') {
      $shapes.Add((Add-ShapeXml $id $b.Title 'roundRect' $b.X $b.Y $b.W $b.H '#101E33' '#223A5D' @() 1 '#FFFFFF' $false 'Aptos' 'l')); $id++
      $shapes.Add((Add-TextBoxXml $id ($b.Title + ' Title') ($b.X + 18) ($b.Y + 14) ($b.W - 36) 24 @($b.Title) $b.TitleSize '#D4AF37' $true 'Aptos' 'l')); $id++
      $lines = @()
      foreach ($line in $b.Lines) { $lines += $line }
      $shapes.Add((Add-TextBoxXml $id ($b.Title + ' Body') ($b.X + 18) ($b.Y + 46) ($b.W - 36) ($b.H - 58) $lines $b.FontSize '#E7EEF8' $false 'Aptos' 'l')); $id++
    } elseif ($b.Kind -eq 'code') {
      $shapes.Add((Add-ShapeXml $id 'Code Panel' 'roundRect' $b.X $b.Y $b.W $b.H '#071827' '#2E5D87' @() 1 '#FFFFFF' $false 'Aptos' 'l')); $id++
      $shapes.Add((Add-TextBoxXml $id 'Code Text' ($b.X + 18) ($b.Y + 16) ($b.W - 36) ($b.H - 28) $b.Lines $b.FontSize '#D9F99D' $false 'Consolas' 'l')); $id++
    } elseif ($b.Kind -eq 'stat') {
      $shapes.Add((Add-ShapeXml $id $b.Title 'roundRect' $b.X $b.Y $b.W $b.H $b.Fill 'none' @() 1 '#FFFFFF' $false 'Aptos' 'l')); $id++
      $shapes.Add((Add-TextBoxXml $id ($b.Title + ' Value') ($b.X + 14) ($b.Y + 16) ($b.W - 28) 40 @($b.Value) 26 '#FFFFFF' $true 'Aptos Display' 'c')); $id++
      $shapes.Add((Add-TextBoxXml $id ($b.Title + ' Label') ($b.X + 14) ($b.Y + 58) ($b.W - 28) 34 @($b.Title) 11 '#D9E4F2' $false 'Aptos' 'c')); $id++
    }
  }

  $shapeXml = ($shapes -join "`n")
  return @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      $shapeXml
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>
"@
}

function Card($x,$y,$w,$h,$title,$lines,$fontSize=13,$titleSize=13) {
  [pscustomobject]@{ Kind='card'; X=$x; Y=$y; W=$w; H=$h; Title=$title; Lines=$lines; FontSize=$fontSize; TitleSize=$titleSize }
}
function Code($x,$y,$w,$h,$lines,$fontSize=12) {
  [pscustomobject]@{ Kind='code'; X=$x; Y=$y; W=$w; H=$h; Lines=$lines; FontSize=$fontSize }
}
function Stat($x,$y,$w,$h,$title,$value,$fill) {
  [pscustomobject]@{ Kind='stat'; X=$x; Y=$y; W=$w; H=$h; Title=$title; Value=$value; Fill=$fill }
}

$slides = @(
  @{Title='College Management System'; Subtitle='Full Project Report: Frontend, Backend, Database, Modules, Codebase and Future Scope'; Section='Final Year / Academic Project'; Blocks=@(
    (Stat 60 230 250 115 'Frontend Pages' '31+' '#1D4ED8'),
    (Stat 340 230 250 115 'Admin Pages' '27' '#B45309'),
    (Stat 620 230 250 115 'API Route Files' '30' '#047857'),
    (Stat 900 230 250 115 'Database Models' '30' '#7C3AED'),
    (Card 90 420 1100 120 'Project Identity' @('A complete MERN-based college ERP portal for admissions, academics, fees, exams, communication, reporting, and chatbot-based support.') 18 16)
  )},
  @{Title='Executive Summary'; Subtitle='What this project delivers'; Section='Overview'; Blocks=@(
    (Card 60 190 360 310 'Purpose' @('- Digitize major college operations', '- Provide public website, student portal, and admin dashboard', '- Reduce manual record keeping and improve communication') 15),
    (Card 460 190 360 310 'Core Deliverables' @('- Admission and student management', '- Fees, results, attendance, timetable', '- Library, hostel, certificates, events', '- Chat, notifications, analytics, chatbot') 15),
    (Card 860 190 360 310 'Value' @('- Faster admin workflows', '- Better student self-service', '- Centralized database', '- Scalable module-based codebase') 15)
  )},
  @{Title='Problem Statement'; Subtitle='Manual college processes create delays, duplicate work, and poor visibility'; Section='Project Foundation'; Blocks=@(
    (Card 70 185 530 360 'Existing Challenges' @('- Paper-based admissions and student records', '- Fee tracking and receipts handled manually', '- Results, attendance, hall tickets and notices scattered across systems', '- Students depend on office staff for simple status questions') 16),
    (Card 680 185 530 360 'Project Response' @('- One web platform for college operations', '- Role-based admin and student access', '- Structured MongoDB database', '- Chatbot and quick actions for common student queries') 16)
  )},
  @{Title='Project Objectives'; Subtitle='Functional and technical goals'; Section='Project Foundation'; Blocks=@(
    (Card 70 185 350 330 'Functional Objectives' @('- Manage admissions, courses and faculty', '- Track fees, attendance and results', '- Publish notices, events and placements', '- Provide student self-service dashboard') 15),
    (Card 465 185 350 330 'Technical Objectives' @('- Use React single-page application', '- Build REST APIs with Express', '- Store data in MongoDB using Mongoose', '- Secure routes with JWT and role guards') 15),
    (Card 860 185 350 330 'Usability Objectives' @('- Responsive UI with clear navigation', '- Admin analytics and reports', '- Quick chatbot support', '- Downloadable documents and PDF reports') 15)
  )},
  @{Title='User Roles'; Subtitle='The system is designed around public visitors, students, admins, and faculty-facing operations'; Section='Access Model'; Blocks=@(
    (Card 60 185 260 310 'Public Visitor' @('- Home, About, Courses', '- Faculty, Gallery, Events', '- Admission form', '- Contact enquiry') 14),
    (Card 360 185 260 310 'Student' @('- Profile and ID card', '- My fees, results, attendance', '- Assignments, exams, library', '- Chat, notifications, hall ticket') 14),
    (Card 660 185 260 310 'Admin' @('- Manage students and courses', '- Fees, results, attendance', '- Library, hostel, certificates', '- Analytics and communication') 14),
    (Card 960 185 260 310 'Support Flow' @('- Chatbot answers FAQs', '- Unanswered questions saved', '- Admin can update FAQ answers', '- Messages support live help') 14)
  )},
  @{Title='Technology Stack'; Subtitle='Frontend, backend, database, utilities, and reporting libraries'; Section='Stack'; Blocks=@(
    (Card 55 175 365 360 'Frontend' @('- React 18 + Vite', '- React Router DOM', '- Tailwind CSS', '- Framer Motion', '- React Icons', '- Recharts', '- Three.js / React Three Fiber') 14),
    (Card 455 175 365 360 'Backend' @('- Node.js + Express', '- Mongoose ODM', '- JWT authentication', '- bcryptjs password hashing', '- Multer and Cloudinary uploads', '- Nodemailer and Twilio utilities') 14),
    (Card 855 175 365 360 'Database and Reports' @('- MongoDB collections', '- Mongoose schemas and validation', '- jsPDF and html2canvas', '- Admin analytics endpoints', '- PWA manifest and service worker') 14)
  )},
  @{Title='System Architecture'; Subtitle='High-level data flow from browser to database'; Section='Architecture'; Blocks=@(
    (Card 70 180 280 120 'React Frontend' @('Pages, forms, dashboards, chatbot widget, protected routes') 14),
    (Card 500 180 280 120 'Express API' @('REST endpoints, auth middleware, validation, controllers') 14),
    (Card 930 180 280 120 'MongoDB' @('Students, fees, results, notices, messages, FAQs and more') 14),
    (Card 210 390 360 130 'Authentication Layer' @('JWT token stored by frontend and attached by Axios interceptor') 14),
    (Card 710 390 360 130 'Admin and Student Modules' @('Role-based routes split workflows between admin operations and student self-service') 14)
  )},
  @{Title='Codebase Folder Structure'; Subtitle='Main folders and responsibilities'; Section='Code Organization'; Blocks=@(
    (Code 70 170 530 395 @('katapa-college/', '  backend/', '    controllers/  -> request logic', '    models/       -> Mongoose schemas', '    routes/       -> API endpoints', '    middleware/   -> auth and errors', '    utils/        -> email, SMS, notification', '    uploads/      -> uploaded assets', '    server.js     -> Express entry point') 14),
    (Code 680 170 530 395 @('  frontend/', '    src/pages/      -> public/student pages', '    src/admin/      -> admin dashboard pages', '    src/components/ -> shared UI components', '    src/context/    -> auth, language, theme', '    src/utils/      -> Axios and PDF helpers', '    public/         -> PWA assets', '    vite.config.js  -> Vite + API proxy') 14)
  )},
  @{Title='Frontend Overview'; Subtitle='React single-page application with routed public, student, and admin views'; Section='Frontend'; Blocks=@(
    (Card 60 175 355 350 'Application Shell' @('- App.jsx defines all routes', '- Lazy loading with React Suspense', '- PrivateRoute protects student pages', '- AdminRoute protects admin panel') 14),
    (Card 462 175 355 350 'Shared Components' @('- Navbar and Footer', '- Floating Chatbot', '- NotificationBell', '- Hero3D', '- CourseCard', '- Loader and SectionHeader') 14),
    (Card 864 175 355 350 'Frontend Utilities' @('- Axios instance with token interceptor', '- PDF report helpers', '- Language and theme contexts', '- PWA install prompt and service worker') 14)
  )},
  @{Title='Public Website Pages'; Subtitle='Pages available before login'; Section='Frontend'; Blocks=@(
    (Card 55 170 360 390 'College Information' @('- Home', '- About', '- Courses', '- Faculty', '- Gallery', '- Events', '- Notices', '- Placements', '- Alumni portal') 15),
    (Card 460 170 360 390 'Conversion and Support' @('- Admission', '- Contact', '- Chatbot page', '- Floating chatbot on the site', '- Login', '- Register') 15),
    (Card 865 170 360 390 'Public Page Goal' @('- Help visitors understand the college', '- Convert interested visitors into applicants', '- Provide self-service information', '- Reduce basic enquiry load') 15)
  )},
  @{Title='Student Portal Pages'; Subtitle='Self-service pages for logged-in students'; Section='Frontend'; Blocks=@(
    (Card 60 165 360 410 'Academic Services' @('- My Attendance', '- My Timetable', '- My Results', '- My Assignments', '- My Exams', '- MCQ Exam') 14),
    (Card 460 165 360 410 'Administrative Services' @('- My Fees', '- My Hall Ticket', '- My Certificates', '- My Scholarships', '- My Leave', '- My Library') 14),
    (Card 860 165 360 410 'Personal Services' @('- Profile', '- My ID Card', '- My Feedback', '- My Chat', '- Notifications', '- Chatbot personal status summary') 14)
  )},
  @{Title='Admin Panel Pages'; Subtitle='Operational dashboard for college staff'; Section='Frontend'; Blocks=@(
    (Card 45 160 280 420 'Core Admin' @('- Dashboard', '- Students', '- Add Course', '- Manage Courses', '- Manage Faculty', '- Contacts', '- Upload Gallery') 13),
    (Card 350 160 280 420 'Academic Admin' @('- Results', '- Attendance', '- Timetable', '- Hall Tickets', '- Assignments', '- Online Exams', '- Event Calendar') 13),
    (Card 655 160 280 420 'Services Admin' @('- Fees', '- Library', '- Leave Applications', '- Scholarships', '- Feedback', '- Certificates', '- Hostel Management') 13),
    (Card 960 160 280 420 'Communication' @('- Emails', '- Chat / Messages', '- Reports and Analytics', '- Placements', '- Chatbot FAQs') 13)
  )},
  @{Title='Backend Overview'; Subtitle='Express API organized by route, controller, model, middleware, and utility layers'; Section='Backend'; Blocks=@(
    (Card 60 180 350 330 'server.js' @('- Loads environment variables', '- Connects MongoDB', '- Configures CORS and JSON body parsing', '- Serves uploads', '- Registers API routes', '- Adds health check and error middleware') 14),
    (Card 465 180 350 330 'Controller Layer' @('- Handles business logic', '- Performs validation and CRUD operations', '- Calls utilities for notifications, email and SMS', '- Returns consistent JSON responses') 14),
    (Card 870 180 350 330 'Middleware Layer' @('- protect validates JWT', '- adminOnly restricts admin operations', '- notFound and errorHandler standardize API errors') 14)
  )},
  @{Title='API Route Inventory'; Subtitle='Registered REST API groups in backend/server.js'; Section='Backend'; Blocks=@(
    (Code 55 155 370 430 @('/api/auth', '/api/students', '/api/courses', '/api/contacts', '/api/gallery', '/api/faculty', '/api/fees', '/api/notices', '/api/results', '/api/attendance') 16),
    (Code 455 155 370 430 @('/api/timetable', '/api/email', '/api/analytics', '/api/hall-tickets', '/api/leaves', '/api/library', '/api/events', '/api/scholarships', '/api/feedback', '/api/certificates') 16),
    (Code 855 155 370 430 @('/api/hostels', '/api/assignments', '/api/alumni', '/api/placements', '/api/mcq-exams', '/api/messages', '/api/notifications', '/api/exams', '/api/chatbot', '/api/health') 16)
  )},
  @{Title='Database Overview'; Subtitle='MongoDB with Mongoose schemas for each college domain'; Section='Database'; Blocks=@(
    (Card 70 175 345 350 'Database Pattern' @('- One model per business entity', '- ObjectId references link users, students, courses, fees and results', '- Timestamps preserve audit history', '- Schema validation protects data shape') 14),
    (Card 465 175 345 350 'Relationship Examples' @('- Student references User and Course', '- Fee references Student', '- Result references Student', '- Assignment references Course and submissions', '- Messages reference sender and receiver') 14),
    (Card 860 175 345 350 'Storage Areas' @('- Academic records', '- Financial records', '- Communication records', '- Uploaded asset metadata', '- Chatbot FAQ and learning data') 14)
  )},
  @{Title='Database Model Inventory'; Subtitle='Main Mongoose models found in backend/models'; Section='Database'; Blocks=@(
    (Code 50 150 365 450 @('User, Student, Course, Faculty', 'Fee, Attendance, Timetable', 'Result, Exam, MCQExam', 'Assignment, HallTicket', 'Notice, Notification, Message', 'Contact, Feedback') 15),
    (Code 455 150 365 450 @('Book, BookIssue, Library flow', 'Certificate, Scholarship', 'Hostel, Leave', 'Gallery, Event, Placement', 'Alumni, ChatHistory', 'Faq, UnansweredQuestion') 15),
    (Card 860 150 360 450 'Schema Design Notes' @('- Models keep the project modular', '- Each controller imports its matching model', '- Population is used for readable admin data', '- Virtual fields compute balances and counts', '- Chatbot data is stored for history and FAQ learning') 14)
  )},
  @{Title='Authentication and Authorization'; Subtitle='JWT security with role-based route protection'; Section='Security'; Blocks=@(
    (Card 60 180 360 330 'Frontend Auth' @('- AuthContext stores logged-in user', '- Axios interceptor attaches Bearer token', '- PrivateRoute blocks unauthenticated users', '- AdminRoute checks role before rendering admin pages') 14),
    (Card 460 180 360 330 'Backend Auth' @('- protect middleware verifies JWT', '- User is loaded from database', '- Inactive or missing users are rejected', '- adminOnly returns 403 for non-admin users') 14),
    (Code 860 180 360 330 @('if (!user) return <Navigate to="/login" />;', 'if (user.role !== "admin") return <Navigate to="/" />;', '', 'router.get("/", protect, adminOnly, handler);') 13)
  )},
  @{Title='Admissions and Student Management'; Subtitle='Admission form, student profiles, status workflow, and admin review'; Section='Modules'; Blocks=@(
    (Card 70 175 350 360 'Admission Flow' @('- Visitor opens Admission page', '- Form captures personal and academic details', '- Course selection is saved', '- Student record starts as pending or under review') 14),
    (Card 465 175 350 360 'Admin Flow' @('- Admin reviews applications', '- Status changes to accepted or rejected', '- Admission number can be assigned', '- Student data becomes available for fees, attendance and other modules') 14),
    (Card 860 175 350 360 'Database' @('- Student model stores personal details', '- courseApplied references Course', '- user links student account to application', '- status tracks admission decision') 14)
  )},
  @{Title='Courses, Faculty, Gallery, Events'; Subtitle='Public-facing college information managed from admin panel'; Section='Modules'; Blocks=@(
    (Card 60 170 270 370 'Courses' @('- Add and manage courses', '- Course cards on public pages', '- Course selection during admission', '- Course reference in assignments and students') 13),
    (Card 360 170 270 370 'Faculty' @('- Manage faculty profiles', '- Display teachers publicly', '- Help visitors assess departments and expertise') 13),
    (Card 660 170 270 370 'Gallery' @('- Upload campus images', '- Store images in uploads or Cloudinary path', '- Display visual proof of activities') 13),
    (Card 960 170 270 370 'Events and Placements' @('- Event calendar and public events', '- Placement opportunities and updates', '- Alumni portal for wider engagement') 13)
  )},
  @{Title='Fees, Payments, Receipts'; Subtitle='Financial module for billing, payment tracking, balances, and reports'; Section='Modules'; Blocks=@(
    (Card 60 180 360 350 'Admin Capabilities' @('- Create fee records', '- Bulk create semester fees', '- Record payments', '- Apply waivers', '- View fee summary and status') 14),
    (Card 460 180 360 350 'Student Capabilities' @('- View assigned fees', '- Check paid, partial, unpaid or waived status', '- See balances and due dates', '- Download or view related fee information') 14),
    (Code 860 180 360 350 @('Fee virtual fields:', 'amountPaid = sum(transactions)', 'balance = totalAmount - waiver - paid', '', 'Status updates before save:', 'unpaid / partial / paid / waived') 13)
  )},
  @{Title='Attendance, Timetable, Hall Tickets'; Subtitle='Daily academic operations for students and administrators'; Section='Modules'; Blocks=@(
    (Card 60 175 360 360 'Attendance' @('- Admin marks attendance by date, subject and semester', '- Student sees personal attendance summary', '- Percentage calculated from present and late sessions') 14),
    (Card 460 175 360 360 'Timetable' @('- Admin manages class schedule', '- Student opens My Timetable', '- Helps centralize period, class and schedule information') 14),
    (Card 860 175 360 360 'Hall Tickets' @('- Admin creates exam hall tickets', '- Student views and downloads ticket', '- Chatbot redirects to My Hall Ticket for quick access') 14)
  )},
  @{Title='Results, Exams, Assignments'; Subtitle='Assessment lifecycle from creation to student visibility'; Section='Modules'; Blocks=@(
    (Card 50 170 360 390 'Results' @('- Admin creates subject-wise marks', '- Grade and percentage auto-calculated', '- Publish action makes result visible to student', '- Result notification can be sent') 14),
    (Card 460 170 360 390 'Assignments' @('- Admin creates homework, project, lab or quiz', '- Student submits content', '- Admin grades submissions', '- Pending assignment count supports chatbot status') 14),
    (Card 870 170 360 390 'Exams and MCQ' @('- Exam records for students', '- MCQ exam pages', '- Online exam management in admin panel', '- Student exam self-service page') 14)
  )},
  @{Title='Library, Hostel, Certificates, Scholarships'; Subtitle='Additional student services integrated into the same portal'; Section='Modules'; Blocks=@(
    (Card 50 165 275 410 'Library' @('- Book inventory', '- Book issue records', '- Student library page', '- Admin library management') 13),
    (Card 350 165 275 410 'Hostel and Leave' @('- Hostel management', '- Student leave applications', '- Admin approval workflow', '- Track status centrally') 13),
    (Card 650 165 275 410 'Certificates' @('- Admin certificate generation', '- Student certificate view/download', '- Useful for bonafide and academic documents') 13),
    (Card 950 165 275 410 'Scholarships' @('- Scholarship management', '- Student scholarship page', '- Status tracking for financial aid') 13)
  )},
  @{Title='Messages, Notifications, Email, SMS'; Subtitle='Communication layer for students and admins'; Section='Modules'; Blocks=@(
    (Card 60 175 360 360 'In-App Communication' @('- My Chat for student messages', '- AdminChat for staff response', '- Message model stores conversations', '- NotificationBell shows updates') 14),
    (Card 460 175 360 360 'Notifications' @('- Notification model and routes', '- Helper utility creates student notifications', '- Used when fees, results or other events occur') 14),
    (Card 860 175 360 360 'Email and SMS' @('- Email controller and routes', '- Nodemailer service', '- SMS service utility with Twilio dependency', '- Supports reminders and broadcast communication') 14)
  )},
  @{Title='AI Chatbot and FAQ Assistant'; Subtitle='Floating assistant for quick student support and smart navigation'; Section='Chatbot'; Blocks=@(
    (Card 50 165 360 405 'Student Features' @('- English and Hindi support', '- Quick action buttons', '- Search inside answers', '- Chat history for logged-in users', '- Minimize, clear chat, dark/light mode') 14),
    (Card 460 165 360 405 'Smart Answers' @('- Admission, courses, fees, results', '- Attendance, timetable, library', '- Hall ticket, documents, form help', '- Personal status summary after login') 14),
    (Card 870 165 360 405 'Redirects' @('- Go to Admission', '- Open My Fees', '- Open Results', '- Open Hall Ticket', '- Message Admin or Contact page for issue reports') 14)
  )},
  @{Title='Chatbot Learning and Admin FAQ Editor'; Subtitle='Fallback learning loop converts unanswered questions into future answers'; Section='Chatbot'; Blocks=@(
    (Card 60 175 360 360 'Data Models' @('- Faq stores admin-managed answers', '- ChatHistory stores user question and bot answer', '- UnansweredQuestion stores fallback and issue reports') 14),
    (Card 460 175 360 360 'Admin FAQ Editor' @('- Admin route: /admin/chatbot-faqs', '- Add, edit and delete FAQs', '- View unanswered questions', '- Save an unanswered question as a new FAQ') 14),
    (Code 860 175 360 360 @('POST /api/chatbot/ask', 'GET  /api/chatbot/history', 'GET  /api/chatbot/admin/faqs', 'POST /api/chatbot/admin/faqs', 'GET  /api/chatbot/admin/unanswered') 13)
  )},
  @{Title='Analytics and Reporting'; Subtitle='Admin dashboard summarizes important operational data'; Section='Reporting'; Blocks=@(
    (Card 60 175 350 360 'Analytics Dashboard' @('- Total students and admission status', '- Fee collection breakdown', '- Attendance trend', '- Grade distribution', '- Monthly applications') 14),
    (Card 465 175 350 360 'Reporting Utilities' @('- Recharts for visual dashboards', '- jsPDF and html2canvas for generated reports', '- PDF helper utilities in frontend/src/utils', '- Admin can refresh analytics data') 14),
    (Card 870 175 350 360 'Decision Support' @('- Identify pending fees', '- Track admissions', '- Monitor academic performance', '- Review operational workload') 14)
  )},
  @{Title='Representative Code Snippets'; Subtitle='Important project code patterns mentioned in the report'; Section='Code'; Blocks=@(
    (Code 50 155 370 430 @('Express route registration:', "app.use('/api/auth', authRoutes);", "app.use('/api/students', studentRoutes);", "app.use('/api/chatbot', chatbotRoutes);", '', 'Health check:', "GET /api/health") 12),
    (Code 455 155 370 430 @('Axios token interceptor:', 'const stored = localStorage.getItem(...);', 'if (user?.token) {', '  config.headers.Authorization =', '    `Bearer ${user.token}`;', '}', '', '401 -> remove user and redirect login') 12),
    (Code 860 155 370 430 @('Mongoose model pattern:', 'const schema = new mongoose.Schema({...},', '  { timestamps: true }', ');', '', 'module.exports = mongoose.model(', '  "Student", studentSchema', ');') 12)
  )},
  @{Title='Setup, Run, Build, Deployment'; Subtitle='How the project is executed during development and prepared for production'; Section='Operations'; Blocks=@(
    (Card 60 170 360 385 'Install and Run' @('- npm install at workspace root', '- npm install --prefix backend', '- npm install --prefix frontend', '- Backend: npm start --prefix backend', '- Frontend: npm run dev --prefix frontend') 14),
    (Card 460 170 360 385 'Build' @('- Frontend build command: npm run build', '- Vite outputs production files in frontend/dist', '- Backend runs with Node server.js', '- MongoDB connection configured through environment variables') 14),
    (Card 860 170 360 385 'Deployment Notes' @('- Configure CLIENT_URL and MongoDB URI', '- Serve frontend build with a static host', '- Run backend on Node-capable server', '- Protect JWT secret and upload credentials') 14)
  )},
  @{Title='Testing, Limitations, Future Scope, Conclusion'; Subtitle='Final evaluation and next development direction'; Section='Closure'; Blocks=@(
    (Card 45 155 280 430 'Testing Done' @('- Frontend production build passed', '- Backend chatbot files syntax checked', '- API health endpoint available', '- Routes and modules reviewed from source') 13),
    (Card 350 155 280 430 'Current Limitations' @('- No external AI model integration yet', '- Manual admin data entry still needed', '- Live chat depends on admin availability', '- More automated tests can be added') 13),
    (Card 655 155 280 430 'Future Scope' @('- Voice input and voice reply', '- More languages', '- Payment gateway integration', '- Mobile app', '- Advanced analytics and reminders') 13),
    (Card 960 155 280 430 'Conclusion' @('- The project is a complete college ERP foundation', '- Modular MERN architecture supports expansion', '- Student and admin workflows are centralized', '- Chatbot improves support and navigation') 13)
  )}
)

$slideCount = $slides.Count

# Content types
$overrides = @(
  '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
  '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
  '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
  '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
  '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
  '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
)
for ($i=1; $i -le $slideCount; $i++) {
  $overrides += "<Override PartName=`"/ppt/slides/slide$i.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.presentationml.slide+xml`"/>"
}
Add-File '[Content_Types].xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  $($overrides -join "`n  ")
</Types>
"@

Add-File '_rels/.rels' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$slideIds = @()
$presRels = @('<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>')
for ($i=1; $i -le $slideCount; $i++) {
  $rid = $i + 1
  $sid = 255 + $i
  $slideIds += "<p:sldId id=`"$sid`" r:id=`"rId$rid`"/>"
  $presRels += "<Relationship Id=`"rId$rid`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide`" Target=`"slides/slide$i.xml`"/>"
}
Add-File 'ppt/presentation.xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>
    $($slideIds -join "`n    ")
  </p:sldIdLst>
  <p:sldSz cx="$SlideW" cy="$SlideH" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle/>
</p:presentation>
"@

Add-File 'ppt/_rels/presentation.xml.rels' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  $($presRels -join "`n  ")
</Relationships>
"@

Add-File 'ppt/slideMasters/slideMaster1.xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>
"@

Add-File 'ppt/slideMasters/_rels/slideMaster1.xml.rels' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
"@

Add-File 'ppt/slideLayouts/slideLayout1.xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>
"@

Add-File 'ppt/slideLayouts/_rels/slideLayout1.xml.rels' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
"@

Add-File 'ppt/theme/theme1.xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="College Project Theme">
  <a:themeElements>
    <a:clrScheme name="College Gold"><a:dk1><a:srgbClr val="07111F"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="101E33"/></a:dk2><a:lt2><a:srgbClr val="E7EEF8"/></a:lt2><a:accent1><a:srgbClr val="D4AF37"/></a:accent1><a:accent2><a:srgbClr val="2563EB"/></a:accent2><a:accent3><a:srgbClr val="10B981"/></a:accent3><a:accent4><a:srgbClr val="F97316"/></a:accent4><a:accent5><a:srgbClr val="A855F7"/></a:accent5><a:accent6><a:srgbClr val="38BDF8"/></a:accent6><a:hlink><a:srgbClr val="60A5FA"/></a:hlink><a:folHlink><a:srgbClr val="A78BFA"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Aptos"><a:majorFont><a:latin typeface="Aptos Display"/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="College"><a:fillStyleLst><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="12700"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="dk1"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>
"@

$now = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
Add-File 'docProps/core.xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>College Management System Full Project Report</dc:title>
  <dc:subject>Frontend, Backend, Database and Codebase Documentation</dc:subject>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$now</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$now</dcterms:modified>
</cp:coreProperties>
"@
Add-File 'docProps/app.xml' @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft PowerPoint</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>$slideCount</Slides><Notes>0</Notes><HiddenSlides>0</HiddenSlides><ScaleCrop>false</ScaleCrop>
</Properties>
"@

for ($i=1; $i -le $slideCount; $i++) {
  $s = $slides[$i-1]
  Add-File "ppt/slides/slide$i.xml" (Slide-Xml $i $s.Title $s.Subtitle $s.Blocks $s.Section)
  Add-File "ppt/slides/_rels/slide$i.xml.rels" @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>
"@
}

if (Test-Path $OutFile) { Remove-Item -LiteralPath $OutFile -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$fs = [System.IO.File]::Open($OutFile, [System.IO.FileMode]::CreateNew)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in Get-ChildItem -LiteralPath $BuildDir -Recurse -File) {
    $base = [System.IO.Path]::GetFullPath($BuildDir).TrimEnd('\') + '\'
    $relative = [System.IO.Path]::GetFullPath($file.FullName).Substring($base.Length).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $zip.Dispose()
  $fs.Dispose()
}
Write-Output $OutFile
