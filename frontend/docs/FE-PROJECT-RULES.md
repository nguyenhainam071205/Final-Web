# PROJECT-RULES.md — Frontend (Vanilla JS + jQuery, MPA)

## Tech Stack
- **Markup:** HTML5
- **Style:** CSS3 (plain, no preprocessor)
- **Logic:** Vanilla JS (ES6+) + jQuery
- **Pattern:** Multi-Page Application — each page is a standalone `.html` / `.php` file

---

## 1. Layer Structure

The frontend is split by audience: `client/` (public) and `admin/` (back-office).
Each audience has its own asset bundle under `assets/<audience>/`.

```
frontend/
├── client/                     # Public-facing HTML entry points
│   ├── index.html              # Homepage / tour listing
│   ├── tour-detail.html        # Single tour page
│   └── cart.html               # Cart + checkout
│
├── admin/                      # Admin-only HTML entry points
│   ├── login.html
│   ├── dashboard.html
│   ├── order-management.html
│   └── order-changing.html
│
├── assets/
│   ├── client/                 # Assets used by client/*.html
│   │   ├── css/
│   │   │   └── style-1.css     # Monolithic — to be split into base/components/pages
│   │   ├── js/
│   │   │   ├── api/            # tour.api.js, …
│   │   │   ├── components/     # tour-card.js, …
│   │   │   ├── pages/          # tour-list.js, tour-detail.js, cart.js
│   │   │   ├── utils/          # http.js, format.js, cart.js
│   │   │   └── script.js       # Shared client bootstrap
│   │   └── images/
│   │
│   └── admin/                  # Assets used by admin/*.html
│       ├── css/
│       │   └── style.css
│       ├── js/                 # script.js, tinymce-config.js, account.js (planned)
│       └── images/
│
└── docs/
    ├── FE-ARCHITECTURE.md
    └── FE-PROJECT-RULES.md
```

> **Path rule:** every HTML file at `frontend/<audience>/page.html` references its
> bundle via `../assets/<audience>/...`. Never use the bare `assets/...` form,
> and never cross bundles (e.g. `client/*.html` must not load `assets/admin/...`).

---

## 2. Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Page files | `kebab-case.html` | `tour-detail.html` |
| CSS files | `kebab-case.css` | `components.css` |
| JS files | `kebab-case.js` with layer suffix | `tour.api.js`, `tour-card.js` |
| JS functions | `camelCase` with feature prefix | `renderTourCard()`, `fetchTourList()` |
| Variables | `camelCase` | `tourId`, `totalPrice` |
| Constants | `SCREAMING_SNAKE_CASE` | `BASE_URL`, `MAX_QUANTITY` |
| CSS classes | `kebab-case` | `.tour-card`, `.btn-primary` |
| CSS variables | `--kebab-case` | `--color-primary`, `--radius-md` |
| IDs (JS hooks) | `js-kebab-case` | `#js-tour-list`, `#js-submit-btn` |

> **Rule:** IDs prefixed with `js-` are JS-only hooks — never style them in CSS.

---

## 3. Layer Rules

> Replace `<audience>` with `client` or `admin`.

| Layer | File | Owns | Must NOT |
|---|---|---|---|
| **API** | `assets/<audience>/js/api/*.api.js` | AJAX calls, raw response | Touch DOM, handle UI state |
| **Component** | `assets/<audience>/js/components/*.js` | Build HTML strings, bind events | Make API calls directly |
| **Page** | `assets/<audience>/js/pages/*.js` | Orchestrate: call API → render component | Contain raw SQL-like logic |
| **Utils** | `assets/<audience>/js/utils/*.js` | Generic helpers | Know about features |
| **CSS** | `assets/<audience>/css/` | Visual only | Drive behavior |

---

## 4. Code Patterns (MUST follow)

### API Calls — always via `api/` layer
```js
// ✅ assets/client/js/api/tour.api.js
async function fetchTourList(categoryId = 0) {
    return handleRequest('GET', '/backend/api/tour/get_list.php', { category_id: categoryId });
}

// ✅ assets/client/js/pages/tour-list.js
const tours = await fetchTourList(selectedCategoryId);
renderTourCards(tours, '#js-tour-list');

// ❌ NEVER call $.ajax directly inside a page or component file
$.ajax({ url: '/backend/api/tour/get_list.php' }); // in tour-list.js — WRONG
```

### Base HTTP Wrapper — `utils/http.js`
```js
// All API functions go through this — handles errors + JSON parsing uniformly
async function handleRequest(method, url, data = {}) {
    try {
        return await $.ajax({ url, method, data });
    } catch (err) {
        showToast(err.responseJSON?.message ?? 'Something went wrong', 'error');
        throw err;
    }
}
```

### Component Functions — return HTML strings
```js
// ✅ assets/client/js/components/tour-card.js
function renderTourCard(tour) {
    return `
        <div class="tour-card" data-id="${tour.TourID}">
            <img src="${tour.TourThumbnail}" alt="${tour.Title}">
            <h3 class="tour-card__title">${tour.Title}</h3>
            <span class="tour-card__price">${formatPrice(tour.CostPerPerson)}</span>
        </div>`;
}
function renderTourCards(tours, selector) {
    $(selector).html(tours.map(renderTourCard).join(''));
}
```

### Loading State
```js
// ✅ Show skeleton/spinner before fetch, hide after
function setLoading(selector, isLoading) {
    $(selector).html(isLoading ? '<div class="skeleton"></div>' : '');
}

setLoading('#js-tour-list', true);
const tours = await fetchTourList();
renderTourCards(tours, '#js-tour-list');
```

### Form Handling
```js
// ✅ Prevent default, validate client-side, then call api layer
$('#js-booking-form').on('submit', async function (e) {
    e.preventDefault();
    if (!validateBookingForm($(this))) return;      // utils/validator.js
    const data = Object.fromEntries(new FormData(this));
    await submitBooking(data);                       // api/booking.api.js
    showToast('Booking confirmed!', 'success');
});
```

---

## 5. Anti-patterns (MUST NOT do)

| ❌ Don't | ✅ Do instead |
|---|---|
| `$.ajax` in page or component files | Use `api/*.api.js` functions |
| Inline `style=""` in JS-generated HTML | Use CSS classes |
| Business logic in render functions | Move to page file or utils |
| Select by generic class `$('.card')` | Use `#js-*` ID hooks for JS targets |
| Hardcode API URL strings in multiple files | Define `BASE_URL` in `utils/http.js` |
| Mix page-specific CSS in `base.css` | Put in `css/pages/{page-name}.css` |
| `client/*.html` loading `assets/admin/...` (or vice-versa) | Each HTML loads only its own audience bundle; duplicate shared utils per bundle |
| Bare `assets/...` paths in HTML | Use `../assets/<audience>/...` (HTML lives one level deep) |

---

## 6. CSS Conventions

```css
/* base.css — define variables once */
:root {
    --color-primary: #2563eb;
    --color-danger:  #dc2626;
    --radius-md:     8px;
    --shadow-card:   0 2px 8px rgba(0,0,0,.1);
}

/* components.css — BEM-lite naming */
.tour-card { }
.tour-card__title { }
.tour-card--featured { }   /* modifier */
```

---

## 7. Git Workflow

**Branch naming:**
```
feature/tour-card-component
fix/booking-form-validation
chore/refactor-http-util
```

**Commit message:** `type(scope): description`
```
feat(tour): render tour cards with skeleton loading
fix(booking): prevent double-submit on form
chore(css): extract card styles to components.css
```

**Before commit:** no `console.log()` left, no inline styles added, JS runs without errors in browser console.

---

## 8. Testing

- **What to test:** `utils/` functions (pure), `api/` functions (mock `$.ajax`), form validation logic
- **What NOT to unit test:** DOM rendering (verify manually in browser)
- **Tool:** None required for solo project — manual browser testing is acceptable; add Jest only if team grows
- **Console rule:** zero errors and zero warnings on every page before commit
