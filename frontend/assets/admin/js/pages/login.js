// Page orchestrator for admin/login.html.
// Depends on: jQuery, utils/http.js (handleRequest), api/user.api.js (loginUser).

$(function () {
    const $form = $('#login-form');
    const $email = $('#email');
    const $password = $('#password');
    const $error = $('#js-login-error');
    const $submit = $form.find('button');

    $form.on('submit', async function (e) {
        e.preventDefault();
        clearError();

        const email = $email.val().trim();
        const password = $password.val().trim();

        if (!email || !password) {
            showError('Vui lòng nhập email và mật khẩu');
            return;
        }

        try {
            const data = await loginUser(email, password);
            if (!data.user || data.user.role !== 'admin') {
                showError('Bạn không có quyền truy cập');
                return;
            }
            window.location.href = 'dashboard.html';
        } catch (err) {
            const message = err.responseJSON?.message ?? 'Đăng nhập thất bại';
            showError(message);
        }
    });

    function showError(msg) {
        $error.text(msg).show();
    }

    function clearError() {
        $error.text('').hide();
    }
});
