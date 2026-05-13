// AJAX layer for the User feature — admin bundle.
// Only call handleRequest() (defined in utils/http.js).

async function loginUser(email, password) {
    return handleRequest('POST', '/user/login.php', { email, password });
}
