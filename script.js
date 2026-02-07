/**
 * Smart Attendance & Performance Tracker
 * Core Logic (Vanilla JS)
 */

// --- State Management ---
// We'll use LocalStorage to persist data so it survives reloads.
const AppState = {
    students: JSON.parse(localStorage.getItem('students')) || [],
    attendanceLogs: JSON.parse(localStorage.getItem('attendanceLogs')) || [],
    performanceLogs: JSON.parse(localStorage.getItem('performanceLogs')) || [],

    save() {
        localStorage.setItem('students', JSON.stringify(this.students));
        localStorage.setItem('attendanceLogs', JSON.stringify(this.attendanceLogs));
        localStorage.setItem('performanceLogs', JSON.stringify(this.performanceLogs));
        updateDashboard();
        updateStudentList();
        updateDropdowns();
    },

    addStudent(student) {
        this.students.push(student);
        this.save();
        logActivity(`Added new student: ${student.name} (${student.rollNo})`);
    },

    markAttendance(rollNo, status) {
        // Find existing record for today or add new
        const today = new Date().toISOString().split('T')[0];
        const record = {
            id: Date.now(),
            rollNo,
            date: today,
            status // 'Present', 'Absent'
        };
        this.attendanceLogs.push(record);
        this.save();
        logActivity(`Marked ${status} for ${getStudentName(rollNo)}`);
    },

    addMarks(rollNo, subject, score) {
        const record = {
            id: Date.now(),
            rollNo,
            subject,
            score: parseInt(score),
            date: new Date().toISOString()
        };
        this.performanceLogs.push(record);
        this.save();
        logActivity(`Added marks for ${getStudentName(rollNo)} in ${subject}`);
    },
    
    // Helper to calculate statistics
    getStats() {
        const totalStudents = this.students.length;
        if (totalStudents === 0) return { attendance: 0, performance: 0, risk: 0 };

        // Attendance %
        let totalClasses = 0;
        let totalPresent = 0;
        // Group by student to check warnings
        const studentAttendance = {};

        this.attendanceLogs.forEach(log => {
            if (!studentAttendance[log.rollNo]) studentAttendance[log.rollNo] = { present: 0, total: 0 };
            studentAttendance[log.rollNo].total++;
            if (log.status === 'Present') {
                studentAttendance[log.rollNo].present++;
                totalPresent++;
            }
            totalClasses++;
        });

        const avgAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

        // Count students at risk (< 75% attendance)
        let atRiskCount = 0;
        this.students.forEach(s => {
            const stats = studentAttendance[s.rollNo];
            if (stats && stats.total > 0) {
                const pct = (stats.present / stats.total) * 100;
                if (pct < 75) atRiskCount++;
            }
        });

        // Performance Avg
        let totalScore = 0;
        this.performanceLogs.forEach(log => totalScore += log.score);
        const avgPerformance = this.performanceLogs.length > 0 ? Math.round(totalScore / this.performanceLogs.length) : 0;

        return {
            totalStudents,
            avgAttendance,
            avgPerformance,
            atRiskCount
        };
    }
};

// --- AI Tools Logic ---

/**
 * AI VALIDATION TOOL
 * Generates regex validation for inputs
 */
function validateRollNo(rollNo) {
    // Check for alphanumeric format (e.g., 101, A101)
    const regex = /^[A-Z0-9]{1,10}$/i;
    return regex.test(rollNo);
}

/**
 * AI PERFORMANCE REMARK TOOL
 * Generates contextual remarks based on score
 */
function generateAIRemark(score) {
    if (score >= 90) return { grade: 'O', remark: "Outstanding performance! Consistent excellence." };
    if (score >= 80) return { grade: 'A+', remark: "Excellent work. Keep maintaining this standard." };
    if (score >= 70) return { grade: 'A', remark: "Good performance, but there is room for optimization." };
    if (score >= 60) return { grade: 'B', remark: "Above average. Needs more focus on core concepts." };
    if (score >= 50) return { grade: 'C', remark: "Average. Requires consistent practice to improve." };
    return { grade: 'F', remark: "Critical: Needs Improvement. Recommend remedial sessions." };
}

// --- DOM Elements & Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    updateDashboard();
    updateStudentList();
    updateDropdowns();

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
             // Remove active class from all
             navItems.forEach(n => n.classList.remove('active'));
             views.forEach(v => v.classList.remove('active'));
             
             // Activate clicked
             item.classList.add('active');
             const tabId = item.getAttribute('data-tab');
             document.getElementById(`view-${tabId}`).classList.add('active');
             
             // Update Header
             pageTitle.textContent = item.innerHTML.split('>')[1].trim(); // Get text after icon
        });
    });

    // Modal Handling
    const modal = document.getElementById('modal-add-student');
    const addBtn = document.getElementById('add-student-btn');
    const closeBtns = document.querySelectorAll('.close-modal');

    addBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('active')));

    // Form: Add Student
    document.getElementById('add-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const rollNo = document.getElementById('roll-no').value;
        const name = document.getElementById('student-name').value;
        const semester = document.getElementById('semester').value;

        // Validation
        if (!validateRollNo(rollNo)) {
            document.getElementById('roll-no-msg').textContent = "Invalid format. Use alphanumeric only.";
            return;
        }
        if (AppState.students.some(s => s.rollNo === rollNo)) {
            document.getElementById('roll-no-msg').textContent = "Roll No already exists.";
            return;
        }

        // Success
        AppState.addStudent({ rollNo, name, semester });
        document.getElementById('add-student-form').reset();
        modal.classList.remove('active');
        alert("Student added successfully!");
    });

    // Form: Attendance
    document.getElementById('attendance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const rollNo = document.getElementById('attendance-student-select').value;
        if (!rollNo) return;
        
        const status = document.querySelector('input[name="status"]:checked').value;
        AppState.markAttendance(rollNo, status);
        alert("Attendance marked!");
    });

    // Form: Marks & AI Analysis
    document.getElementById('marks-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const rollNo = document.getElementById('marks-student-select').value;
        const subject = document.getElementById('subject-input').value;
        const score = parseInt(document.getElementById('marks-input').value);

        if (!rollNo) return;

        AppState.addMarks(rollNo, subject, score);

        // Show AI Analysis
        const student = AppState.students.find(s => s.rollNo === rollNo);
        const insight = generateAIRemark(score);
        
        document.getElementById('analysis-student-name').textContent = student.name;
        document.getElementById('analysis-score').textContent = `Score: ${score}/100`;
        document.getElementById('analysis-grade').textContent = `Grade: ${insight.grade}`;
        document.getElementById('analysis-remark').textContent = insight.remark;
        document.getElementById('ai-analysis-result').classList.remove('hidden');
    });

    // Real-time Validation Feedback
    document.getElementById('roll-no').addEventListener('input', (e) => {
        const msg = document.getElementById('roll-no-msg');
        if (!validateRollNo(e.target.value)) {
            msg.textContent = "Invalid characters";
        } else {
            msg.textContent = "";
        }
    });
});

// --- UI Helpers ---

function updateDashboard() {
    const stats = AppState.getStats();
    document.getElementById('total-students').textContent = stats.totalStudents;
    document.getElementById('avg-attendance').textContent = stats.avgAttendance + '%';
    document.getElementById('avg-performance').textContent = stats.avgPerformance;
    document.getElementById('students-at-risk').textContent = stats.atRiskCount;
}

function updateStudentList() {
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';

    if (AppState.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No students found. Add one to get started.</td></tr>';
        return;
    }

    AppState.students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${student.rollNo}</td>
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div class="avatar" style="width:30px; height:30px; font-size:0.8rem;">${student.name.charAt(0)}</div>
                    ${student.name}
                </div>
            </td>
            <td>Sem ${student.semester}</td>
            <td>
                <button class="action-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateDropdowns() {
    const dropdowns = [
        document.getElementById('attendance-student-select'),
        document.getElementById('marks-student-select')
    ];

    dropdowns.forEach(select => {
        select.innerHTML = '<option value="">-- Select Student --</option>';
        AppState.students.forEach(s => {
            const option = document.createElement('option');
            option.value = s.rollNo;
            option.textContent = `${s.name} (${s.rollNo})`;
            select.appendChild(option);
        });
    });
}

function getStudentName(rollNo) {
    const s = AppState.students.find(s => s.rollNo === rollNo);
    return s ? s.name : rollNo;
}

function logActivity(text) {
    const list = document.getElementById('activity-log');
    const today = new Date().toLocaleTimeString();
    
    // Create new item
    const li = document.createElement('li');
    li.style.padding = '0.75rem';
    li.style.borderBottom = '1px solid var(--border)';
    li.style.display = 'flex';
    li.style.gap = '0.5rem';
    li.style.fontSize = '0.9rem';
    li.innerHTML = `<span style="color:var(--text-muted); font-size:0.8rem;">${today}</span> <span>${text}</span>`;
    
    // Add to top
    if (list.querySelector('.empty-state')) list.innerHTML = '';
    list.prepend(li);
}
