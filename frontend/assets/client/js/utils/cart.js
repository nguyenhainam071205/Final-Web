// localStorage-backed cart. Stores [{ TourID, quantity }, ...].

const CART_STORAGE_KEY = 'cart';

function getCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('FE-CART-001', err);
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    updateCartBadge();
}

function addToCart(tourId, quantity) {
    const id  = parseInt(tourId, 10);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    if (!id) return;

    const items = getCart();
    const existing = items.find(it => it.TourID === id);
    if (existing) {
        existing.quantity += qty;
    } else {
        items.push({ TourID: id, quantity: qty });
    }
    saveCart(items);
}

function updateCartQuantity(tourId, quantity) {
    const id  = parseInt(tourId, 10);
    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    const items = getCart()
        .map(it => it.TourID === id ? { ...it, quantity: qty } : it)
        .filter(it => it.quantity > 0);
    saveCart(items);
}

function removeFromCart(tourId) {
    const id = parseInt(tourId, 10);
    saveCart(getCart().filter(it => it.TourID !== id));
}

function getCartCount() {
    return getCart().reduce((sum, it) => sum + it.quantity, 0);
}

function updateCartBadge() {
    const count = getCartCount();
    $('.inner-cart a span').text(count);
}

$(function () {
    updateCartBadge();
});
