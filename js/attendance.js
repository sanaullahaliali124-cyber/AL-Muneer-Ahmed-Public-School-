// attendance.js - Attendance Management

function getAttendance(filters = {}) {
    let records = DB.getRecords(DB.keys.attendance);
    if (filters.date) records = records.filter(a => a.date === filters.date);
    if (filters.className) records = records.filter(a => a.className === filters.className);
    if (filters.section) records = records.filter(a => a.section === filters.section);
    if (filters.studentId) records = records.filter(a => a.studentId === filters.studentId);
    if (filters.status) records = records.filter(a => a.status === filters.status);
    return records;
}

function markAttendance(studentId, date, status, className, section) {
    // Check if already marked
    const existing = getAttendance({ studentId, date });
    if (existing.length > 0) {
        return DB.updateRecord(DB.keys.attendance, existing[0].id, { status });
    }
    return DB.addRecord(DB.keys.attendance, {
        studentId, date, status, className, section, markedBy: Auth.getCurrentUser()?.username || 'admin'
    });
}

function saveBulkAttendance(records) {
    records.forEach(r => {
        markAttendance(r.studentId, r.date, r.status, r.className, r.section);
    });
    return true;
}

function getStudentAttendancePercentage(studentId, fromDate = null, toDate = null) {
    let records = getAttendance({ studentId });
    if (fromDate) records = records.filter(a => a.date >= fromDate);
    if (toDate) records = records.filter(a => a.date <= toDate);
    if (records.length === 0) return { percentage: 0, present: 0, total: 0 };
    const present = records.filter(a => a.status === 'Present' || a.status === 'Late').length;
    return {
        percentage: Math.round((present / records.length) * 100),
        present,
        total: records.length,
        absent: records.filter(a => a.status === 'Absent').length,
        leave: records.filter(a => a.status === 'Leave').length,
        late: records.filter(a => a.status === 'Late').length
    };
}

function getAbsentStudents(date) {
    return WhatsApp.getAbsentStudentsWhatsAppList(date);
}

function renderAttendanceSheet(containerId, className, section, date) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const students = DB.getRecords(DB.keys.students)
        .filter(s => s.className === className && s.section === section && s.status === 'Active')
        .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));
    
    const existing = getAttendance({ date, className, section });
    
    if (students.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><h3>No students in this class/section</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Roll No</th><th>Student Name</th><th>Present</th><th>Absent</th><th>Leave</th><th>Late</th>
        </tr></thead><tbody>`;
    
    students.forEach((s, i) => {
        const att = existing.find(a => a.studentId === s.id);
        const status = att ? att.status : 'Present';
        html += `<tr>
            <td>${i + 1}</td>
            <td>${App.escapeHtml(s.rollNo)}</td>
            <td><strong>${App.escapeHtml(s.name)}</strong></td>
            <td><input type="radio" name="att_${s.id}" value="Present" ${status === 'Present' ? 'checked' : ''} data-student="${s.id}"></td>
            <td><input type="radio" name="att_${s.id}" value="Absent" ${status === 'Absent' ? 'checked' : ''} data-student="${s.id}"></td>
            <td><input type="radio" name="att_${s.id}" value="Leave" ${status === 'Leave' ? 'checked' : ''} data-student="${s.id}"></td>
            <td><input type="radio" name="att_${s.id}" value="Late" ${status === 'Late' ? 'checked' : ''} data-student="${s.id}"></td>
        </tr>`;
    });
    
    html += `</tbody></table></div>
        <div style="margin-top:15px;">
            <button class="btn btn-primary" onclick="saveAttendanceSheet('${className}','${section}','${date}')">
                <i class="fas fa-save"></i> Save Attendance
            </button>
        </div>`;
    
    container.innerHTML = html;
}

function saveAttendanceSheet(className, section, date) {
    const radios = document.querySelectorAll('input[type="radio"][data-student]:checked');
    const records = [];
    radios.forEach(r => {
        records.push({
            studentId: r.dataset.student,
            date, status: r.value, className, section
        });
    });
    saveBulkAttendance(records);
    App.showToast('Attendance saved successfully', 'success');
    
    // Notify for absents
    const absents = records.filter(r => r.status === 'Absent');
    if (absents.length > 0) {
        DB.addRecord(DB.keys.notifications, {
            title: 'Absent Students',
            message: `${absents.length} student(s) marked absent on ${date}`,
            type: 'attendance',
            read: false,
            date: new Date().toISOString()
        });
    }
}

function renderAbsentWhatsAppList(containerId, date) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const absents = getAbsentStudents(date);
    
    if (absents.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle"></i><h3>No Absent Students</h3><p>All students are present today!</p></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Student</th><th>Father</th><th>Class</th><th>Section</th><th>WhatsApp</th><th>Action</th>
        </tr></thead><tbody>`;
    
    absents.forEach((item, i) => {
        const s = item.student;
        const msg = `Assalam-o-Alaikum. This is to inform you that your child ${s.name} (${s.className}-${s.section}) was marked ABSENT today (${date}) at AL FIDA HUSSAIN PUBLIC SCHOOLS. Please contact the school if needed.`;
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(s.name)}</strong></td>
            <td>${App.escapeHtml(s.fatherName)}</td>
            <td>${App.escapeHtml(s.className)}</td>
            <td>${App.escapeHtml(s.section)}</td>
            <td>${App.escapeHtml(s.parentWhatsapp || 'N/A')}</td>
            <td>${s.parentWhatsapp ? WhatsApp.createWhatsAppButton(s.parentWhatsapp, msg, 'Notify', 'btn btn-success btn-sm') : '-'}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Attendance = {
    getAttendance, markAttendance, saveBulkAttendance, getStudentAttendancePercentage,
    getAbsentStudents, renderAttendanceSheet, saveAttendanceSheet, renderAbsentWhatsAppList
};
