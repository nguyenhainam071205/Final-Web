// Session helpers for the client bundle.
// Session payload is set by pages/login.js after a successful loginUser() call.

const SESSION_KEY = 'currentUser';

function getSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
}

function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
    return getSession() !== null;
}

function redirectIfNotLoggedIn(next) {
    if (!isLoggedIn()) {
        const back = next || (window.location.pathname.split('/').pop() || 'index.html');
        window.location.href = 'login.html?next=' + encodeURIComponent(back);
    }
}
