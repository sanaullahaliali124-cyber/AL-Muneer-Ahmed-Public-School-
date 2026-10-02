// fees.js - Fee Management

function getFees(filters = {}) {
    let fees = DB.getRecords(DB.keys.fees);
    if (filters.studentId) fees = fees.filter(f => f.studentId === filters.studentId);
    if (filters.className) fees = fees.filter(f => f.className === filters.className);
    if (filters.month) fees = fees.filter(f => f.month === filters.month);
    if (filters.status) fees = fees.filter(f => f.status === filters.status);
    if (filters.pending) fees = fees.filter(f => f.remaining > 0);
    return fees;
}

function calculateFeeTotal(data) {
    const total = (data.tuitionFee || 0) + (data.admissionFee || 0) + (data.examFee || 0) +
                  (data.transportFee || 0) + (data.otherFee || 0) - (data.discount || 0) + (data.fine || 0);
    return total;
}

function addFeePayment(data) {
    data.total = calculateFeeTotal(data);
    data.remaining = data.total - (data.paid || 0);
    data.status = data.remaining <= 0 ? 'Paid' : (data.paid > 0 ? 'Partial' : 'Pending');
    if (data.paid > 0 && !data.receiptNo) {
        data.receiptNo = 'RCP' + Date.now().toString().slice(-8);
    }
    if (data.paid > 0 && !data.paymentDate) {
        data.paymentDate = new Date().toISOString().split('T')[0];
    }
    
    const fee = DB.addRecord(DB.keys.fees, data);
    
    DB.addRecord(DB.keys.notifications, {
        title: 'Fee Payment',
        message: `Fee payment of ${App.formatCurrency(data.paid)} received for ${data.studentName}`,
        type: 'fee',
        read: false,
        date: new Date().toISOString()
    });
    
    return fee;
}

function updateFee(id, data) {
    data.total = calculateFeeTotal(data);
    data.remaining = data.total - (data.paid || 0);
    data.status = data.remaining <= 0 ? 'Paid' : (data.paid > 0 ? 'Partial' : 'Pending');
    return DB.updateRecord(DB.keys.fees, id, data);
}

function deleteFee(id) {
    return DB.deleteRecord(DB.keys.fees, id);
}

function getFeeDefaulters() {
    return WhatsApp.getFeeDefaulters();
}

function renderFeesTable(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let fees = getFees(options.filters || {});
    if (options.search) {
        const term = options.search.toLowerCase();
        fees = fees.filter(f =>
            [f.studentName, f.receiptNo, f.month, f.className].some(v => v && String(v).toLowerCase().includes(term))
        );
    }
    
    if (fees.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-money-bill-wave"></i><h3>No Fee Records</h3></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Student</th><th>Class</th><th>Month</th><th>Total</th>
            <th>Paid</th><th>Remaining</th><th>Status</th><th>Receipt</th><th>Actions</th>
        </tr></thead><tbody>`;
    
    fees.forEach((f, i) => {
        const statusClass = f.status === 'Paid' ? 'badge-success' : f.status === 'Partial' ? 'badge-warning' : 'badge-danger';
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(f.studentName)}</strong></td>
            <td>${App.escapeHtml(f.className)}</td>
            <td>${App.escapeHtml(f.month)}</td>
            <td>${App.formatCurrency(f.total)}</td>
            <td>${App.formatCurrency(f.paid)}</td>
            <td>${App.formatCurrency(f.remaining)}</td>
            <td><span class="badge ${statusClass}">${f.status}</span></td>
            <td>${App.escapeHtml(f.receiptNo || '-')}</td>
            <td class="actions">
                <button class="btn-icon view" onclick="viewFeeReceipt('${f.id}')" title="Receipt"><i class="fas fa-receipt"></i></button>
                <button class="btn-icon edit" onclick="editFee('${f.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="confirmDeleteFee('${f.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function renderFeeDefaultersTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const defaulters = getFeeDefaulters();
    
    if (defaulters.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-check-circle"></i><h3>No Fee Defaulters</h3><p>All fees are cleared!</p></div>`;
        return;
    }
    
    let html = `<div class="table-responsive"><table class="data-table">
        <thead><tr>
            <th>#</th><th>Student</th><th>Father</th><th>Class</th><th>Month</th>
            <th>Total</th><th>Paid</th><th>Remaining</th><th>WhatsApp</th>
        </tr></thead><tbody>`;
    
    defaulters.forEach((item, i) => {
        const s = item.student;
        const f = item.fee;
        const msg = `Assalam-o-Alaikum. This is a fee reminder from AL FIDA HUSSAIN PUBLIC SCHOOLS. Your child ${s.name} (${s.className}) has pending fee of ${App.formatCurrency(f.remaining)} for ${f.month}. Please clear the dues at the earliest. Thank you.`;
        html += `<tr>
            <td>${i + 1}</td>
            <td><strong>${App.escapeHtml(s.name)}</strong></td>
            <td>${App.escapeHtml(s.fatherName)}</td>
            <td>${App.escapeHtml(s.className)}</td>
            <td>${App.escapeHtml(f.month)}</td>
            <td>${App.formatCurrency(f.total)}</td>
            <td>${App.formatCurrency(f.paid)}</td>
            <td><strong style="color:var(--danger)">${App.formatCurrency(f.remaining)}</strong></td>
            <td>${s.parentWhatsapp ? WhatsApp.createWhatsAppButton(s.parentWhatsapp, msg, 'Remind', 'btn btn-success btn-sm') : 'N/A'}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function generateFeeReceiptHTML(feeId) {
    const fee = DB.getRecordById(DB.keys.fees, feeId);
    if (!fee) return '';
    const student = DB.getRecordById(DB.keys.students, fee.studentId);
    const settings = DB.getSettings();
    
    return `
        <div class="receipt" id="fee-receipt-print">
            <div class="receipt-header">
                <h1>${settings.schoolName}</h1>
                <p class="tagline">${settings.tagline}</p>
                <p style="font-size:0.85rem;margin-top:5px;">${settings.address} | Tel: ${settings.phone}</p>
                <h2 style="margin-top:15px;color:var(--gold-dark);">FEE RECEIPT</h2>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;">
                <div>
                    <p><strong>Receipt No:</strong> ${fee.receiptNo || 'N/A'}</p>
                    <p><strong>Date:</strong> ${App.formatDate(fee.paymentDate || fee.createdAt)}</p>
                    <p><strong>Student:</strong> ${App.escapeHtml(fee.studentName)}</p>
                    <p><strong>Father:</strong> ${App.escapeHtml(student?.fatherName || '')}</p>
                </div>
                <div>
                    <p><strong>Student ID:</strong> ${fee.studentId}</p>
                    <p><strong>Class:</strong> ${App.escapeHtml(fee.className)}</p>
                    <p><strong>Month:</strong> ${App.escapeHtml(fee.month)}</p>
                    <p><strong>Status:</strong> ${fee.status}</p>
                </div>
            </div
            <table style="width:100%;border-collapse:collapse;margin:15px 0;">
                <thead><tr style="background:#f0f0f0;">
                    <th style="border:1px solid #333;padding:8px;text-align:left;">Description</th>
                    <th style="border:1px solid #333;padding:8px;text-align:right;">Amount</th>
                </tr></thead>
                <tbody>
                    ${fee.tuitionFee ? `<tr><td style="border:1px solid #333;padding:8px;">Tuition Fee</td><td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.tuitionFee)}</td></tr>` : ''}
                    ${fee.admissionFee ? `<tr><td style="border:1px solid #333;padding:8px;">Admission Fee</td><td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.admissionFee)}</td></tr>` : ''}
                    ${fee.examFee ? `<tr><td style="border:1px solid #333;padding:8px;">Exam Fee</td><td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.examFee)}</td></tr>` : ''}
                    ${fee.transportFee ? `<tr><td style="border:1px solid #333;padding:8px;">Transport Fee</td><td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.transportFee)}</td></tr>` : ''}
                    ${fee.otherFee ? `<tr><td style="border:1px solid #333;padding:8px;">Other Fee</td><td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.otherFee)}</td></tr>` : ''}
                    ${fee.discount ? `<tr><td style="border:1px solid #333;padding:8px;">Discount</td><td style="border:1px solid #333;padding:8px;text-align:right;">-${App.formatCurrency(fee.discount)}</td></tr>` : ''}
                    ${fee.fine ? `<tr><td style="border:1px solid #333;padding:8px;">Fine</td><td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.fine)}</td></tr>` : ''}
                    <tr style="font-weight:bold;background:#f8f8f8;">
                        <td style="border:1px solid #333;padding:8px;">Total</td>
                        <td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.total)}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #333;padding:8px;">Paid</td>
                        <td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.paid)}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid #333;padding:8px;">Remaining</td>
                        <td style="border:1px solid #333;padding:8px;text-align:right;">${App.formatCurrency(fee.remaining)}</td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top:40px;display:flex;justify-content:space-between;">
                <div style="text-align:center;">
                    <div style="border-top:1px solid #333;width:150px;padding-top:5px;">Accountant</div>
                </div>
                <div style="text-align:center;">
                    <div style="border-top:1px solid #333;width:150px;padding-top:5px;">Principal</div>
                </div>
            </div>
            <p style="text-align:center;margin-top:20px;font-size:0.8rem;color:#666;">This is a computer generated receipt.</p>
        </div>`;
}

window.Fees = {
    getFees, calculateFeeTotal, addFeePayment, updateFee, deleteFee, getFeeDefaulters,
    renderFeesTable, renderFeeDefaultersTable, generateFeeReceiptHTML
};
