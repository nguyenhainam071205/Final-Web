// Admin session guard. Including this script on a page enforces admin auth:
// any non-admin visitor is sent to login.html before page content renders.

const SESSION_KEY = 'currentUser';

function getAdminSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
}

function isAdmin() {
    const user = getAdminSession();
    return !!(user && user.role === 'admin');
}

function requireAdmin() {
    if (isAdmin()) return;
    const back = window.location.pathname.split('/').pop() || 'dashboard.html';
    window.location.replace('login.html?next=' + encodeURIComponent(back));
}

requireAdmin();
