// whatsapp.js - WhatsApp Integration

function formatWhatsAppNumber(number) {
    if (!number) return '';
    // Remove spaces, dashes, plus
    let cleaned = number.toString().replace(/[\s\-\+]/g, '');
    
    // If starts with 0, replace with 92
    if (cleaned.startsWith('0')) {
        cleaned = '92' + cleaned.substring(1);
    }
    // If starts with 92, keep
    // If 10 digits, assume Pakistan and add 92
    if (cleaned.length === 10 && !cleaned.startsWith('92')) {
        cleaned = '92' + cleaned;
    }
    return cleaned;
}

function openWhatsApp(number, message = '') {
    const formatted = formatWhatsAppNumber(number);
    if (!formatted) {
        showToast('Invalid WhatsApp number', 'error');
        return;
    }
    let url = `https://wa.me/${formatted}`;
    if (message) {
        url += `?text=${encodeURIComponent(message)}`;
    }
    window.open(url, '_blank');
}

function getSchoolWhatsApp() {
    const settings = DB.getSettings();
    return settings.whatsappIntl || '923304886710';
}

function openSchoolWhatsApp(message = '') {
    const defaultMsg = message || `Assalam-o-Alaikum. I would like to inquire about The Smart Modern Public School.`;
    openWhatsApp(getSchoolWhatsApp(), defaultMsg);
}

function openParentWhatsApp(student, customMessage = '') {
    if (!student || !student.parentWhatsapp) {
        showToast('No WhatsApp number available for this parent', 'error');
        return;
    }
    const msg = customMessage || `Assalam-o-Alaikum. This is a message from The Smart Modern Public School regarding your child ${student.name} (${student.className} - ${student.section}).`;
    openWhatsApp(student.parentWhatsapp, msg);
}

function openTeacherWhatsApp(teacher, customMessage = '') {
    if (!teacher || !teacher.whatsapp) {
        showToast('No WhatsApp number available', 'error');
        return;
    }
    const msg = customMessage || `Assalam-o-Alaikum. This is a message from The Smart Modern Public School.`;
    openWhatsApp(teacher.whatsapp, msg);
}

function createWhatsAppButton(number, message = '', label = 'WhatsApp', classes = 'btn btn-success btn-sm') {
    const formatted = formatWhatsAppNumber(number);
    if (!formatted) return '';
    const encodedMsg = encodeURIComponent(message);
    return `<a href="https://wa.me/${formatted}?text=${encodedMsg}" target="_blank" class="${classes}" title="Chat on WhatsApp">
        <i class="fab fa-whatsapp"></i> ${label}
    </a>`;
}

function getAbsentStudentsWhatsAppList(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const attendance = DB.getRecords(DB.keys.attendance).filter(a => a.date === targetDate && a.status === 'Absent');
    const students = DB.getRecords(DB.keys.students);
    
    return attendance.map(a => {
        const student = students.find(s => s.id === a.studentId);
        if (!student) return null;
        return {
            student,
            attendance: a,
            whatsapp: student.parentWhatsapp
        };
    }).filter(Boolean);
}

function getFeeDefaulters() {
    const fees = DB.getRecords(DB.keys.fees).filter(f => f.remaining > 0);
    const students = DB.getRecords(DB.keys.students);
    
    return fees.map(f => {
        const student = students.find(s => s.id === f.studentId);
        return {
            fee: f,
            student: student,
            whatsapp: student ? student.parentWhatsapp : null
        };
    }).filter(item => item.student);
}

window.WhatsApp = {
    formatWhatsAppNumber,
    openWhatsApp,
    getSchoolWhatsApp,
    openSchoolWhatsApp,
    openParentWhatsApp,
    openTeacherWhatsApp,
    createWhatsAppButton,
    getAbsentStudentsWhatsAppList,
    getFeeDefaulters
};
