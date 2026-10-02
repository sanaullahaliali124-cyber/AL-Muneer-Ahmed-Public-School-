// exams.js - Exam Management

function getExams() {
    return DB.getRecords(DB.keys.exams);
}

function getExamById(id) {
    return DB.getRecordById(DB.keys.exams, id);
}

function addExam(data) {
    return DB.addRecord(DB.keys.exams, data);
}

function updateExam(id, data) {
    return DB.updateRecord(DB.keys.exams, id, data);
}

function deleteExam(id) {
    return DB.deleteRecord(DB.keys.exams, id);
}

function renderExamsTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const exams = getExams();
    
    if (exams.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-file-alt"></i><h3>No Exams Found</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Exam Name</th><th>Start Date</th><th>End Date</th>
            <th>Total Marks</th><th>Passing</th><th>Status</th><th>Actions</th>
        </tr></thead><tbody>`;
    
    exams.forEach((e, i) => {
        const statusClass = e.status === 'Completed' ? 'badge-success' : e.status === 'Ongoing' ? 'badge-warning' : 'badge-info';
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(e.name)}</strong></td>
            <td>${App.formatDate(e.startDate)}</td>
            <td>${App.formatDate(e.endDate)}</td>
            <td>${e.totalMarks}</td>
            <td>${e.passingMarks}</td>
            <td><span class="badge ${statusClass}">${e.status}</span></td>
            <td class="actions">
                <button class="btn-icon edit" onclick="editExam('${e.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="confirmDeleteExam('${e.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Exams = { getExams, getExamById, addExam, updateExam, deleteExam, renderExamsTable };
