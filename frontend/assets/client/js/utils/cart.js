// localStorage-backed cart. Stores [{ TourID, quantity }, ...].

function getCart() {
    const raw = localStorage.getItem('cart');
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed;
}

function saveCart(items) {
    localStorage.setItem('cart', JSON.stringify(items));
}

function addToCart(tourId, quantity) {
    const id = parseInt(tourId);
    const qty = parseInt(quantity)

    const items = getCart();
    const existing = items.find(it => it.TourID === id);
    if (existing) {
        existing.quantity += qty;
    } else {
        items.push({ TourID: id, quantity: qty });
    }
    saveCart(items);
}

