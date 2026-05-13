// AJAX layer for the User feature — client bundle.
// Only call handleRequest() (defined in utils/http.js).

async function loginUser(email, password) {
    return handleRequest('POST', '/user/login.php', { email, password });
}
