// auth.js - Authentication System

const SESSION_KEY = 'school_session';

function login(username, password) {
    const users = DB.getRecords(DB.keys.users);
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    const session = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        teacherId: user.teacherId || null,
        parentId: user.parentId || null,
        studentId: user.studentId || null,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

function getSession() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return getSession() !== null;
}

function requireAuth(allowedRoles = []) {
    const session = getSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
        // Redirect to appropriate dashboard
        redirectToDashboard(session.role);
        return null;
    }
    return session;
}

function redirectToDashboard(role) {
    switch (role) {
        case 'admin':
            window.location.href = 'admin.html';
            break;
        case 'teacher':
            window.location.href = 'teacher.html';
            break;
        case 'accountant':
            window.location.href = 'accountant.html';
            break;
        case 'parent':
            window.location.href = 'parent.html';
            break;
        case 'student':
            window.location.href = 'student.html';
            break;
        default:
            window.location.href = 'login.html';
    }
}

function getCurrentUser() {
    return getSession();
}

function hasPermission(requiredRole) {
    const session = getSession();
    if (!session) return false;
    if (session.role === 'admin') return true;
    return session.role === requiredRole;
}

// Protect page on load
function protectPage(allowedRoles = []) {
    document.addEventListener('DOMContentLoaded', function() {
        const session = requireAuth(allowedRoles);
        if (session) {
            // Update UI with user info
            const userNameEls = document.querySelectorAll('.user-name');
            userNameEls.forEach(el => el.textContent = session.name);
            
            const userRoleEls = document.querySelectorAll('.user-role');
            userRoleEls.forEach(el => el.textContent = session.role.charAt(0).toUpperCase() + session.role.slice(1));
        }
    });
}

window.Auth = {
    login,
    logout,
    getSession,
    isLoggedIn,
    requireAuth,
    redirectToDashboard,
    getCurrentUser,
    hasPermission,
    protectPage
};
