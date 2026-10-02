// parents.js - Parent Management

function getParents() {
    return DB.getRecords(DB.keys.parents);
}

function getParentById(id) {
    return DB.getRecordById(DB.keys.parents, id);
}

function addParent(data) {
    if (!data.children) data.children = [];
    return DB.addRecord(DB.keys.parents, data);
}

function updateParent(id, data) {
    return DB.updateRecord(DB.keys.parents, id, data);
}

function deleteParent(id) {
    return DB.deleteRecord(DB.keys.parents, id);
}

function searchParents(query) {
    let parents = getParents();
    if (query) {
        const term = query.toLowerCase();
        parents = parents.filter(p =>
            [p.fatherName, p.motherName, p.phone, p.whatsapp, p.email]
                .some(f => f && String(f).toLowerCase().includes(term))
        );
    }
    return parents;
}

function getParentChildren(parentId) {
    const parent = getParentById(parentId);
    if (!parent || !parent.children) return [];
    return parent.children.map(id => DB.getRecordById(DB.keys.students, id)).filter(Boolean);
}

function renderParentsTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const parents = searchParents(options.search || '');
    
    if (parents.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><h3>No Parents Found</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Father Name</th><th>Mother Name</th><th>Phone</th><th>WhatsApp</th>
            <th>Children</th><th>Actions</th>
        </tr></thead><tbody>`;
    
    parents.forEach((p, i) => {
        const children = getParentChildren(p.id);
        const childrenNames = children.map(c => c.name).join(', ') || '-';
        const waBtn = p.whatsapp 
            ? WhatsApp.createWhatsAppButton(p.whatsapp, `Assalam-o-Alaikum. This is a message from AL FIDA HUSSAIN PUBLIC SCHOOLS.`, 'Chat', 'btn btn-success btn-sm')
            : '-';
        
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(p.fatherName)}</strong></td>
            <td>${App.escapeHtml(p.motherName || '-')}</td>
            <td>${App.escapeHtml(p.phone || '-')}</td>
            <td>${App.escapeHtml(p.whatsapp || '-')}</td>
            <td>${App.escapeHtml(childrenNames)} (${children.length})</td>
            <td class="actions">
                <button class="btn-icon view" onclick="viewParent('${p.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="btn-icon edit" onclick="editParent('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                ${waBtn}
                <button class="btn-icon delete" onclick="confirmDeleteParent('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

window.Parents = {
    getParents, getParentById, addParent, updateParent, deleteParent, searchParents, getParentChildren, renderParentsTable
};
