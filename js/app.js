// app.js - Common Application Utilities

// Toast Notification
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    toast.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 250px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        font-size: 14px;
    `;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;cursor:pointer;margin-left:auto;font-size:18px;">&times;</button>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Confirm Dialog
function confirmDialog(message, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
    
    overlay.innerHTML = `
        <div style="background:var(--card-bg,#fff);padding:24px;border-radius:12px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
            <h3 style="margin:0 0 12px;color:var(--text-primary,#1e293b);">Confirm</h3>
            <p style="margin:0 0 20px;color:var(--text-secondary,#64748b);">${escapeHtml(message)}</p>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
                <button class="btn btn-danger" id="confirm-ok">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('confirm-ok').onclick = () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    };
    document.getElementById('confirm-cancel').onclick = () => {
        overlay.remove();
        if (onCancel) onCancel();
    };
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
        }
    };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format currency
function formatCurrency(amount) {
    return 'Rs. ' + Number(amount || 0).toLocaleString('en-PK');
}

// Calculate grade
function calculateGrade(percentage) {
    const settings = DB.getSettings();
    const grades = settings.grades || [];
    for (const g of grades) {
        if (percentage >= g.min) return g;
    }
    return { grade: 'F', remark: 'Fail' };
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
            let val = row[h] ?? '';
            val = String(val).replace(/"/g, '""');
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                val = `"${val}"`;
            }
            return val;
        }).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('CSV exported successfully', 'success');
}

// Print element
function printElement(elementId, title = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title || 'Print'}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                th { background: #f0f0f0; }
                .no-print { display: none !important; }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${el.innerHTML}
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Theme management
function initTheme() {
    const settings = DB.getSettings();
    const theme = settings.theme || localStorage.getItem('school_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('school_theme', next);
    
    const settings = DB.getSettings();
    settings.theme = next;
    DB.saveSettings(settings);
    
    showToast(`Switched to ${next} mode`, 'success');
}

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    }
}

// Close sidebar on mobile when clicking a link
function initSidebar() {
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
}

// Modal helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Pagination helper
function paginate(array, page = 1, perPage = 10) {
    const total = array.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        data: array.slice(start, end),
        page,
        perPage,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

// Search filter helper
function filterData(data, searchTerm, fields = []) {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase().trim();
    return data.filter(item => {
        return fields.some(field => {
            const val = item[field];
            return val && String(val).toLowerCase().includes(term);
        });
    });
}

// Global search
function globalSearch(query) {
    if (!query || query.length < 2) return [];
    const term = query.toLowerCase();
    const results = [];
    
    // Students
    DB.getRecords(DB.keys.students).forEach(s => {
        if ([s.name, s.admissionNo, s.id, s.rollNo, s.phone, s.parentWhatsapp, s.fatherName].some(f => f && String(f).toLowerCase().includes(term))) {
            results.push({ type: 'Student', id: s.id, title: s.name, subtitle: `${s.className} - ${s.section} | ${s.admissionNo}`, data: s });
        }
    });
    
    // Teachers
    DB.getRecords(DB.keys.teachers).forEach(t => {
        if ([t.name, t.phone, t.whatsapp, t.email].some(f => f && String(f).toLowerCase().includes(term))) {
            results.push({ type: 'Teacher', id: t.id, title: t.name, subtitle: t.subjects ? t.subjects.join(', ') : '', data: t });
        }
    });
    
    // Parents
    DB.getRecords(DB.keys.parents).forEach(p => {
        if ([p.fatherName, p.motherName, p.phone, p.whatsapp].some(f => f && String(f).toLowerCase().includes(term))) {
            results.push({ type: 'Parent', id: p.id, title: p.fatherName, subtitle: p.phone, data: p });
        }
    });
    
    // Fees
    DB.getRecords(DB.keys.fees).forEach(f => {
        if ([f.receiptNo, f.studentName, f.month].some(v => v && String(v).toLowerCase().includes(term))) {
            results.push({ type: 'Fee', id: f.id, title: f.studentName, subtitle: `${f.month} | ${f.receiptNo || 'No Receipt'}`, data: f });
        }
    });
    
    return results.slice(0, 20);
}

// Dashboard stats
function getDashboardStats() {
    const students = DB.getRecords(DB.keys.students).filter(s => s.status === 'Active');
    const teachers = DB.getRecords(DB.keys.teachers).filter(t => t.status === 'Active');
    const parents = DB.getRecords(DB.keys.parents);
    const classes = DB.getRecords(DB.keys.classes);
    const today = new Date().toISOString().split('T')[0];
    const attendance = DB.getRecords(DB.keys.attendance).filter(a => a.date === today);
    const present = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const fees = DB.getRecords(DB.keys.fees);
    const pendingFees = fees.filter(f => f.remaining > 0);
    const pendingAmount = pendingFees.reduce((sum, f) => sum + f.remaining, 0);
    const todayCollection = fees.filter(f => f.paymentDate === today).reduce((sum, f) => sum + f.paid, 0);
    const admissions = DB.getRecords(DB.keys.admissions).filter(a => a.status === 'New' || a.status === 'Under Review');
    
    return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length,
        totalStaff: teachers.length + 2, // approx
        totalClasses: classes.length,
        todayPresent: present,
        todayAbsent: absent,
        pendingFees: pendingFees.length,
        pendingAmount,
        todayCollection,
        newAdmissions: admissions.length
    };
}

// Init common features
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initSidebar();
    
    // Close modals on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
});

// CSS animation keyframes injection
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(styleSheet);

window.App = {
    showToast,
    confirmDialog,
    escapeHtml,
    formatDate,
    formatCurrency,
    calculateGrade,
    exportToCSV,
    printElement,
    initTheme,
    toggleTheme,
    toggleSidebar,
    openModal,
    closeModal,
    paginate,
    filterData,
    globalSearch,
    getDashboardStats
};
