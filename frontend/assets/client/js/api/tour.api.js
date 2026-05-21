async function fetchTourList(categoryId) {
    return handleRequest('GET', '/tour/get_list.php', { category_id: categoryId });
}

async function fetchTourDetail(tourId) {
    return handleRequest('GET', '/tour/get_detail.php', { tour_id: tourId });
}
