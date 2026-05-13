// Tour list orchestrator — handles any section with a [data-category-id] container.
// Called for Section 4 (Tour Trong Nước) and Section 6 (Tour Nước Ngoài).

async function initTourList(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const categoryId = parseInt(container.dataset.categoryId);

    const result = await fetchTourList(categoryId);
    const tours = result.tours ?? [];

    if (tours.length === 0) {
        $(selector).html(
            '<p class="tour-list-empty">Hiện chưa có tour nào.</p>'
        );
        return;
    }

    renderTourCards(tours, selector);
}

$(function () {
    initTourList('#js-tour-list');        // Section 4 — Tour Trong Nước
    initTourList('#js-tour-ngoai-list');  // Section 6 — Tour Nước Ngoài
});
