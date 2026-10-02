// students.js - Student Management Module

function getStudents() {
    return DB.getRecords(DB.keys.students);
}

function getStudentById(id) {
    return DB.getRecordById(DB.keys.students, id);
}

function addStudent(data) {
    // Generate admission number if not provided
    if (!data.admissionNo) {
        const year = new Date().getFullYear();
        const count = getStudents().length + 1;
        data.admissionNo = `ADM${year}${String(count).padStart(3, '0')}`;
    }
    if (!data.status) data.status = 'Active';
    const student = DB.addRecord(DB.keys.students, data);
    
    // Add notification
    DB.addRecord(DB.keys.notifications, {
        title: 'New Student',
        message: `Student ${student.name} added to ${student.className}`,
        type: 'student',
        read: false,
        date: new Date().toISOString()
    });
    
    return student;
}

function updateStudent(id, data) {
    return DB.updateRecord(DB.keys.students, id, data);
}

function deleteStudent(id) {
    return DB.deleteRecord(DB.keys.students, id);
}

function searchStudents(query, filters = {}) {
    let students = getStudents();
    
    if (query) {
        const term = query.toLowerCase();
        students = students.filter(s =>
            [s.name, s.fatherName, s.admissionNo, s.id, s.rollNo, s.phone, s.parentWhatsapp, s.className]
                .some(f => f && String(f).toLowerCase().includes(term))
        );
    }
    
    if (filters.className) {
        students = students.filter(s => s.className === filters.className);
    }
    if (filters.section) {
        students = students.filter(s => s.section === filters.section);
    }
    if (filters.status) {
        students = students.filter(s => s.status === filters.status);
    }
    if (filters.gender) {
        students = students.filter(s => s.gender === filters.gender);
    }
    if (filters.hasWhatsapp) {
        students = students.filter(s => s.parentWhatsapp && s.parentWhatsapp.length > 5);
    }
    
    // Sort
    if (filters.sortBy) {
        const key = filters.sortBy;
        const dir = filters.sortDir === 'desc' ? -1 : 1;
        students.sort((a, b) => {
            const va = a[key] || '';
            const vb = b[key] || '';
            return va < vb ? -dir : va > vb ? dir : 0;
        });
    }
    
    return students;
}

function renderStudentsTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const students = searchStudents(options.search || '', options.filters || {});
    const page = options.page || 1;
    const perPage = options.perPage || 15;
    const paginated = App.paginate(students, page, perPage);
    
    if (paginated.data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-graduate"></i>
                <h3>No Students Found</h3>
                <p>Try adjusting your search or filters</p>
            </div>`;
        return;
    }
    
    let html = `
        <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Admission No</th>
                    <th>Name</th>
                    <th>Father Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Roll No</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;
    
    paginated.data.forEach((s, i) => {
        const statusClass = s.status === 'Active' ? 'badge-success' : 'badge-secondary';
        html += `
            <tr>
                <td>${(page - 1) * perPage + i + 1}</td>
                <td>${App.escapeHtml(s.admissionNo)}</td>
                <td><strong>${App.escapeHtml(s.name)}</strong></td>
                <td>${App.escapeHtml(s.fatherName)}</td>
                <td>${App.escapeHtml(s.className)}</td>
                <td>${App.escapeHtml(s.section)}</td>
                <td>${App.escapeHtml(s.rollNo)}</td>
                <td>${App.escapeHtml(s.phone || '-')}</td>
                <td><span class="badge ${statusClass}">${s.status}</span></td>
                <td class="actions">
                    <button class="btn-icon view" onclick="viewStudent('${s.id}')" title="View"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon edit" onclick="editStudent('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon whatsapp" onclick="WhatsApp.openParentWhatsApp(getStudentById('${s.id}'))" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                    <button class="btn-icon delete" onclick="confirmDeleteStudent('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    
    html += `</tbody></table></div>`;
    
    // Pagination
    if (paginated.totalPages > 1) {
        html += `<div class="pagination">`;
        html += `<button ${!paginated.hasPrev ? 'disabled' : ''} onclick="loadStudentsPage(${page - 1})"><i class="fas fa-chevron-left"></i></button>`;
        for (let p = 1; p <= Math.min(paginated.totalPages, 7); p++) {
            html += `<button class="${p === page ? 'active' : ''}" onclick="loadStudentsPage(${p})">${p}</button>`;
        }
        html += `<button ${!paginated.hasNext ? 'disabled' : ''} onclick="loadStudentsPage(${page + 1})"><i class="fas fa-chevron-right"></i></button>`;
        html += `</div>`;
    }
    
    html += `<p style="text-align:center;color:var(--text-secondary);font-size:0.85rem;margin-top:10px;">Showing ${paginated.data.length} of ${paginated.total} students</p>`;
    
    container.innerHTML = html;
}

function renderStudentWhatsAppTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let students = searchStudents(options.search || '', options.filters || {});
    
    let html = `
        <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Father Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>WhatsApp Number</th>
                    <th>Status</th>
                    <th>WhatsApp</th>
                </tr>
            </thead>
            <tbody>`;
    
    if (students.length === 0) {
        html += `<tr><td colspan="9" style="text-align:center;padding:30px;">No students found</td></tr>`;
    } else {
        students.forEach((s, i) => {
            const statusClass = s.status === 'Active' ? 'badge-success' : 'badge-secondary';
            const waBtn = s.parentWhatsapp 
                ? WhatsApp.createWhatsAppButton(s.parentWhatsapp, `Assalam-o-Alaikum. This is a message from AL Muneer Ahmed Public School regarding your child ${s.name} (${s.className}-${s.section}).`, 'Chat', 'btn btn-success btn-sm')
                : '<span class="badge badge-secondary">N/A</span>';
            
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${App.escapeHtml(s.id)}</td>
                    <td><strong>${App.escapeHtml(s.name)}</strong></td>
                    <td>${App.escapeHtml(s.fatherName)}</td>
                    <td>${App.escapeHtml(s.className)}</td>
                    <td>${App.escapeHtml(s.section)}</td>
                    <td>${App.escapeHtml(s.parentWhatsapp || '-')}</td>
                    <td><span class="badge ${statusClass}">${s.status}</span></td>
                    <td>${waBtn}</td>
                </tr>`;
        });
    }
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function exportStudentsCSV() {
    const students = getStudents();
    const data = students.map(s => ({
        'Student ID': s.id,
        'Admission No': s.admissionNo,
        'Name': s.name,
        'Father Name': s.fatherName,
        'Mother Name': s.motherName,
        'DOB': s.dob,
        'Gender': s.gender,
        'Class': s.className,
        'Section': s.section,
        'Roll No': s.rollNo,
        'Phone': s.phone,
        'Parent WhatsApp': s.parentWhatsapp,
        'Address': s.address,
        'Status': s.status
    }));
    App.exportToCSV(data, 'students_export.csv');
}

window.Students = {
    getStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
    renderStudentsTable,
    renderStudentWhatsAppTable,
    exportStudentsCSV
};
