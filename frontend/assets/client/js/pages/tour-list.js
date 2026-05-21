async function initTourList(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const categoryId = parseInt(container.dataset.categoryId);

    try {
        const result = await fetchTourList(categoryId);
        const tours = result.tours;

        if (tours.length === 0) {
            $(selector).html(
                '<p class="tour-list-empty">Hiện chưa có tour nào.</p>'
            );
            return;
        }

        renderTourCards(tours, selector);
    } catch (err) {
        console.error('FE-TOUR-001', err);
        $(selector).html(
            '<p class="tour-list-empty">Không thể tải danh sách tour. Vui lòng thử lại.</p>'
        );
    }
}

$(function () {
    initTourList('#js-tour-list');
    initTourList('#js-tour-ngoai-list');
});
