// Page orchestrator for client/login.html.
// Depends on: jQuery, utils/http.js, utils/auth.js, api/user.api.js.

$(function () {
    if (isLoggedIn()) {
        const next = new URLSearchParams(location.search).get('next') || 'index.html';
        window.location.href = next;
        return;
    }

    const $form     = $('#login-form');
    const $email    = $('#email');
    const $password = $('#password');
    const $error    = $('#js-login-error');
    const $submit   = $form.find('button');

    $form.on('submit', async function (e) {
        e.preventDefault();
        $error.text('');

        const email    = ($email.val() ?? '').toString().trim();
        const password = ($password.val() ?? '').toString();

        $submit.prop('disabled', true);
        try {
            const data = await loginUser(email, password);
            setSession(data.user);
            const next = new URLSearchParams(location.search).get('next') || 'index.html';
            window.location.href = next;
        } catch (err) {
            const message = err.responseJSON?.message ?? 'Đăng nhập thất bại';
            console.error('FE-AUTH-001', err);
            $error.text(message);
        } finally {
            $submit.prop('disabled', false);
        }
    });
});
