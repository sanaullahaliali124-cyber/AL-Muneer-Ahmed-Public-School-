// database.js - LocalStorage Database Layer for AL Muneer Ahmed Public School

const DB_PREFIX = 'school_';

const DB_KEYS = {
    students: 'school_students',
    parents: 'school_parents',
    teachers: 'school_teachers',
    classes: 'school_classes',
    subjects: 'school_subjects',
    attendance: 'school_attendance',
    fees: 'school_fees',
    exams: 'school_exams',
    results: 'school_results',
    timetable: 'school_timetable',
    homework: 'school_homework',
    admissions: 'school_admissions',
    notices: 'school_notices',
    events: 'school_events',
    books: 'school_books',
    transport: 'school_transport',
    payroll: 'school_payroll',
    notifications: 'school_notifications',
    settings: 'school_settings',
    users: 'school_users',
    gallery: 'school_gallery',
    session: 'school_session'
};

// Generate unique ID
function generateId(prefix = 'ID') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generic CRUD
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        return false;
    }
}

function loadData(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading data:', e);
        return defaultValue;
    }
}

function getRecords(key) {
    return loadData(key, []);
}

function getRecordById(key, id) {
    const records = getRecords(key);
    return records.find(r => r.id === id) || null;
}

function addRecord(key, record) {
    const records = getRecords(key);
    if (!record.id) {
        record.id = generateId(key.replace('school_', '').toUpperCase().slice(0, 3));
    }
    record.createdAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();
    records.push(record);
    saveData(key, records);
    return record;
}

function updateRecord(key, id, updates) {
    const records = getRecords(key);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    saveData(key, records);
    return records[index];
}

function deleteRecord(key, id) {
    let records = getRecords(key);
    const initialLength = records.length;
    records = records.filter(r => r.id !== id);
    if (records.length < initialLength) {
        saveData(key, records);
        return true;
    }
    return false;
}

// Settings helpers
function getSettings() {
    return loadData(DB_KEYS.settings, getDefaultSettings());
}

function saveSettings(settings) {
    return saveData(DB_KEYS.settings, settings);
}

function getDefaultSettings() {
    return {
        schoolName: 'AL Muneer Ahmed Public School',
        tagline: 'Quality Education, Bright Future',
        whatsapp: '03168122916',
        whatsappIntl: '923168122916',
        phone: '03168122916',
        email: 'info@almuneerahmed.edu.pk',
        address: 'Pakistan',
        logo: 'assets/logo.png',
        academicSession: '2025-2026',
        theme: 'light',
        feeStructure: {
            tuition: 3000,
            admission: 5000,
            exam: 1000,
            transport: 1500
        },
        grades: [
            { min: 90, grade: 'A+', remark: 'Outstanding' },
            { min: 80, grade: 'A', remark: 'Excellent' },
            { min: 70, grade: 'B', remark: 'Very Good' },
            { min: 60, grade: 'C', remark: 'Good' },
            { min: 50, grade: 'D', remark: 'Satisfactory' },
            { min: 0, grade: 'F', remark: 'Fail' }
        ]
    };
}

// Initialize default data
function initializeDatabase() {
    if (localStorage.getItem('school_initialized')) {
        return;
    }

    // Users
    const users = [
        { id: 'USR_ADMIN', username: 'admin', password: 'admin123', role: 'admin', name: 'Super Admin' },
        { id: 'USR_TEACHER', username: 'teacher', password: 'teacher123', role: 'teacher', name: 'Demo Teacher', teacherId: 'TCH_001' },
        { id: 'USR_ACCOUNTANT', username: 'accountant', password: 'accountant123', role: 'accountant', name: 'Demo Accountant' },
        { id: 'USR_PARENT', username: 'parent', password: 'parent123', role: 'parent', name: 'Demo Parent', parentId: 'PAR_001' },
        { id: 'USR_STUDENT', username: 'student', password: 'student123', role: 'student', name: 'Demo Student', studentId: 'STU_001' }
    ];
    saveData(DB_KEYS.users, users);

    // Classes
    const classes = [
        { id: 'CLS_PG', name: 'Playgroup', sections: ['A'], classTeacher: null },
        { id: 'CLS_NUR', name: 'Nursery', sections: ['A'], classTeacher: null },
        { id: 'CLS_PREP', name: 'Prep', sections: ['A'], classTeacher: null },
        { id: 'CLS_1', name: 'Class 1', sections: ['A', 'B'], classTeacher: null },
        { id: 'CLS_2', name: 'Class 2', sections: ['A', 'B'], classTeacher: null },
        { id: 'CLS_3', name: 'Class 3', sections: ['A', 'B'], classTeacher: null },
        { id: 'CLS_4', name: 'Class 4', sections: ['A', 'B'], classTeacher: null },
        { id: 'CLS_5', name: 'Class 5', sections: ['A', 'B'], classTeacher: null },
        { id: 'CLS_6', name: 'Class 6', sections: ['A', 'B'], classTeacher: null },
        { id: 'CLS_7', name: 'Class 7', sections: ['A'], classTeacher: null },
        { id: 'CLS_8', name: 'Class 8', sections: ['A'], classTeacher: null },
        { id: 'CLS_9', name: 'Class 9', sections: ['A'], classTeacher: null },
        { id: 'CLS_10', name: 'Class 10', sections: ['A'], classTeacher: null }
    ];
    saveData(DB_KEYS.classes, classes);

    // Subjects
    const subjects = [
        { id: 'SUB_ENG', name: 'English', code: 'ENG' },
        { id: 'SUB_URD', name: 'Urdu', code: 'URD' },
        { id: 'SUB_MATH', name: 'Mathematics', code: 'MATH' },
        { id: 'SUB_SCI', name: 'Science', code: 'SCI' },
        { id: 'SUB_ISL', name: 'Islamiyat', code: 'ISL' },
        { id: 'SUB_SST', name: 'Social Studies', code: 'SST' },
        { id: 'SUB_COMP', name: 'Computer', code: 'COMP' },
        { id: 'SUB_ART', name: 'Arts', code: 'ART' }
    ];
    saveData(DB_KEYS.subjects, subjects);

    // Teachers
    const teachers = [
        { id: 'TCH_001', name: 'Ahmed Khan', phone: '03001234567', whatsapp: '03001234567', email: 'ahmed@school.edu.pk', qualification: 'M.Ed', experience: 8, subjects: ['Mathematics', 'Science'], classes: ['Class 5', 'Class 6'], joiningDate: '2018-03-15', salary: 45000, status: 'Active', photo: '' },
        { id: 'TCH_002', name: 'Fatima Ali', phone: '03011234567', whatsapp: '03011234567', email: 'fatima@school.edu.pk', qualification: 'B.Ed', experience: 5, subjects: ['English', 'Urdu'], classes: ['Class 3', 'Class 4'], joiningDate: '2020-08-01', salary: 38000, status: 'Active', photo: '' },
        { id: 'TCH_003', name: 'Muhammad Hassan', phone: '03021234567', whatsapp: '03021234567', email: 'hassan@school.edu.pk', qualification: 'M.Sc', experience: 10, subjects: ['Science', 'Computer'], classes: ['Class 7', 'Class 8'], joiningDate: '2016-01-10', salary: 50000, status: 'Active', photo: '' },
        { id: 'TCH_004', name: 'Ayesha Bibi', phone: '03031234567', whatsapp: '03031234567', email: 'ayesha@school.edu.pk', qualification: 'MA Islamiyat', experience: 6, subjects: ['Islamiyat'], classes: ['Class 1', 'Class 2'], joiningDate: '2019-04-20', salary: 35000, status: 'Active', photo: '' },
        { id: 'TCH_005', name: 'Imran Shah', phone: '03041234567', whatsapp: '03041234567', email: 'imran@school.edu.pk', qualification: 'B.Sc', experience: 4, subjects: ['Mathematics'], classes: ['Class 9', 'Class 10'], joiningDate: '2021-09-01', salary: 40000, status: 'Active', photo: '' },
        { id: 'TCH_006', name: 'Sana Raza', phone: '03051234567', whatsapp: '03051234567', email: 'sana@school.edu.pk', qualification: 'B.Ed', experience: 3, subjects: ['Arts', 'Urdu'], classes: ['Nursery', 'Prep'], joiningDate: '2022-03-15', salary: 32000, status: 'Active', photo: '' },
        { id: 'TCH_007', name: 'Bilal Ahmed', phone: '03061234567', whatsapp: '03061234567', email: 'bilal@school.edu.pk', qualification: 'M.A', experience: 7, subjects: ['Social Studies', 'English'], classes: ['Class 6', 'Class 7'], joiningDate: '2018-11-01', salary: 42000, status: 'Active', photo: '' },
        { id: 'TCH_008', name: 'Nadia Hussain', phone: '03071234567', whatsapp: '03071234567', email: 'nadia@school.edu.pk', qualification: 'B.Ed', experience: 2, subjects: ['English'], classes: ['Class 1', 'Class 2'], joiningDate: '2023-02-01', salary: 30000, status: 'Active', photo: '' }
    ];
    saveData(DB_KEYS.teachers, teachers);

    // Parents
    const parents = [
        { id: 'PAR_001', fatherName: 'Ali Raza', motherName: 'Saima Ali', guardian: 'Ali Raza', phone: '03111234567', whatsapp: '03111234567', email: 'ali.raza@email.com', address: 'House 12, Street 5, Lahore', children: ['STU_001', 'STU_002'] },
        { id: 'PAR_002', fatherName: 'Usman Malik', motherName: 'Farah Malik', guardian: 'Usman Malik', phone: '03121234567', whatsapp: '03121234567', email: 'usman@email.com', address: 'Flat 3, Gulberg, Lahore', children: ['STU_003'] },
        { id: 'PAR_003', fatherName: 'Hassan Javed', motherName: 'Rabia Hassan', guardian: 'Hassan Javed', phone: '03131234567', whatsapp: '03131234567', email: 'hassan.j@email.com', address: 'Street 8, Model Town', children: ['STU_004', 'STU_005'] },
        { id: 'PAR_004', fatherName: 'Tariq Mehmood', motherName: 'Asma Tariq', guardian: 'Tariq Mehmood', phone: '03141234567', whatsapp: '03141234567', email: 'tariq@email.com', address: 'House 45, Johar Town', children: ['STU_006'] },
        { id: 'PAR_005', fatherName: 'Kamran Shah', motherName: 'Nadia Kamran', guardian: 'Kamran Shah', phone: '03151234567', whatsapp: '03151234567', email: 'kamran@email.com', address: 'Block C, DHA', children: ['STU_007'] },
        { id: 'PAR_006', fatherName: 'Faisal Iqbal', motherName: 'Hina Faisal', guardian: 'Faisal Iqbal', phone: '03161234567', whatsapp: '03161234567', email: 'faisal@email.com', address: 'Street 2, Garden Town', children: ['STU_008', 'STU_009'] },
        { id: 'PAR_007', fatherName: 'Naveed Akhtar', motherName: 'Sadia Naveed', guardian: 'Naveed Akhtar', phone: '03171234567', whatsapp: '03171234567', email: 'naveed@email.com', address: 'House 22, Faisal Town', children: ['STU_010'] },
        { id: 'PAR_008', fatherName: 'Shahid Khan', motherName: 'Mehwish Shahid', guardian: 'Shahid Khan', phone: '03181234567', whatsapp: '03181234567', email: 'shahid@email.com', address: 'Street 15, Iqbal Town', children: ['STU_011'] },
        { id: 'PAR_009', fatherName: 'Waqas Ahmed', motherName: 'Zainab Waqas', guardian: 'Waqas Ahmed', phone: '03191234567', whatsapp: '03191234567', email: 'waqas@email.com', address: 'House 7, Valencia', children: ['STU_012', 'STU_013'] },
        { id: 'PAR_010', fatherName: 'Adnan Ali', motherName: 'Saba Adnan', guardian: 'Adnan Ali', phone: '03201234567', whatsapp: '03201234567', email: 'adnan@email.com', address: 'Block B, Bahria Town', children: ['STU_014'] }
    ];
    saveData(DB_KEYS.parents, parents);

    // Students (20+)
    const students = [
        { id: 'STU_001', admissionNo: 'ADM2025001', name: 'Ahmed Ali', fatherName: 'Ali Raza', motherName: 'Saima Ali', dob: '2015-05-12', gender: 'Male', className: 'Class 5', section: 'A', rollNo: '5A01', admissionDate: '2020-04-01', phone: '03111234567', fatherPhone: '03111234567', motherPhone: '03111234568', parentWhatsapp: '03111234567', address: 'House 12, Street 5, Lahore', previousSchool: 'ABC School', status: 'Active', parentId: 'PAR_001', photo: '' },
        { id: 'STU_002', admissionNo: 'ADM2025002', name: 'Ayesha Ali', fatherName: 'Ali Raza', motherName: 'Saima Ali', dob: '2017-08-20', gender: 'Female', className: 'Class 3', section: 'A', rollNo: '3A05', admissionDate: '2021-04-01', phone: '03111234567', fatherPhone: '03111234567', motherPhone: '03111234568', parentWhatsapp: '03111234567', address: 'House 12, Street 5, Lahore', previousSchool: '', status: 'Active', parentId: 'PAR_001', photo: '' },
        { id: 'STU_003', admissionNo: 'ADM2025003', name: 'Bilal Usman', fatherName: 'Usman Malik', motherName: 'Farah Malik', dob: '2014-03-15', gender: 'Male', className: 'Class 6', section: 'A', rollNo: '6A03', admissionDate: '2019-04-01', phone: '03121234567', fatherPhone: '03121234567', motherPhone: '03121234568', parentWhatsapp: '03121234567', address: 'Flat 3, Gulberg, Lahore', previousSchool: 'City School', status: 'Active', parentId: 'PAR_002', photo: '' },
        { id: 'STU_004', admissionNo: 'ADM2025004', name: 'Sara Hassan', fatherName: 'Hassan Javed', motherName: 'Rabia Hassan', dob: '2016-11-08', gender: 'Female', className: 'Class 4', section: 'B', rollNo: '4B02', admissionDate: '2020-04-01', phone: '03131234567', fatherPhone: '03131234567', motherPhone: '03131234568', parentWhatsapp: '03131234567', address: 'Street 8, Model Town', previousSchool: '', status: 'Active', parentId: 'PAR_003', photo: '' },
        { id: 'STU_005', admissionNo: 'ADM2025005', name: 'Omar Hassan', fatherName: 'Hassan Javed', motherName: 'Rabia Hassan', dob: '2018-01-25', gender: 'Male', className: 'Class 2', section: 'A', rollNo: '2A07', admissionDate: '2022-04-01', phone: '03131234567', fatherPhone: '03131234567', motherPhone: '03131234568', parentWhatsapp: '03131234567', address: 'Street 8, Model Town', previousSchool: '', status: 'Active', parentId: 'PAR_003', photo: '' },
        { id: 'STU_006', admissionNo: 'ADM2025006', name: 'Zain Tariq', fatherName: 'Tariq Mehmood', motherName: 'Asma Tariq', dob: '2013-07-30', gender: 'Male', className: 'Class 7', section: 'A', rollNo: '7A01', admissionDate: '2018-04-01', phone: '03141234567', fatherPhone: '03141234567', motherPhone: '03141234568', parentWhatsapp: '03141234567', address: 'House 45, Johar Town', previousSchool: 'Beaconhouse', status: 'Active', parentId: 'PAR_004', photo: '' },
        { id: 'STU_007', admissionNo: 'ADM2025007', name: 'Hira Kamran', fatherName: 'Kamran Shah', motherName: 'Nadia Kamran', dob: '2015-09-14', gender: 'Female', className: 'Class 5', section: 'B', rollNo: '5B04', admissionDate: '2020-04-01', phone: '03151234567', fatherPhone: '03151234567', motherPhone: '03151234568', parentWhatsapp: '03151234567', address: 'Block C, DHA', previousSchool: '', status: 'Active', parentId: 'PAR_005', photo: '' },
        { id: 'STU_008', admissionNo: 'ADM2025008', name: 'Hamza Faisal', fatherName: 'Faisal Iqbal', motherName: 'Hina Faisal', dob: '2014-12-05', gender: 'Male', className: 'Class 6', section: 'B', rollNo: '6B02', admissionDate: '2019-04-01', phone: '03161234567', fatherPhone: '03161234567', motherPhone: '03161234568', parentWhatsapp: '03161234567', address: 'Street 2, Garden Town', previousSchool: 'LGS', status: 'Active', parentId: 'PAR_006', photo: '' },
        { id: 'STU_009', admissionNo: 'ADM2025009', name: 'Mahnoor Faisal', fatherName: 'Faisal Iqbal', motherName: 'Hina Faisal', dob: '2017-04-18', gender: 'Female', className: 'Class 3', section: 'B', rollNo: '3B01', admissionDate: '2021-04-01', phone: '03161234567', fatherPhone: '03161234567', motherPhone: '03161234568', parentWhatsapp: '03161234567', address: 'Street 2, Garden Town', previousSchool: '', status: 'Active', parentId: 'PAR_006', photo: '' },
        { id: 'STU_010', admissionNo: 'ADM2025010', name: 'Ali Naveed', fatherName: 'Naveed Akhtar', motherName: 'Sadia Naveed', dob: '2012-06-22', gender: 'Male', className: 'Class 8', section: 'A', rollNo: '8A05', admissionDate: '2017-04-01', phone: '03171234567', fatherPhone: '03171234567', motherPhone: '03171234568', parentWhatsapp: '03171234567', address: 'House 22, Faisal Town', previousSchool: 'The Educators', status: 'Active', parentId: 'PAR_007', photo: '' },
        { id: 'STU_011', admissionNo: 'ADM2025011', name: 'Fatima Shahid', fatherName: 'Shahid Khan', motherName: 'Mehwish Shahid', dob: '2016-02-11', gender: 'Female', className: 'Class 4', section: 'A', rollNo: '4A08', admissionDate: '2020-04-01', phone: '03181234567', fatherPhone: '03181234567', motherPhone: '03181234568', parentWhatsapp: '03181234567', address: 'Street 15, Iqbal Town', previousSchool: '', status: 'Active', parentId: 'PAR_008', photo: '' },
        { id: 'STU_012', admissionNo: 'ADM2025012', name: 'Yusuf Waqas', fatherName: 'Waqas Ahmed', motherName: 'Zainab Waqas', dob: '2015-10-03', gender: 'Male', className: 'Class 5', section: 'A', rollNo: '5A09', admissionDate: '2020-04-01', phone: '03191234567', fatherPhone: '03191234567', motherPhone: '03191234568', parentWhatsapp: '03191234567', address: 'House 7, Valencia', previousSchool: '', status: 'Active', parentId: 'PAR_009', photo: '' },
        { id: 'STU_013', admissionNo: 'ADM2025013', name: 'Noor Waqas', fatherName: 'Waqas Ahmed', motherName: 'Zainab Waqas', dob: '2018-07-19', gender: 'Female', className: 'Class 2', section: 'B', rollNo: '2B03', admissionDate: '2022-04-01', phone: '03191234567', fatherPhone: '03191234567', motherPhone: '03191234568', parentWhatsapp: '03191234567', address: 'House 7, Valencia', previousSchool: '', status: 'Active', parentId: 'PAR_009', photo: '' },
        { id: 'STU_014', admissionNo: 'ADM2025014', name: 'Ibrahim Adnan', fatherName: 'Adnan Ali', motherName: 'Saba Adnan', dob: '2013-11-28', gender: 'Male', className: 'Class 7', section: 'A', rollNo: '7A06', admissionDate: '2018-04-01', phone: '03201234567', fatherPhone: '03201234567', motherPhone: '03201234568', parentWhatsapp: '03201234567', address: 'Block B, Bahria Town', previousSchool: 'Roots', status: 'Active', parentId: 'PAR_010', photo: '' },
        { id: 'STU_015', admissionNo: 'ADM2025015', name: 'Maryam Khan', fatherName: 'Khalid Khan', motherName: 'Amna Khalid', dob: '2014-05-07', gender: 'Female', className: 'Class 6', section: 'A', rollNo: '6A08', admissionDate: '2019-04-01', phone: '03211234567', fatherPhone: '03211234567', motherPhone: '03211234568', parentWhatsapp: '03211234567', address: 'Street 9, Cantt', previousSchool: '', status: 'Active', parentId: '', photo: '' },
        { id: 'STU_016', admissionNo: 'ADM2025016', name: 'Hassan Raza', fatherName: 'Raza Ahmed', motherName: 'Sana Raza', dob: '2016-08-16', gender: 'Male', className: 'Class 4', section: 'A', rollNo: '4A12', admissionDate: '2020-04-01', phone: '03221234567', fatherPhone: '03221234567', motherPhone: '03221234568', parentWhatsapp: '03221234567', address: 'House 33, Township', previousSchool: '', status: 'Active', parentId: '', photo: '' },
        { id: 'STU_017', admissionNo: 'ADM2025017', name: 'Amina Sheikh', fatherName: 'Sheikh Imran', motherName: 'Farida Imran', dob: '2015-01-09', gender: 'Female', className: 'Class 5', section: 'B', rollNo: '5B07', admissionDate: '2020-04-01', phone: '03231234567', fatherPhone: '03231234567', motherPhone: '03231234568', parentWhatsapp: '03231234567', address: 'Block A, Askari', previousSchool: 'APS', status: 'Active', parentId: '', photo: '' },
        { id: 'STU_018', admissionNo: 'ADM2025018', name: 'Umar Farooq', fatherName: 'Farooq Ahmed', motherName: 'Bushra Farooq', dob: '2017-12-21', gender: 'Male', className: 'Class 3', section: 'A', rollNo: '3A11', admissionDate: '2021-04-01', phone: '03241234567', fatherPhone: '03241234567', motherPhone: '03241234568', parentWhatsapp: '03241234567', address: 'Street 4, Green Town', previousSchool: '', status: 'Active', parentId: '', photo: '' },
        { id: 'STU_019', admissionNo: 'ADM2025019', name: 'Sanaullah', fatherName: 'Abdullah', motherName: 'Khadija', dob: '2012-04-14', gender: 'Male', className: 'Class 8', section: 'A', rollNo: '8A02', admissionDate: '2017-04-01', phone: '03251234567', fatherPhone: '03251234567', motherPhone: '03251234568', parentWhatsapp: '03251234567', address: 'House 18, Muslim Town', previousSchool: 'Divisional Public', status: 'Active', parentId: '', photo: '' },
        { id: 'STU_020', admissionNo: 'ADM2025020', name: 'Zara Bibi', fatherName: 'Muhammad Asif', motherName: 'Shazia Asif', dob: '2018-09-02', gender: 'Female', className: 'Class 2', section: 'A', rollNo: '2A14', admissionDate: '2022-04-01', phone: '03261234567', fatherPhone: '03261234567', motherPhone: '03261234568', parentWhatsapp: '03261234567', address: 'Street 11, Shahdara', previousSchool: '', status: 'Active', parentId: '', photo: '' }
    ];
    saveData(DB_KEYS.students, students);

    // Attendance (sample for today and past)
    const today = new Date().toISOString().split('T')[0];
    const attendance = [];
    students.forEach((s, i) => {
        const status = i % 7 === 0 ? 'Absent' : (i % 11 === 0 ? 'Late' : 'Present');
        attendance.push({
            id: generateId('ATT'),
            studentId: s.id,
            date: today,
            status: status,
            className: s.className,
            section: s.section,
            markedBy: 'admin'
        });
    });
    // Add some past records
    for (let d = 1; d <= 5; d++) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - d);
        const dateStr = pastDate.toISOString().split('T')[0];
        students.slice(0, 10).forEach((s, i) => {
            attendance.push({
                id: generateId('ATT'),
                studentId: s.id,
                date: dateStr,
                status: i % 5 === 0 ? 'Absent' : 'Present',
                className: s.className,
                section: s.section,
                markedBy: 'admin'
            });
        });
    }
    saveData(DB_KEYS.attendance, attendance);

    // Fees
    const fees = [];
    const months = ['September 2025', 'October 2025'];
    students.forEach((s, i) => {
        months.forEach((month, mi) => {
            const tuition = 3000;
            const transport = i % 3 === 0 ? 1500 : 0;
            const total = tuition + transport;
            const paid = mi === 0 ? total : (i % 4 === 0 ? 0 : total - 1000);
            fees.push({
                id: generateId('FEE'),
                studentId: s.id,
                studentName: s.name,
                className: s.className,
                month: month,
                tuitionFee: tuition,
                admissionFee: 0,
                examFee: 0,
                transportFee: transport,
                otherFee: 0,
                discount: 0,
                fine: mi === 1 && paid < total ? 200 : 0,
                total: total + (mi === 1 && paid < total ? 200 : 0),
                paid: paid,
                remaining: total + (mi === 1 && paid < total ? 200 : 0) - paid,
                paymentDate: paid > 0 ? '2025-09-10' : '',
                receiptNo: paid > 0 ? 'RCP' + (1000 + i + mi * 20) : '',
                status: paid >= total ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending')
            });
        });
    });
    saveData(DB_KEYS.fees, fees);

    // Exams
    const exams = [
        { id: 'EXM_001', name: 'First Term', startDate: '2025-09-15', endDate: '2025-09-25', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], totalMarks: 100, passingMarks: 40, status: 'Completed' },
        { id: 'EXM_002', name: 'Mid Term', startDate: '2025-11-10', endDate: '2025-11-20', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'], totalMarks: 100, passingMarks: 40, status: 'Upcoming' },
        { id: 'EXM_003', name: 'Final Term', startDate: '2026-03-01', endDate: '2026-03-15', classes: ['All'], totalMarks: 100, passingMarks: 40, status: 'Upcoming' }
    ];
    saveData(DB_KEYS.exams, exams);

    // Results
    const results = [];
    const subjectList = ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiyat'];
    students.filter(s => ['Class 3', 'Class 4', 'Class 5', 'Class 6'].includes(s.className)).forEach(s => {
        subjectList.forEach(sub => {
            const obtained = 40 + Math.floor(Math.random() * 55);
            results.push({
                id: generateId('RES'),
                studentId: s.id,
                studentName: s.name,
                examId: 'EXM_001',
                examName: 'First Term',
                subject: sub,
                totalMarks: 100,
                obtainedMarks: obtained,
                percentage: obtained,
                grade: obtained >= 90 ? 'A+' : obtained >= 80 ? 'A' : obtained >= 70 ? 'B' : obtained >= 60 ? 'C' : obtained >= 50 ? 'D' : 'F',
                status: obtained >= 40 ? 'Pass' : 'Fail'
            });
        });
    });
    saveData(DB_KEYS.results, results);

    // Notices
    const notices = [
        { id: 'NTC_001', title: 'School Reopening', content: 'School will reopen on Monday after the holidays. All students must arrive by 8:00 AM.', category: 'General', date: '2025-09-01', published: true },
        { id: 'NTC_002', title: 'First Term Exams', content: 'First Term examinations will commence from 15th September. Date sheet will be shared soon.', category: 'Exam', date: '2025-09-05', published: true },
        { id: 'NTC_003', title: 'Fee Submission Reminder', content: 'Please submit September fee by 10th of the month to avoid fine.', category: 'Fee', date: '2025-09-01', published: true },
        { id: 'NTC_004', title: 'Independence Day Holiday', content: 'School will remain closed on 14th August for Independence Day.', category: 'Holiday', date: '2025-08-10', published: true }
    ];
    saveData(DB_KEYS.notices, notices);

    // Events
    const events = [
        { id: 'EVT_001', title: 'Annual Sports Day', date: '2025-10-15', time: '09:00 AM', location: 'School Ground', description: 'Annual sports competition for all classes. Parents are invited.', image: '' },
        { id: 'EVT_002', title: 'Parent Teacher Meeting', date: '2025-10-05', time: '10:00 AM', location: 'School Hall', description: 'PTM for First Term results discussion.', image: '' },
        { id: 'EVT_003', title: 'Science Exhibition', date: '2025-11-20', time: '11:00 AM', location: 'Science Lab', description: 'Students will display their science projects.', image: '' }
    ];
    saveData(DB_KEYS.events, events);

    // Homework
    const homework = [
        { id: 'HW_001', title: 'Math Worksheet', className: 'Class 5', section: 'A', subject: 'Mathematics', description: 'Complete exercise 5.2 and 5.3 from textbook.', dueDate: '2025-10-05', teacherId: 'TCH_001', attachment: '', createdAt: new Date().toISOString() },
        { id: 'HW_002', title: 'English Essay', className: 'Class 6', section: 'A', subject: 'English', description: 'Write an essay on "My Favorite Season" (150 words).', dueDate: '2025-10-06', teacherId: 'TCH_002', attachment: '', createdAt: new Date().toISOString() },
        { id: 'HW_003', title: 'Science Project', className: 'Class 7', section: 'A', subject: 'Science', description: 'Prepare a model of the solar system.', dueDate: '2025-10-10', teacherId: 'TCH_003', attachment: '', createdAt: new Date().toISOString() }
    ];
    saveData(DB_KEYS.homework, homework);

    // Admissions
    const admissions = [
        { id: 'ADM_001', studentName: 'New Student One', fatherName: 'Father One', motherName: 'Mother One', dob: '2018-05-01', gender: 'Male', className: 'Class 1', phone: '03331234567', whatsapp: '03331234567', address: 'New Address', previousSchool: '', status: 'New', appliedDate: '2025-09-20', documents: [], photo: '' },
        { id: 'ADM_002', studentName: 'New Student Two', fatherName: 'Father Two', motherName: 'Mother Two', dob: '2017-03-12', gender: 'Female', className: 'Class 2', phone: '03341234567', whatsapp: '03341234567', address: 'Another Address', previousSchool: 'Old School', status: 'Under Review', appliedDate: '2025-09-18', documents: [], photo: '' }
    ];
    saveData(DB_KEYS.admissions, admissions);

    // Timetable sample
    const timetable = [
        { id: 'TT_001', className: 'Class 5', section: 'A', day: 'Monday', subject: 'Mathematics', teacher: 'Ahmed Khan', room: 'Room 5', startTime: '08:00', endTime: '08:45' },
        { id: 'TT_002', className: 'Class 5', section: 'A', day: 'Monday', subject: 'English', teacher: 'Fatima Ali', room: 'Room 5', startTime: '08:45', endTime: '09:30' },
        { id: 'TT_003', className: 'Class 5', section: 'A', day: 'Monday', subject: 'Science', teacher: 'Muhammad Hassan', room: 'Room 5', startTime: '09:45', endTime: '10:30' },
        { id: 'TT_004', className: 'Class 6', section: 'A', day: 'Monday', subject: 'Mathematics', teacher: 'Ahmed Khan', room: 'Room 6', startTime: '08:00', endTime: '08:45' }
    ];
    saveData(DB_KEYS.timetable, timetable);

    // Books
    const books = [
        { id: 'BK_001', title: 'Mathematics Grade 5', author: 'Oxford', isbn: '978-123456', category: 'Textbook', quantity: 50, available: 45, status: 'Available' },
        { id: 'BK_002', title: 'English Reader', author: 'Cambridge', isbn: '978-234567', category: 'Textbook', quantity: 40, available: 38, status: 'Available' },
        { id: 'BK_003', title: 'Science Explorer', author: 'Pearson', isbn: '978-345678', category: 'Reference', quantity: 20, available: 15, status: 'Available' }
    ];
    saveData(DB_KEYS.books, books);

    // Transport
    const transport = {
        vehicles: [
            { id: 'VEH_001', number: 'LES-1234', type: 'Van', capacity: 15, driver: 'Driver One', route: 'Route A' },
            { id: 'VEH_002', number: 'LES-5678', type: 'Bus', capacity: 30, driver: 'Driver Two', route: 'Route B' }
        ],
        routes: [
            { id: 'RT_001', name: 'Route A', stops: ['Stop 1', 'Stop 2', 'Stop 3'], fee: 1500 },
            { id: 'RT_002', name: 'Route B', stops: ['Stop 4', 'Stop 5'], fee: 1800 }
        ]
    };
    saveData(DB_KEYS.transport, transport);

    // Payroll
    const payroll = teachers.map(t => ({
        id: generateId('PAY'),
        teacherId: t.id,
        teacherName: t.name,
        month: 'September 2025',
        basicSalary: t.salary,
        bonus: 0,
        deduction: 0,
        advance: 0,
        netSalary: t.salary,
        status: 'Paid',
        paymentDate: '2025-09-28'
    }));
    saveData(DB_KEYS.payroll, payroll);

    // Notifications
    const notifications = [
        { id: 'NOT_001', title: 'New Admission', message: 'New admission application received.', type: 'admission', read: false, date: new Date().toISOString() },
        { id: 'NOT_002', title: 'Fee Pending', message: 'Several students have pending fees for October.', type: 'fee', read: false, date: new Date().toISOString() },
        { id: 'NOT_003', title: 'Absent Students', message: '3 students marked absent today.', type: 'attendance', read: true, date: new Date().toISOString() }
    ];
    saveData(DB_KEYS.notifications, notifications);

    // Gallery
    const gallery = [
        { id: 'GAL_001', title: 'School Building', category: 'School', url: 'https://via.placeholder.com/400x300?text=School+Building', date: '2025-01-01' },
        { id: 'GAL_002', title: 'Sports Day', category: 'Sports', url: 'https://via.placeholder.com/400x300?text=Sports+Day', date: '2024-10-15' },
        { id: 'GAL_003', title: 'Annual Function', category: 'Annual Function', url: 'https://via.placeholder.com/400x300?text=Annual+Function', date: '2024-12-20' }
    ];
    saveData(DB_KEYS.gallery, gallery);

    // Settings
    saveData(DB_KEYS.settings, getDefaultSettings());

    localStorage.setItem('school_initialized', 'true');
    console.log('Database initialized with demo data');
}

// Reset database
function resetDatabase() {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('school_initialized');
    initializeDatabase();
}

// Export for use
window.DB = {
    keys: DB_KEYS,
    generateId,
    saveData,
    loadData,
    getRecords,
    getRecordById,
    addRecord,
    updateRecord,
    deleteRecord,
    getSettings,
    saveSettings,
    initializeDatabase,
    resetDatabase
};

// Auto initialize
initializeDatabase();
