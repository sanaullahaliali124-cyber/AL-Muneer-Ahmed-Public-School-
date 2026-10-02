// teachers.js - Teacher Management

function getTeachers() {
    return DB.getRecords(DB.keys.teachers);
}

function getTeacherById(id) {
    return DB.getRecordById(DB.keys.teachers, id);
}

function addTeacher(data) {
    if (!data.status) data.status = 'Active';
    return DB.addRecord(DB.keys.teachers, data);
}

function updateTeacher(id, data) {
    return DB.updateRecord(DB.keys.teachers, id, data);
}

function deleteTeacher(id) {
    return DB.deleteRecord(DB.keys.teachers, id);
}

function searchTeachers(query, filters = {}) {
    let teachers = getTeachers();
    if (query) {
        const term = query.toLowerCase();
        teachers = teachers.filter(t =>
            [t.name, t.phone, t.email, t.qualification, ...(t.subjects || [])]
                .some(f => f && String(f).toLowerCase().includes(term))
        );
    }
    if (filters.status) teachers = teachers.filter(t => t.status === filters.status);
    return teachers;
}

function renderTeachersTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const teachers = searchTeachers(options.search || '', options.filters || {});
    
    if (teachers.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-chalkboard-teacher"></i><h3>No Teachers Found</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Qualification</th>
            <th>Subjects</th><th>Experience</th><th>Salary</th><th>Status</th><th>Actions</th>
        </tr></thead><tbody>`;
    
    teachers.forEach((t, i) => {
        const statusClass = t.status === 'Active' ? 'badge-success' : 'badge-secondary';
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(t.name)}</strong></td>
            <td>${App.escapeHtml(t.phone || '-')}</td>
            <td>${App.escapeHtml(t.email || '-')}</td>
            <td>${App.escapeHtml(t.qualification || '-')}</td>
            <td>${(t.subjects || []).map(s => App.escapeHtml(s)).join(', ')}</td>
            <td>${t.experience || 0} yrs</td>
            <td>${App.formatCurrency(t.salary)}</td>
            <td><span class="badge ${statusClass}">${t.status}</span></td>
            <td class="actions">
                <button class="btn-icon view" onclick="viewTeacher('${t.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn-icon edit" onclick="editTeacher('${t.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon whatsapp" onclick="WhatsApp.openTeacherWhatsApp(getTeacherById('${t.id}'))" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                <button class="btn-icon delete" onclick="confirmDeleteTeacher('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Teachers = {
    getTeachers, getTeacherById, addTeacher, updateTeacher, deleteTeacher, searchTeachers, renderTeachersTable
};
