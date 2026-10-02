// timetable.js

function getTimetable(filters = {}) {
    let records = DB.getRecords(DB.keys.timetable);
    if (filters.className) records = records.filter(t => t.className === filters.className);
    if (filters.section) records = records.filter(t => t.section === filters.section);
    if (filters.day) records = records.filter(t => t.day === filters.day);
    return records;
}

function addTimetableEntry(data) {
    return DB.addRecord(DB.keys.timetable, data);
}

function updateTimetableEntry(id, data) {
    return DB.updateRecord(DB.keys.timetable, id, data);
}

function deleteTimetableEntry(id) {
    return DB.deleteRecord(DB.keys.timetable, id);
}

function renderTimetable(containerId, className, section) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const entries = getTimetable({ className, section });
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr><th>Day</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Time</th><th>Actions</th></tr></thead><tbody>`;
    
    if (entries.length === 0) {
        html += `<tr><td colspan="6" style="text-align:center;padding:30px;">No timetable entries. Add periods below.</td></tr>`;
    } else {
        days.forEach(day => {
            const dayEntries = entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
            dayEntries.forEach(e => {
                html += `<tr>
                    <td><strong>${e.day}</strong></td>
                    <td>${App.escapeHtml(e.subject)}</td>
                    <td>${App.escapeHtml(e.teacher)}</td>
                    <td>${App.escapeHtml(e.room)}</td>
                    <td>${e.startTime} - ${e.endTime}</td>
                    <td class="actions">
                        <button class="btn-icon delete" onclick="deleteTimetable('${e.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        });
    }
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Timetable = { getTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, renderTimetable };
