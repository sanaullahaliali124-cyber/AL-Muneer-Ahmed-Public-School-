# AL Muneer Ahmed Public School - School Management System

A complete, professional School Management System built with **HTML5, CSS3, and Vanilla JavaScript**. Uses LocalStorage for data persistence. No backend required.

**School:** AL Muneer Ahmed Public School  
**Tagline:** Quality Education, Bright Future  
**WhatsApp:** 03168122916 (International: 923168122916)

---

## How to Run

1. Download or clone the entire `school-management-system` folder.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. No server, installation, or build step is required.
4. For best results, use a local server (optional):  
   `npx serve .` or open via VS Code Live Server.

---

## Login Credentials (Demo)

| Role        | Username    | Password       |
|-------------|-------------|----------------|
| Super Admin | admin       | admin123       |
| Teacher     | teacher     | teacher123     |
| Accountant  | accountant  | accountant123  |
| Parent      | parent      | parent123      |
| Student     | student     | student123     |

After login, you are redirected to the appropriate dashboard.

---

## File Structure

```
school-management-system/
├── index.html          # Public school website
├── login.html          # Login page
├── admin.html          # Super Admin dashboard
├── teacher.html        # Teacher portal
├── parent.html         # Parent portal
├── student.html        # Student portal
├── accountant.html     # Accountant portal
├── css/
│   ├── style.css       # Public website styles
│   ├── dashboard.css   # Dashboard/admin styles
│   └── responsive.css  # Mobile responsive styles
├── js/
│   ├── database.js     # LocalStorage database layer + demo data
│   ├── auth.js         # Authentication & session
│   ├── app.js          # Common utilities (toast, modals, search, etc.)
│   ├── whatsapp.js     # WhatsApp integration
│   ├── students.js     # Student CRUD
│   ├── teachers.js     # Teacher management
│   ├── parents.js      # Parent management
│   ├── attendance.js   # Attendance system
│   ├── fees.js         # Fee management & receipts
│   ├── exams.js        # Exam management
│   ├── results.js      # Marks & result cards
│   ├── timetable.js    # Timetable
│   ├── homework.js     # Homework
│   ├── admissions.js   # Online admissions
│   ├── notifications.js
│   ├── settings.js
│   └── reports.js      # CSV export reports
├── assets/
│   ├── logo.png        # Place your school logo here
│   └── images/
└── README.md
```

---

## Features

### Public Website
- Home, About, Academics, Teachers, Facilities, Gallery, Events, Contact
- Online admission form
- Floating WhatsApp button
- Responsive design

### Admin Dashboard
- Statistics cards (students, teachers, attendance, fees, admissions)
- Full CRUD for Students, Parents, Teachers
- Attendance marking with absent WhatsApp list
- Fee management, receipts, defaulters WhatsApp reminders
- Exams, Results, Timetable, Homework
- Admissions workflow (New → Review → Approved → Enrolled)
- Notices, Events, Library, Transport, Payroll
- ID Card & Certificate generators
- Global search, Reports (CSV export)
- Dark/Light mode, Settings, Notifications

### WhatsApp Integration
- School WhatsApp: 03168122916 → opens https://wa.me/923168122916
- Parent contact buttons with prepared messages
- Fee reminder WhatsApp links
- Absent student parent notifications
- No automatic sending (user clicks to open WhatsApp)

### Other Portals
- **Teacher:** Attendance, Homework, Marks, Timetable
- **Parent:** Children info, Attendance, Fees, Results, Homework
- **Student:** Profile, Attendance, Results, Homework, Timetable
- **Accountant:** Fees, Defaulters, Payroll, Reports

---

## Replace Logo

Place your school logo file at:

```
assets/logo.png
```

Recommended size: 200x200 px (PNG with transparent background).  
If the file is missing, a fallback "AMA" badge is shown automatically.

---

## How LocalStorage Works

All data is stored in the browser's LocalStorage under keys such as:

- `school_students`, `school_teachers`, `school_parents`
- `school_attendance`, `school_fees`, `school_exams`, `school_results`
- `school_settings`, `school_notifications`, `school_session`
- etc.

Demo data is created automatically on first launch (20 students, 8 teachers, 10 parents, fees, attendance, exams, etc.).

**Reset demo data:** Go to Admin → Settings → "Reset Demo Data" button.

**Clear all data:** Open browser DevTools → Application → Local Storage → Clear.

---

## Change School WhatsApp

1. Login as Admin
2. Go to **Settings**
3. Update the WhatsApp number field
4. Save

Or edit the default in `js/database.js` → `getDefaultSettings()`.

---

## Security Limitations

This is a **frontend-only demo system**. LocalStorage authentication is suitable for local/demo use only.

For production deployment you should use:
- Secure backend (Node.js, PHP, Python, etc.)
- Real database (MySQL, PostgreSQL, MongoDB, Firebase, Supabase)
- Proper authentication (JWT, sessions, OAuth)
- HTTPS
- Input validation on the server
- Role-based access control on the server

---

## Connecting a Future Backend

The JavaScript is modular. To connect a real backend:

1. Replace functions in `database.js` (`getRecords`, `addRecord`, etc.) with API fetch calls.
2. Keep the same function signatures so UI code continues to work.
3. Add WhatsApp Business API for automated messaging if needed.
4. Add payment gateway for online fee collection.
5. The architecture is ready for multi-campus, biometric attendance, SMS, email, and mobile apps.

---

## Browser Support

Chrome, Firefox, Edge, Safari (latest versions).  
Requires JavaScript and LocalStorage enabled.

---

## License

Demo system for AL Muneer Ahmed Public School.  
Built with HTML, CSS & Vanilla JavaScript.
