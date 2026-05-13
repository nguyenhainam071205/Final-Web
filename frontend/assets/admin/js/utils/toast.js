function showToast(message, type) {
    type = type || 'info';
    const containerId = 'js-toast-container';
    let $container = $('#' + containerId);
    if (!$container.length) {
        $container = $('<div>').attr('id', containerId).appendTo('body');
    }

    const $toast = $('<div>')
        .addClass('toast toast-' + type)
        .text(message);

    $container.append($toast);
    setTimeout(() => $toast.fadeOut(200, () => $toast.remove()), 3000);
}
