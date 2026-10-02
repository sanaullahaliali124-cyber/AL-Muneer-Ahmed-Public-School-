// notifications.js

function getNotifications() {
    return DB.getRecords(DB.keys.notifications).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getUnreadCount() {
    return getNotifications().filter(n => !n.read).length;
}

function markAsRead(id) {
    return DB.updateRecord(DB.keys.notifications, id, { read: true });
}

function markAllAsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => {
        if (!n.read) DB.updateRecord(DB.keys.notifications, n.id, { read: true });
    });
}

function addNotification(title, message, type = 'general') {
    return DB.addRecord(DB.keys.notifications, {
        title, message, type, read: false, date: new Date().toISOString()
    });
}

function renderNotifications(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const list = getNotifications();
    
    if (list.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-bell"></i><h3>No Notifications</h3></div>`;
        return;
    }
    
    let html = '';
    list.forEach(n => {
        html += `
        <div class="panel" style="margin-bottom:10px;${n.read ? 'opacity:0.7;' : ''}">
            <div class="panel-body" style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <strong style="font-size:0.95rem;">${App.escapeHtml(n.title)}</strong>
                    ${!n.read ? '<span class="badge badge-danger" style="margin-left:8px;">New</span>' : ''}
                    <p style="font-size:0.85rem;color:var(--text-secondary);margin-top:3px;">${App.escapeHtml(n.message)}</p>
                    <small style="color:var(--text-secondary);">${App.formatDate(n.date)}</small>
                </div>
                ${!n.read ? `<button class="btn btn-sm btn-secondary" onclick="markNotificationRead('${n.id}')">Mark Read</button>` : ''}
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

function updateNotificationBadge() {
    const count = getUnreadCount();
    document.querySelectorAll('.notification-badge').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

window.Notifications = {
    getNotifications, getUnreadCount, markAsRead, markAllAsRead, addNotification,
    renderNotifications, updateNotificationBadge
};
