// reports.js

function generateReport(type) {
    switch (type) {
        case 'students':
            Students.exportStudentsCSV();
            break;
        case 'teachers':
            const teachers = Teachers.getTeachers().map(t => ({
                Name: t.name, Phone: t.phone, Email: t.email,
                Qualification: t.qualification, Experience: t.experience,
                Subjects: (t.subjects || []).join(', '), Salary: t.salary, Status: t.status
            }));
            App.exportToCSV(teachers, 'teachers_report.csv');
            break;
        case 'parents':
            const parents = Parents.getParents().map(p => ({
                Father: p.fatherName, Mother: p.motherName, Phone: p.phone,
                WhatsApp: p.whatsapp, Email: p.email, Address: p.address,
                Children: (p.children || []).length
            }));
            App.exportToCSV(parents, 'parents_report.csv');
            break;
        case 'fees':
            const fees = Fees.getFees().map(f => ({
                Student: f.studentName, Class: f.className, Month: f.month,
                Total: f.total, Paid: f.paid, Remaining: f.remaining,
                Status: f.status, Receipt: f.receiptNo
            }));
            App.exportToCSV(fees, 'fees_report.csv');
            break;
        case 'defaulters':
            const def = Fees.getFeeDefaulters().map(d => ({
                Student: d.student.name, Father: d.student.fatherName,
                Class: d.student.className, Month: d.fee.month,
                Remaining: d.fee.remaining, WhatsApp: d.student.parentWhatsapp
            }));
            App.exportToCSV(def, 'fee_defaulters.csv');
            break;
        case 'attendance':
            const att = Attendance.getAttendance().map(a => {
                const s = Students.getStudentById(a.studentId);
                return {
                    Date: a.date, Student: s?.name || a.studentId,
                    Class: a.className, Section: a.section, Status: a.status
                };
            });
            App.exportToCSV(att, 'attendance_report.csv');
            break;
        case 'whatsapp':
            const contacts = Students.getStudents().filter(s => s.parentWhatsapp).map(s => ({
                Student: s.name, Father: s.fatherName, Class: s.className,
                Section: s.section, WhatsApp: s.parentWhatsapp, Status: s.status
            }));
            App.exportToCSV(contacts, 'whatsapp_contacts.csv');
            break;
        case 'results':
            const results = Results.getResults().map(r => ({
                Student: r.studentName, Exam: r.examName, Subject: r.subject,
                Total: r.totalMarks, Obtained: r.obtainedMarks,
                Percentage: r.percentage, Grade: r.grade, Status: r.status
            }));
            App.exportToCSV(results, 'results_report.csv');
            break;
        case 'admissions':
            const adms = Admissions.getAdmissions().map(a => ({
                Student: a.studentName, Father: a.fatherName, Class: a.className,
                Phone: a.phone, Status: a.status, Applied: a.appliedDate
            }));
            App.exportToCSV(adms, 'admissions_report.csv');
            break;
        default:
            App.showToast('Unknown report type', 'error');
    }
}

window.Reports = { generateReport };
