(function () {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const links = document.querySelectorAll('.sider .inner-menu .inner-item a');

    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href !== '#' && href.split('/').pop() === currentPage) {
            link.classList.add('active');
        }
    });
})();
