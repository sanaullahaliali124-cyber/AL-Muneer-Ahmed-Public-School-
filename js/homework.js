// homework.js

function getHomework(filters = {}) {
    let records = DB.getRecords(DB.keys.homework);
    if (filters.className) records = records.filter(h => h.className === filters.className);
    if (filters.section) records = records.filter(h => h.section === filters.section);
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function addHomework(data) {
    const hw = DB.addRecord(DB.keys.homework, data);
    DB.addRecord(DB.keys.notifications, {
        title: 'New Homework',
        message: `Homework assigned for ${data.className}: ${data.title}`,
        type: 'homework',
        read: false,
        date: new Date().toISOString()
    });
    return hw;
}

function updateHomework(id, data) {
    return DB.updateRecord(DB.keys.homework, id, data);
}

function deleteHomework(id) {
    return DB.deleteRecord(DB.keys.homework, id);
}

function renderHomeworkList(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const list = getHomework(options.filters || {});
    
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-book-open"></i><h3>No Homework</h3></div>`;
        return;
    }
    
    let html = '';
    list.forEach(h => {
        html += `
        <div class="panel" style="margin-bottom:15px;">
            <div class="panel-body">
                <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:10px;">
                    <div>
                        <h3 style="font-size:1.05rem;margin-bottom:5px;">${App.escapeHtml(h.title)}</h3>
                        <p style="color:var(--text-secondary);font-size:0.85rem;">
                            <span class="badge badge-primary">${App.escapeHtml(h.className)} - ${App.escapeHtml(h.section || '')}</span>
                            <span class="badge badge-info">${App.escapeHtml(h.subject)}</span>
                            Due: ${App.formatDate(h.dueDate)}
                        </p>
                        <p style="margin-top:8px;">${App.escapeHtml(h.description)}</p>
                    </div>
                    <div class="actions">
                        <button class="btn-icon delete" onclick="confirmDeleteHomework('${h.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

window.Homework = { getHomework, addHomework, updateHomework, deleteHomework, renderHomeworkList };
