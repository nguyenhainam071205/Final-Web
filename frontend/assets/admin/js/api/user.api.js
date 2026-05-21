async function loginUser(email, password) {
    return handleRequest('POST', '/user/login.php', { email, password });
}
