// Tour list orchestrator — handles any section with a [data-category-id] container.
// Called for Section 4 (Tour Trong Nước) and Section 6 (Tour Nước Ngoài).

function setLoading(selector, isLoading) {
    if (isLoading) {
        $(selector)
            .addClass('is-loading')
            .html('<div class="tour-list-skeleton">Đang tải...</div>');
    } else {
        $(selector).removeClass('is-loading');
    }
}

async function initTourList(selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    const categoryId = parseInt(container.dataset.categoryId ?? '0', 10) || 0;

    setLoading(selector, true);

    try {
        const result = await fetchTourList(categoryId);
        const tours  = result.tours ?? [];

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
    } finally {
        setLoading(selector, false);
    }
}

$(function () {
    initTourList('#js-tour-list');        // Section 4 — Tour Trong Nước
    initTourList('#js-tour-ngoai-list');  // Section 6 — Tour Nước Ngoài
});
