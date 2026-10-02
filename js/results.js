// results.js - Results & Marks Management

function getResults(filters = {}) {
    let results = DB.getRecords(DB.keys.results);
    if (filters.studentId) results = results.filter(r => r.studentId === filters.studentId);
    if (filters.examId) results = results.filter(r => r.examId === filters.examId);
    if (filters.subject) results = results.filter(r => r.subject === filters.subject);
    return results;
}

function addResult(data) {
    data.percentage = data.totalMarks > 0 ? Math.round((data.obtainedMarks / data.totalMarks) * 100) : 0;
    const gradeInfo = App.calculateGrade(data.percentage);
    data.grade = gradeInfo.grade;
    data.status = data.percentage >= 40 ? 'Pass' : 'Fail';
    return DB.addRecord(DB.keys.results, data);
}

function updateResult(id, data) {
    if (data.obtainedMarks !== undefined && data.totalMarks) {
        data.percentage = Math.round((data.obtainedMarks / data.totalMarks) * 100);
        const gradeInfo = App.calculateGrade(data.percentage);
        data.grade = gradeInfo.grade;
        data.status = data.percentage >= 40 ? 'Pass' : 'Fail';
    }
    return DB.updateRecord(DB.keys.results, id, data);
}

function deleteResult(id) {
    return DB.deleteRecord(DB.keys.results, id);
}

function getStudentResultSummary(studentId, examId) {
    const results = getResults({ studentId, examId });
    if (results.length === 0) return null;
    
    const totalMarks = results.reduce((s, r) => s + r.totalMarks, 0);
    const obtained = results.reduce((s, r) => s + r.obtainedMarks, 0);
    const percentage = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    const gradeInfo = App.calculateGrade(percentage);
    
    return {
        subjects: results,
        totalMarks,
        obtained,
        percentage,
        grade: gradeInfo.grade,
        remark: gradeInfo.remark,
        status: percentage >= 40 ? 'Pass' : 'Fail'
    };
}

function generateResultCardHTML(studentId, examId) {
    const student = DB.getRecordById(DB.keys.students, studentId);
    const exam = DB.getRecordById(DB.keys.exams, examId);
    const summary = getStudentResultSummary(studentId, examId);
    const settings = DB.getSettings();
    const att = Attendance.getStudentAttendancePercentage(studentId);
    
    if (!student || !summary) return '<p>Result not found</p>';
    
    let subjectsHtml = summary.subjects.map(r => `
        <tr>
            <td style="border:1px solid #333;padding:6px;">${App.escapeHtml(r.subject)}</td>
            <td style="border:1px solid #333;padding:6px;text-align:center;">${r.totalMarks}</td>
            <td style="border:1px solid #333;padding:6px;text-align:center;">${r.obtainedMarks}</td>
            <td style="border:1px solid #333;padding:6px;text-align:center;">${r.grade}</td>
        </tr>
    `).join('');
    
    return `
        <div class="certificate" id="result-card-print">
            <div class="cert-header">
                <h1>${settings.schoolName}</h1>
                <p class="tagline">${settings.tagline}</p>
                <h2 style="margin-top:10px;color:var(--gold-dark);">RESULT CARD - ${App.escapeHtml(exam?.name || '')}</h2>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;font-size:0.9rem;">
                <p><strong>Student:</strong> ${App.escapeHtml(student.name)}</p>
                <p><strong>Father:</strong> ${App.escapeHtml(student.fatherName)}</p>
                <p><strong>Class:</strong> ${App.escapeHtml(student.className)} - ${App.escapeHtml(student.section)}</p>
                <p><strong>Roll No:</strong> ${App.escapeHtml(student.rollNo)}</p>
                <p><strong>Admission No:</strong> ${App.escapeHtml(student.admissionNo)}</p>
                <p><strong>Attendance:</strong> ${att.percentage}%</p>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#f0f0f0;">
                    <th style="border:1px solid #333;padding:6px;">Subject</th>
                    <th style="border:1px solid #333;padding:6px;">Total</th>
                    <th style="border:1px solid #333;padding:6px;">Obtained</th>
                    <th style="border:1px solid #333;padding:6px;">Grade</th>
                </tr></thead>
                <tbody>${subjectsHtml}</tbody>
                <tfoot>
                    <tr style="font-weight:bold;background:#f8f8f8;">
                        <td style="border:1px solid #333;padding:6px;">Total</td>
                        <td style="border:1px solid #333;padding:6px;text-align:center;">${summary.totalMarks}</td>
                        <td style="border:1px solid #333;padding:6px;text-align:center;">${summary.obtained}</td>
                        <td style="border:1px solid #333;padding:6px;text-align:center;">${summary.grade}</td>
                    </tr>
                </tfoot>
            </table>
            <div style="margin-top:15px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:0.9rem;">
                <p><strong>Percentage:</strong> ${summary.percentage}%</p>
                <p><strong>Grade:</strong> ${summary.grade}</p>
                <p><strong>Result:</strong> ${summary.status}</p>
            </div>
            <p style="margin-top:10px;"><strong>Remarks:</strong> ${summary.remark}</p>
            <div style="margin-top:40px;display:flex;justify-content:space-between;">
                <div style="text-align:center;"><div style="border-top:1px solid #333;width:140px;padding-top:5px;font-size:0.85rem;">Class Teacher</div></div>
                <div style="text-align:center;"><div style="border-top:1px solid #333;width:140px;padding-top:5px;font-size:0.85rem;">Principal</div></div>
            </div>
        </div>`;
}

function renderResultsTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let results = getResults(options.filters || {});
    
    if (results.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>No Results Found</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Student</th><th>Exam</th><th>Subject</th>
            <th>Total</th><th>Obtained</th><th>%</th><th>Grade</th><th>Status</th>
        </tr></thead><tbody>`;
    
    results.forEach((r, i) => {
        const statusClass = r.status === 'Pass' ? 'badge-success' : 'badge-danger';
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(r.studentName)}</strong></td>
            <td>${App.escapeHtml(r.examName)}</td>
            <td>${App.escapeHtml(r.subject)}</td>
            <td>${r.totalMarks}</td>
            <td>${r.obtainedMarks}</td>
            <td>${r.percentage}%</td>
            <td><strong>${r.grade}</strong></td>
            <td><span class="badge ${statusClass}">${r.status}</span></td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Results = {
    getResults, addResult, updateResult, deleteResult, getStudentResultSummary,
    generateResultCardHTML, renderResultsTable
};
