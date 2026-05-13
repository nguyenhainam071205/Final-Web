// AJAX layer for Tour feature — no DOM access, no UI state.

/**
 * Fetches available tours, optionally filtered by category.
 * @param {number} [categoryId=0]  — 0 means no filter (all available tours)
 * @returns {Promise<{tours: Object[]}>}
 */
async function fetchTourList(categoryId = 0) {
    return handleRequest('GET', '/tour/get_list.php', { category_id: categoryId });
}

/**
 * Fetches a single tour with its images and category name.
 * @param {number} tourId
 * @returns {Promise<{tour: Object}>}
 */
async function fetchTourDetail(tourId) {
    return handleRequest('GET', '/tour/get_detail.php', { tour_id: tourId });
}
