// Page orchestrator for admin/login.html.
// Depends on: jQuery, utils/http.js (handleRequest), api/user.api.js (loginUser).

$(function () {
    const $form     = $('#login-form');
    const $email    = $('#email');
    const $password = $('#password');
    const $error    = $('#js-login-error');
    const $submit   = $form.find('button');

    redirectIfAlreadyAdmin();

    $form.on('submit', async function (e) {
        e.preventDefault();
        clearError();

        const email    = ($email.val() ?? '').toString().trim();
        const password = ($password.val() ?? '').toString();

        if (!email || !password) {
            showError('Vui lòng nhập email và mật khẩu');
            return;
        }

        $submit.prop('disabled', true);
        try {
            const data = await loginUser(email, password);
            if (!data.user || data.user.role !== 'admin') {
                showError('Bạn không có quyền truy cập');
                return;
            }
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } catch (err) {
            const message = err.responseJSON?.message ?? 'Đăng nhập thất bại';
            console.error('FE-AUTH-001', err);
            showError(message);
        } finally {
            $submit.prop('disabled', false);
        }
    });

    function showError(msg) {
        $error.text(msg).show();
    }

    function clearError() {
        $error.text('').hide();
    }

    function redirectIfAlreadyAdmin() {
        try {
            const raw = sessionStorage.getItem('currentUser');
            if (!raw) return;
            const user = JSON.parse(raw);
            if (user && user.role === 'admin') {
                window.location.href = 'dashboard.html';
            }
        } catch (_) {
            sessionStorage.removeItem('currentUser');
        }
    }
});
