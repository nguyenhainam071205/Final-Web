# CLAUDE.md — Frontend

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Style | CSS3 — plain, no preprocessor, BEM-lite naming |
| Logic | Vanilla JS (ES6+) + jQuery |
| Pattern | Multi-Page Application (MPA) — no router, no bundler |
| Server | Apache via XAMPP (serves `.html` files directly) |

**CDN Libraries (no npm/build step):**
| Library | Purpose |
|---|---|
| jQuery | DOM + AJAX (`$.ajax`) |
| AOS | Scroll-based CSS animations |
| Swiper | Carousel / image sliders |
| ViewerJS | Tour image gallery lightbox |
| Font Awesome 6.6.0 | Icons |
| JustValidate | Form validation |

---

## Must-Read Documentation

Read these before writing any code:

| File | What it defines |
|---|---|
| [docs/FE-ARCHITECTURE.md](docs/FE-ARCHITECTURE.md) | Layer diagram, data flow, access control, cross-page communication, FE↔BE contract |
| [docs/FE-PROJECT-RULES.md](docs/FE-PROJECT-RULES.md) | Naming conventions, code patterns, anti-patterns, CSS rules, git workflow |
| [../share-docs/DATABASE.md](../share-docs/DATABASE.md) | All table/column names — use PascalCase field names exactly as defined when mapping API responses |
| [../backend/docs/BE-ARCHITECTURE.md](../backend/docs/BE-ARCHITECTURE.md) | Backend endpoint list, request/response shapes, HTTP status codes, auth flow |

---

## Reference Files

| File | Purpose |
|---|---|
| [assets/js/utils/http.js](assets/js/utils/http.js) | Base `handleRequest()` wrapper — all AJAX must go through this |
| [assets/js/utils/auth.js](assets/js/utils/auth.js) | `getSession()`, `redirectIfNotLoggedIn()`, `redirectIfNotAdmin()` |
| [assets/js/utils/validator.js](assets/js/utils/validator.js) | `validateRequired()`, `validateEmail()` — pure, no DOM side effects |
| [assets/js/utils/format.js](assets/js/utils/format.js) | `formatPrice()`, `formatDate()` — pure formatters |
| [assets/css/base.css](assets/css/base.css) | CSS variables (`--color-*`, `--radius-*`, `--shadow-*`) — read before adding any new styles |
| [assets/css/components.css](assets/css/components.css) | Shared component classes (`.tour-card`, `.btn`, `.badge`, `.modal`) |

---

## File Locations

### Current State (implemented)

```
frontend/
├── CLAUDE.md
├── index.html                          # Tour listing page (public)
├── tour-detail.html                    # Tour detail + gallery (public)
├── cart.html                           # Shopping cart
├── assets/
│   ├── css/
│   │   └── style-1.css                 # ⚠ Monolithic — will be split per planned structure
│   ├── js/
│   │   └── script.js                   # ⚠ Monolithic — will be split per planned structure
│   └── images/                         # 48 static image assets
└── docs/
    ├── FE-ARCHITECTURE.md
    └── FE-PROJECT-RULES.md
```

### Planned Structure (target — follow this for all new files)

```
frontend/
├── pages/
│   ├── index.html                      # Tour listing (public)
│   ├── tour-detail.html                # Tour detail + gallery (public)
│   ├── booking.html                    # Booking form (protected)
│   ├── login.html                      # Login (public)
│   ├── register.html                   # Register (public)
│   └── admin/
│       ├── dashboard.html
│       ├── tour-manage.html
│       └── user-manage.html
│
├── assets/
│   ├── css/
│   │   ├── base.css                    # Variables, reset, typography
│   │   ├── components.css              # .tour-card, .btn, .badge, .modal (BEM-lite)
│   │   └── pages/                      # Page-specific overrides only
│   │       ├── tour-detail.css
│   │       ├── booking.css
│   │       └── admin.css
│   │
│   ├── js/
│   │   ├── api/                        # AJAX only — no DOM, no UI
│   │   │   ├── tour.api.js             # fetchTourList(), fetchTourDetail()
│   │   │   ├── category.api.js         # fetchCategoryList()
│   │   │   ├── booking.api.js          # submitBooking(), fetchUserOrders()
│   │   │   └── user.api.js             # loginUser(), registerUser()
│   │   │
│   │   ├── components/                 # Render layer — HTML strings + event binding
│   │   │   ├── tour-card.js            # renderTourCard(tour) → string
│   │   │   ├── tour-gallery.js         # renderGallery(images, selector)
│   │   │   ├── category-filter.js      # renderCategoryTabs(categories, selector)
│   │   │   ├── pagination.js           # renderPagination(meta, selector)
│   │   │   ├── order-row.js            # renderOrderRow(order) → string
│   │   │   ├── modal.js                # openModal(content), closeModal()
│   │   │   └── toast.js                # showToast(msg, type)
│   │   │
│   │   ├── pages/                      # Orchestration — one file per page
│   │   │   ├── tour-list.js
│   │   │   ├── tour-detail.js
│   │   │   ├── booking.js
│   │   │   ├── login.js
│   │   │   └── admin/
│   │   │       ├── tour-manage.js
│   │   │       └── user-manage.js
│   │   │
│   │   └── utils/                      # Pure helpers — no feature knowledge
│   │       ├── http.js                 # handleRequest() — base $.ajax wrapper
│   │       ├── validator.js            # validateRequired(), validateEmail()
│   │       ├── auth.js                 # getSession(), redirectIfNotLoggedIn()
│   │       └── format.js              # formatPrice(), formatDate()
│   │
│   └── images/
│
└── components/                         # Shared HTML partials
    ├── navbar.html
    └── footer.html
```

---

## Layer Rules

| Layer | File path | Owns | Must NOT |
|---|---|---|---|
| **Page** | `js/pages/*.js` | Init, orchestrate API→render, bind page events | Call `$.ajax` directly, write SQL-like logic |
| **API** | `js/api/*.api.js` | `handleRequest()` calls, map response shape | Touch DOM, show toasts |
| **Component** | `js/components/*.js` | Build HTML strings, bind component events | Call API, know page state |
| **Utils** | `js/utils/*.js` | Pure helpers, zero side effects | Know about features or pages, make DOM calls |
| **CSS** | `assets/css/` | Visual styles only | Drive JS behavior |

---

## FE ↔ BE Endpoint Contract

Every `js/api/*.api.js` function maps 1-to-1 to a backend PHP endpoint.

| FE function | BE endpoint | Method |
|---|---|---|
| `fetchTourList(categoryId)` | `api/tour/get_list.php` | GET |
| `fetchTourDetail(tourId)` | `api/tour/get_detail.php` | GET |
| `fetchCategoryList()` | `api/category/get_list.php` | GET |
| `submitBooking(data)` | `api/booking/create.php` | POST |
| `fetchUserOrders()` | `api/booking/get_by_user.php` | GET |
| `loginUser(data)` | `api/user/login.php` | POST |
| `registerUser(data)` | `api/user/register.php` | POST |

**Response envelope** (always): `{ success: bool, data?: any, message?: string }`

---

## Error Code Prefixes

### HTTP Status Codes from Backend

Handle these in `utils/http.js` via `handleRequest()`:

| Code | Meaning | FE action |
|---|---|---|
| `200` | OK | Resolve with `data` |
| `201` | Created | Resolve with `data` (booking/register success) |
| `400` | Bad request / missing fields | `showToast(message, 'error')` |
| `401` | Not authenticated | `redirectIfNotLoggedIn()` |
| `403` | Forbidden (wrong role) | `showToast('Access denied', 'error')`, redirect to index |
| `404` | Resource not found | `showToast('Not found', 'error')` |
| `409` | Conflict (e.g. tour full) | `showToast(message, 'warning')` |
| `422` | Validation failed | Display field-level errors |
| `500` | Server error | `showToast('Something went wrong', 'error')` |

### Client-Side Error Code Convention

Prefix client-side error identifiers with `FE-` followed by the feature domain:

| Prefix | Domain | Examples |
|---|---|---|
| `FE-AUTH-` | Authentication / session | `FE-AUTH-001` session missing, `FE-AUTH-002` role mismatch |
| `FE-FORM-` | Form validation | `FE-FORM-001` required field empty, `FE-FORM-002` invalid email |
| `FE-TOUR-` | Tour listing / detail | `FE-TOUR-001` no tours returned, `FE-TOUR-002` invalid tour ID in URL |
| `FE-BOOK-` | Booking flow | `FE-BOOK-001` quantity out of range, `FE-BOOK-002` missing tour_id param |
| `FE-HTTP-` | Network / AJAX | `FE-HTTP-001` request timeout, `FE-HTTP-002` non-JSON response |

Use these codes in `console.error()` and log context — never display raw codes to users. Show only the human-readable `message` via `showToast()`.

```js
// ✅ Correct error logging in utils/http.js
} catch (err) {
    console.error('FE-HTTP-001', err);
    showToast(err.responseJSON?.message ?? 'Something went wrong', 'error');
    throw err;
}
```

---

## Key Conventions (Quick Reference)

| Target | Convention | Example |
|---|---|---|
| Page files | `kebab-case.html` | `tour-detail.html` |
| JS files | `kebab-case.js` with layer suffix | `tour.api.js`, `tour-card.js` |
| JS functions | `camelCase` with feature prefix | `renderTourCard()`, `fetchTourList()` |
| Constants | `SCREAMING_SNAKE_CASE` | `BASE_URL`, `MAX_QUANTITY` |
| CSS classes | `kebab-case` BEM-lite | `.tour-card`, `.tour-card__title`, `.tour-card--featured` |
| CSS variables | `--kebab-case` | `--color-primary`, `--radius-md` |
| JS DOM hooks | `#js-kebab-case` | `#js-tour-list`, `#js-submit-btn` |
| DB column refs in JS | Match PascalCase from DATABASE.md | `tour.TourID`, `tour.CostPerPerson` |

> `#js-*` IDs are JS-only hooks — never style them in CSS.

---

## Pre-Commit Checklist

- No `console.log()` left in committed code (`console.error()` for error logging is OK)
- No inline `style=""` attributes in JS-generated HTML
- No `$.ajax` calls outside `js/api/` or `js/utils/http.js`
- Zero browser console errors and warnings on every page
- All new CSS variables defined in `base.css`, not inline
