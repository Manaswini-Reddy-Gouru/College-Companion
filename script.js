// College Companion App - Main JavaScript File

// Global variables
let assignments = [];
let subjects = [];
let notices = [];
let classes = []; // New array to store timetable classes
let currentTab = 'timetable';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadData();
    setupEventListeners();
    startNotificationSystem();
    displayTimetable(); // Display initial timetable
});

// Initialize the app
function initializeApp() {
    // Set default data if none exists
    
    // Show current time in timetable
    updateCurrentTime();
    
    // Check for upcoming classes
    checkUpcomingClasses();
    
    // Check for assignment deadlines
    checkAssignmentDeadlines();
}

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Form submissions
    document.getElementById('timetableForm').addEventListener('submit', handleTimetableSubmit);
    document.getElementById('assignmentForm').addEventListener('submit', handleAssignmentSubmit);
    document.getElementById('attendanceForm').addEventListener('submit', handleAttendanceSubmit);
    document.getElementById('noticeForm').addEventListener('submit', handleNoticeSubmit);

    // Modal close events
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openNoticeModal();
        }
        if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            openAssignmentModal();
        }
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            openTimetableModal();
        }
    });
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked nav button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    currentTab = tabName;
    
    // Refresh data for the current tab
    refreshTabData(tabName);
}

// Refresh data for specific tab
function refreshTabData(tabName) {
    switch(tabName) {
        case 'timetable':
            displayTimetable();
            break;
        case 'assignments':
            displayAssignments();
            break;
        case 'attendance':
            displaySubjects();
            updateOverallAttendance();
            break;
        case 'notices':
            displayNotices();
            break;
    }
}

// Modal functions
function openTimetableModal() {
    document.getElementById('timetableModal').style.display = 'block';
    document.getElementById('timetableForm').reset();
    
    // Set default time to current time
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').value = currentTime;
}

function closeTimetableModal() {
    document.getElementById('timetableModal').style.display = 'none';
}

function openAssignmentModal() {
    document.getElementById('assignmentModal').style.display = 'block';
    document.getElementById('assignmentForm').reset();
    
    // Set minimum date to today
    const today = new Date().toISOString().slice(0, 16);
    document.getElementById('dueDate').min = today;
}

function closeAssignmentModal() {
    document.getElementById('assignmentModal').style.display = 'none';
}

function openAttendanceModal() {
    document.getElementById('attendanceModal').style.display = 'block';
    document.getElementById('attendanceForm').reset();
}

function closeAttendanceModal() {
    document.getElementById('attendanceModal').style.display = 'none';
}

function openNoticeModal() {
    document.getElementById('noticeModal').style.display = 'block';
    document.getElementById('noticeForm').reset();
}

function closeNoticeModal() {
    document.getElementById('noticeModal').style.display = 'none';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

// Form submission handlers
function handleTimetableSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Fix the time format to match HTML data attributes
    let timeValue = formData.get('time');
    
    // Convert time to proper format (HH:MM)
    if (timeValue) {
        const [hours, minutes] = timeValue.split(':');
        timeValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    const classData = {
        id: Date.now(),
        subject: formData.get('subjectName'),
        day: formData.get('day'),
        time: timeValue,  // ← Now properly formatted
        room: formData.get('room'),
        professor: formData.get('professor')
    };

    console.log('Adding new class:', classData); // Debug log

    // Add to classes array
    classes.push(classData);
    console.log('Classes array after adding:', classes); // Debug log
    
    saveData();
    displayTimetable();
    
    closeTimetableModal();
    showNotification('Class added successfully!', 'success');
}

    
function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const assignment = {
        id: Date.now(),
        title: formData.get('assignmentTitle'),
        subject: formData.get('subject'),
        dueDate: formData.get('dueDate'),
        description: formData.get('description'),
        completed: false,
        createdAt: new Date().toISOString()
    };

    assignments.push(assignment);
    saveData();
    displayAssignments();
    
    closeAssignmentModal();
    showNotification('Assignment added successfully!', 'success');
    
    // Set reminder for assignment
    setAssignmentReminder(assignment);
}

function handleAttendanceSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const subject = {
        id: Date.now(),
        name: formData.get('subjectName'),
        totalClasses: parseInt(formData.get('totalClasses')),
        presentDays: 0,
        absentDays: 0
    };

    subjects.push(subject);
    saveData();
    displaySubjects();
    updateOverallAttendance();
    
    closeAttendanceModal();
    showNotification('Subject added successfully!', 'success');
}

function handleNoticeSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const notice = {
        id: Date.now(),
        title: formData.get('noticeTitle'),
        content: formData.get('noticeContent'),
        priority: formData.get('priority'),
        createdAt: new Date().toISOString()
    };

    notices.push(notice);
    saveData();
    displayNotices();
    
    closeNoticeModal();
    showNotification('Notice added successfully!', 'success');
}

// script.js (fixed with per-student storage)

// Helper: generate storage key per user
function getStorageKey() {
  const currentUser = localStorage.getItem("currentUser");
  return `collegeCompanionData_${currentUser}`;
}

// Load data for the logged-in user
function loadData() {
  const data = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
  assignments = data.assignments || [];
  subjects = data.subjects || [];
  notices = data.notices || [];
  classes = data.classes || [];

  displayAssignments();
  displaySubjects();
  displayNotices();
  updateOverallAttendance();
}

// Save data for the logged-in user
function saveData() {
  const data = {
    assignments,
    subjects,
    notices,
    classes
  };
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

// Ensure redirect if not logged in
window.onload = () => {
  if (!localStorage.getItem("currentUser")) {
    window.location.href = "login.html";
  } else {
    loadData();
  }
};




// Display functions
function displayTimetable() {
    console.log('=== TIMETABLE DEBUG ===');
    console.log('Total classes to display:', classes.length);
    console.log('Classes data:', classes);
    // Clear all class slots first
     const allClassSlots = document.querySelectorAll('.class-slot');
    console.log('Found class slots:', allClassSlots.length);
    allClassSlots.forEach(slot => {
        slot.innerHTML = '';
        slot.classList.remove('has-class');
        slot.classList.add('empty');
        slot.innerHTML = '<span>Click to add class</span>';
    });

    // Display classes in their respective slots
    classes.forEach(classItem => {
        const slot = document.querySelector(`[data-day="${classItem.day}"][data-time="${classItem.time}"]`);
        if (slot) {
            slot.classList.remove('empty');
            slot.classList.add('has-class');
            slot.innerHTML = `
                <div class="class-info">
                    <h4>${classItem.subject}</h4>
                    <p>${classItem.room}</p>
                    <p>${classItem.professor}</p>
                </div>
            `;
            
            // Add click event to edit/delete class
            slot.onclick = () => editClass(classItem);
        }
    });
}

function displayAssignments() {
    const container = document.getElementById('assignmentsList');
    
    if (assignments.length === 0) {
        container.innerHTML = '<div class="empty-state">No assignments yet. Add your first assignment!</div>';
        return;
    }

    // Sort assignments by due date
    const sortedAssignments = [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    container.innerHTML = sortedAssignments.map(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const timeLeft = dueDate - now;
        const isUrgent = timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
        const isOverdue = timeLeft < 0;
        
        const urgencyClass = isOverdue ? 'urgent' : (isUrgent ? 'urgent' : '');
        const statusText = isOverdue ? 'OVERDUE' : formatTimeLeft(timeLeft);
        
        return `
            <div class="assignment-card ${urgencyClass}">
                <div class="assignment-header">
                    <div>
                        <div class="assignment-title">${assignment.title}</div>
                        <div class="assignment-subject">${assignment.subject}</div>
                    </div>
                    <div class="assignment-due">${statusText}</div>
                </div>
                <div class="assignment-description">${assignment.description}</div>
                <div style="margin-top: 15px;">
                    <button onclick="toggleAssignmentComplete(${assignment.id})" class="att-btn ${assignment.completed ? 'absent' : 'present'}">
                        ${assignment.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <button onclick="deleteAssignment(${assignment.id})" class="att-btn absent" style="margin-left: 10px;">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function displaySubjects() {
    const container = document.getElementById('subjectsList');
    
    if (subjects.length === 0) {
        container.innerHTML = '<div class="empty-state">No subjects yet. Add your first subject!</div>';
        return;
    }

    container.innerHTML = subjects.map(subject => {
        const attendancePercentage = Math.round((subject.presentDays / subject.totalClasses) * 100);
        
        return `
            <div class="subject-card">
                <div class="subject-header">
                    <div class="subject-name">${subject.name}</div>
                    <div class="attendance-buttons">
                        <button onclick="markAttendance(${subject.id}, 'present')" class="att-btn present">Present</button>
                        <button onclick="markAttendance(${subject.id}, 'absent')" class="att-btn absent">Absent</button>
                    </div>
                </div>
                <div class="attendance-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${attendancePercentage}%"></div>
                    </div>
                    <div class="attendance-count">
                        <span>Present: ${subject.presentDays}</span>
                        <span>Absent: ${subject.absentDays}</span>
                        <span>Total: ${subject.totalClasses}</span>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <button onclick="deleteSubject(${subject.id})" class="att-btn absent">
                        Delete Subject
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function displayNotices() {
    const container = document.getElementById('noticesList');
    
    if (notices.length === 0) {
        container.innerHTML = '<div class="empty-state">No notices yet. Add your first notice!</div>';
        return;
    }

    // Sort notices by creation date (newest first)
    const sortedNotices = [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = sortedNotices.map(notice => {
        const date = new Date(notice.createdAt).toLocaleDateString();
        
        return `
            <div class="notice-card ${notice.priority}-priority">
                <div class="notice-header">
                    <div class="notice-title">${notice.title}</div>
                    <div class="priority-badge ${notice.priority}">${notice.priority}</div>
                </div>
                <div class="notice-content">${notice.content}</div>
                <div class="notice-date">Posted on: ${date}</div>
                <div style="margin-top: 15px;">
                    <button onclick="deleteNotice(${notice.id})" class="att-btn absent">
                        Delete Notice
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Utility functions
function formatTimeLeft(timeLeft) {
    if (timeLeft < 0) return 'OVERDUE';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
}

function updateOverallAttendance() {
    if (subjects.length === 0) {
        document.getElementById('overallAttendance').textContent = '0%';
        document.getElementById('presentDays').textContent = '0';
        document.getElementById('absentDays').textContent = '0';
        return;
    }

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalClasses = 0;

    subjects.forEach(subject => {
        totalPresent += subject.presentDays;
        totalAbsent += subject.absentDays;
        totalClasses += subject.totalClasses;
    });

    const percentage = Math.round((totalPresent / totalClasses) * 100);
    
    document.getElementById('overallAttendance').textContent = `${percentage}%`;
    document.getElementById('presentDays').textContent = totalPresent;
    document.getElementById('absentDays').textContent = totalAbsent;
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Update current time display (you can add this to the UI)
    console.log(`Current time: ${timeString}`);
}

// Action functions
function editClass(classItem) {
    if (confirm(`Do you want to delete the class "${classItem.subject}"?`)) {
        classes = classes.filter(c => c.id !== classItem.id);
        saveData();
        displayTimetable();
        showNotification('Class deleted successfully!', 'success');
    }
}

function toggleAssignmentComplete(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
        assignment.completed = !assignment.completed;
        saveData();
        displayAssignments();
        
        const status = assignment.completed ? 'completed' : 'marked incomplete';
        showNotification(`Assignment ${status}!`, 'success');
    }
}

function deleteAssignment(assignmentId) {
    if (confirm('Are you sure you want to delete this assignment?')) {
        assignments = assignments.filter(a => a.id !== assignmentId);
        saveData();
        displayAssignments();
        showNotification('Assignment deleted successfully!', 'success');
    }
}

function markAttendance(subjectId, status) {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
        if (status === 'present') {
            subject.presentDays++;
        } else {
            subject.absentDays++;
        }
        subject.totalClasses++;
        
        saveData();
        displaySubjects();
        updateOverallAttendance();
        
        showNotification(`Marked ${status} for ${subject.name}`, 'success');
    }
}

function deleteSubject(subjectId) {
    if (confirm('Are you sure you want to delete this subject?')) {
        subjects = subjects.filter(s => s.id !== subjectId);
        saveData();
        displaySubjects();
        updateOverallAttendance();
        showNotification('Subject deleted successfully!', 'success');
    }
}

function deleteNotice(noticeId) {
    if (confirm('Are you sure you want to delete this notice?')) {
        notices = notices.filter(n => n.id !== noticeId);
        saveData();
        displayNotices();
        showNotification('Notice deleted successfully!', 'success');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Reminder system
function startNotificationSystem() {
    // Check for reminders every minute
    setInterval(() => {
        checkUpcomingClasses();
        checkAssignmentDeadlines();
    }, 60000);
}

function checkUpcomingClasses() {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Check if there are classes in the next 15 minutes
    if (currentDay >= 1 && currentDay <= 6) { // Monday to Saturday
        const dayNames = ['', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = dayNames[currentDay];
        
        classes.forEach(classItem => {
            if (classItem.day === currentDayName) {
                const [hours, minutes] = classItem.time.split(':').map(Number);
                const classTime = hours * 60 + minutes;
                const timeUntilClass = classTime - currentTime;
                
                if (timeUntilClass > 0 && timeUntilClass <= 15) {
                    showNotification(`⏰ Class "${classItem.subject}" starts in ${timeUntilClass} minutes!`, 'warning');
                }
            }
        });
    }
}

function checkAssignmentDeadlines() {
    const now = new Date();
    
    assignments.forEach(assignment => {
        if (assignment.completed) return;
        
        const dueDate = new Date(assignment.dueDate);
        const timeLeft = dueDate - now;
        
        // Notify if due in next 24 hours
        if (timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000) {
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            showNotification(`⚠️ "${assignment.title}" is due in ${hoursLeft} hours!`, 'warning');
        }
        
        // Notify if overdue
        if (timeLeft < 0) {
            showNotification(`🚨 "${assignment.title}" is OVERDUE!`, 'error');
        }
    });
}

function setAssignmentReminder(assignment) {
    const dueDate = new Date(assignment.dueDate);
    const reminderTime = dueDate.getTime() - (24 * 60 * 60 * 1000); // 24 hours before
    
    if (reminderTime > Date.now()) {
        setTimeout(() => {
            showNotification(`⏰ Reminder: "${assignment.title}" is due tomorrow!`, 'warning');
        }, reminderTime - Date.now());
    }
}

function debugTimeSlots() {
    console.log('=== TIME SLOTS DEBUG ===');
    const allSlots = document.querySelectorAll('.class-slot');
    
    allSlots.forEach((slot, index) => {
        const day = slot.getAttribute('data-day');
        const time = slot.getAttribute('data-time');
        console.log(`Slot ${index}: Day=${day}, Time=${time}`);
    });
}


// Add some CSS for empty states
const style = document.createElement('style');
style.textContent = `
    .empty-state {
        text-align: center;
        padding: 40px;
        color: #718096;
        font-size: 1.1rem;
        background: #f7fafc;
        border-radius: 15px;
        border: 2px dashed #e2e8f0;
    }
`;
document.head.appendChild(style);
