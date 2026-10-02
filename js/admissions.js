// admissions.js

function getAdmissions(filters = {}) {
    let records = DB.getRecords(DB.keys.admissions);
    if (filters.status) records = records.filter(a => a.status === filters.status);
    return records.sort((a, b) => new Date(b.appliedDate || b.createdAt) - new Date(a.appliedDate || a.createdAt));
}

function addAdmission(data) {
    if (!data.status) data.status = 'New';
    if (!data.appliedDate) data.appliedDate = new Date().toISOString().split('T')[0];
    const adm = DB.addRecord(DB.keys.admissions, data);
    
    DB.addRecord(DB.keys.notifications, {
        title: 'New Admission',
        message: `New admission application from ${data.studentName} for ${data.className}`,
        type: 'admission',
        read: false,
        date: new Date().toISOString()
    });
    
    return adm;
}

function updateAdmission(id, data) {
    return DB.updateRecord(DB.keys.admissions, id, data);
}

function deleteAdmission(id) {
    return DB.deleteRecord(DB.keys.admissions, id);
}

function enrollStudent(admissionId) {
    const adm = DB.getRecordById(DB.keys.admissions, admissionId);
    if (!adm) return null;
    
    const student = Students.addStudent({
        name: adm.studentName,
        fatherName: adm.fatherName,
        motherName: adm.motherName,
        dob: adm.dob,
        gender: adm.gender,
        className: adm.className,
        section: 'A',
        phone: adm.phone,
        parentWhatsapp: adm.whatsapp,
        address: adm.address,
        previousSchool: adm.previousSchool,
        status: 'Active',
        admissionDate: new Date().toISOString().split('T')[0]
    });
    
    updateAdmission(admissionId, { status: 'Enrolled', studentId: student.id });
    return student;
}

function renderAdmissionsTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const list = getAdmissions(options.filters || {});
    
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-plus"></i><h3>No Admission Applications</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Student Name</th><th>Father</th><th>Class</th><th>Phone</th>
            <th>Applied</th><th>Status</th><th>Actions</th>
        </tr></thead><tbody>`;
    
    list.forEach((a, i) => {
        const statusMap = {
            'New': 'badge-info',
            'Under Review': 'badge-warning',
            'Approved': 'badge-success',
            'Rejected': 'badge-danger',
            'Enrolled': 'badge-primary'
        };
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(a.studentName)}</strong></td>
            <td>${App.escapeHtml(a.fatherName)}</td>
            <td>${App.escapeHtml(a.className)}</td>
            <td>${App.escapeHtml(a.phone)}</td>
            <td>${App.formatDate(a.appliedDate)}</td>
            <td><span class="badge ${statusMap[a.status] || 'badge-secondary'}">${a.status}</span></td>
            <td class="actions">
                <select onchange="updateAdmissionStatus('${a.id}', this.value)" style="padding:4px 8px;border-radius:4px;font-size:0.8rem;">
                    <option value="New" ${a.status==='New'?'selected':''}>New</option>
                    <option value="Under Review" ${a.status==='Under Review'?'selected':''}>Under Review</option>
                    <option value="Approved" ${a.status==='Approved'?'selected':''}>Approved</option>
                    <option value="Rejected" ${a.status==='Rejected'?'selected':''}>Rejected</option>
                    <option value="Enrolled" ${a.status==='Enrolled'?'selected':''}>Enrolled</option>
                </select>
                ${a.status === 'Approved' ? `<button class="btn btn-primary btn-sm" onclick="enrollAdmission('${a.id}')">Enroll</button>` : ''}
                ${a.whatsapp ? WhatsApp.createWhatsAppButton(a.whatsapp, `Assalam-o-Alaikum. Regarding your admission application for ${a.studentName} at AL Muneer Ahmed Public School.`, '', 'btn btn-success btn-sm') : ''}
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Admissions = {
    getAdmissions, addAdmission, updateAdmission, deleteAdmission, enrollStudent, renderAdmissionsTable
};
