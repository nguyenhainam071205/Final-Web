async function initTourList(selector) {
    const container = document.querySelector(selector);

    const categoryId = parseInt(container.dataset.categoryId);

    const result = await fetchTourList(categoryId);
    const tours = result.tours;

    if (tours.length === 0) {
        $(selector).html(
            '<p class="tour-list-empty">Hiện chưa có tour nào.</p>'
        );
        return;
    }

    renderTourCards(tours, selector);
}

$(function () {
    initTourList('#js-tour-list');
    initTourList('#js-tour-ngoai-list');
});
