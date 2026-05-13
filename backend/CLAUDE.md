# CLAUDE.md — Backend

## Tech Stack

| Layer | Technology |
|---|---|
| Language | PHP 8.1+ |
| Style | Procedural — no classes, no OOP, no framework |
| Database | MySQL 8.0+ |
| DB Access | PDO — prepared statements only, no ORM |
| Server | Apache via XAMPP |
| Auth | PHP native sessions |

---

## Must-Read Documentation

Read these before writing any code:

| File | What it defines |
|---|---|
| [docs/BE-ARCHITECTURE.md](docs/BE-ARCHITECTURE.md) | Layer diagram, folder structure, request flow, cross-feature rules, admin gate, config/secrets pattern |
| [docs/BE-PROJECT-RULES.md](docs/BE-PROJECT-RULES.md) | Naming conventions, file responsibilities, code patterns, anti-patterns, git workflow, PHP-specific rules |
| [../share-docs/DATABASE.md](../share-docs/DATABASE.md) | Full schema — all table/column names, ENUMs, indexes, relationships, migration rules |
| [../frontend/docs/FE-ARCHITECTURE.md](../frontend/docs/FE-ARCHITECTURE.md) | FE↔BE contract — what each endpoint must return and why |

---

## Reference Files

| File | Purpose |
|---|---|
| [config/db.php](config/db.php) | PDO singleton — exposes `$pdo`, loads credentials from `$_ENV` |
| [config/constants.php](config/constants.php) | All ENUM mirrors (`TOUR_STATUS_*`, `ORDER_STATUS_*`, `USER_ROLE_*`) |
| [includes/response.php](includes/response.php) | `json_success()` / `json_error()` — the only way to output JSON |
| [includes/validator.php](includes/validator.php) | `validate_required()`, `validate_positive_int()` — call before any DB function |
| [includes/auth.php](includes/auth.php) | `is_logged_in()`, `require_login()`, `require_role()` — session logic lives here only |
| [includes/db_tour.php](includes/db_tour.php) | All SQL for Tour + Tour_Image |
| [includes/db_category.php](includes/db_category.php) | All SQL for Category |
| [includes/db_booking.php](includes/db_booking.php) | All SQL for BookedTour |
| [includes/db_order.php](includes/db_order.php) | All SQL for Order |
| [includes/db_user.php](includes/db_user.php) | All SQL for User |

---

## File Locations

### Current State (implemented)

```
backend/
└── docs/
    ├── BE-ARCHITECTURE.md
    └── BE-PROJECT-RULES.md
```

> No implementation files exist yet — backend is in documentation phase only.

### Planned Structure (target — follow this for all new files)

```
backend/
├── config/
│   ├── db.php                      # PDO connection singleton → exposes $pdo
│   └── constants.php               # App-wide ENUM mirrors
│
├── api/                            # Entry points — one file = one AJAX endpoint
│   ├── tour/
│   │   ├── get_list.php            # GET  — tour list + category filter
│   │   ├── get_detail.php          # GET  — single tour + images
│   │   └── search.php              # GET  — keyword/date/location search
│   ├── category/
│   │   └── get_list.php            # GET  — category tree (ParentID hierarchy)
│   ├── booking/
│   │   ├── create.php              # POST — create Order + BookedTour rows
│   │   └── get_by_user.php         # GET  — order history for current user
│   ├── user/
│   │   ├── login.php               # POST — verify password, start session
│   │   ├── register.php            # POST — create User (Customer role)
│   │   └── logout.php              # POST — destroy session
│   └── admin/                      # All endpoints require Role = Admin
│       ├── tour_create.php
│       ├── tour_update.php
│       ├── tour_delete.php
│       ├── user_list.php
│       └── order_list.php
│
├── includes/                       # Never called directly by browser
│   ├── db_tour.php                 # tour_get_list(), tour_get_by_id(), tour_search()
│   ├── db_category.php             # category_get_list(), category_get_tree()
│   ├── db_booking.php              # booking_create(), booking_get_by_user()
│   ├── db_order.php                # order_create(), order_update_status()
│   ├── db_user.php                 # user_find_by_email(), user_create()
│   ├── response.php                # json_success() / json_error()
│   ├── validator.php               # validate_required(), validate_positive_int()
│   └── auth.php                    # is_logged_in(), require_login(), require_role()
│
└── uploads/                        # File uploads — validate MIME + size; store outside web root
```

---

## Layer Rules

| Layer | File path | Owns | Must NOT |
|---|---|---|---|
| **Entry** | `api/**/*.php` | Parse `$_GET`/`$_POST`, validate, call helpers, respond | Write SQL, `echo` JSON directly |
| **Data** | `includes/db_*.php` | All SQL for one feature domain | Read `$_POST`/`$_GET`, call `http_response_code()`, require other `db_*` files |
| **Shared** | `includes/response.php`, `validator.php`, `auth.php` | Cross-cutting utilities | Contain business or DB logic |
| **Config** | `config/` | PDO connection, constants | Contain business logic |

---

## FE ↔ BE Endpoint Contract

Every `backend/api/` endpoint maps 1-to-1 to a `frontend/js/api/*.api.js` function.

| BE endpoint | FE function | Method | Auth required |
|---|---|---|---|
| `api/tour/get_list.php` | `fetchTourList(categoryId)` | GET | No |
| `api/tour/get_detail.php` | `fetchTourDetail(tourId)` | GET | No |
| `api/category/get_list.php` | `fetchCategoryList()` | GET | No |
| `api/booking/create.php` | `submitBooking(data)` | POST | Customer + Admin |
| `api/booking/get_by_user.php` | `fetchUserOrders()` | GET | Customer + Admin |
| `api/user/login.php` | `loginUser(data)` | POST | No |
| `api/user/register.php` | `registerUser(data)` | POST | No |
| `api/user/logout.php` | — | POST | Customer + Admin |
| `api/admin/*` | admin JS functions | GET/POST | Admin only |

**Response envelope** (always — via `response.php`):
```json
{ "success": true,  "data": {} }
{ "success": false, "message": "Human-readable error" }
```

---

## Error Code Prefixes

### HTTP Status Codes — use exclusively via `json_error($message, $code)`

| Code | When to use |
|---|---|
| `200` | Successful GET / default success |
| `201` | Successful POST that created a resource |
| `400` | Missing or malformed input (caught by `validate_required()`) |
| `401` | No active session (`require_login()` fires) |
| `403` | Session exists but wrong role (`require_role()` fires) |
| `404` | Requested resource not found in DB |
| `409` | Conflict — e.g. tour is Full or Cancelled |
| `422` | Input present but semantically invalid (e.g. quantity ≤ 0) |
| `500` | Caught `PDOException` — log with `error_log()`, return generic message |

### Server-Side Error Code Convention

Prefix internal error identifiers with `BE-` followed by the feature domain. Use in `error_log()` only — never expose to the client.

| Prefix | Domain | Examples |
|---|---|---|
| `BE-AUTH-` | Session / role | `BE-AUTH-001` no session, `BE-AUTH-002` role mismatch |
| `BE-TOUR-` | Tour catalog | `BE-TOUR-001` tour not found, `BE-TOUR-002` tour not available |
| `BE-BOOK-` | Booking / orders | `BE-BOOK-001` order insert failed, `BE-BOOK-002` price snapshot missing |
| `BE-USER-` | User management | `BE-USER-001` email already exists, `BE-USER-002` invalid password hash |
| `BE-VAL-` | Validation | `BE-VAL-001` required field missing, `BE-VAL-002` non-positive integer |
| `BE-DB-` | Database / PDO | `BE-DB-001` PDOException on query, `BE-DB-002` transaction rollback |

```php
// ✅ Correct error logging in api/ files
} catch (PDOException $e) {
    error_log('BE-DB-001 ' . $e->getMessage());
    json_error('Database error', 500);
}
```

---

## Key Conventions (Quick Reference)

| Target | Convention | Example |
|---|---|---|
| Folders | `snake_case` | `api/booking/` |
| API entry files | `verb_noun.php` | `get_list.php`, `create.php` |
| Include/helper files | `db_{feature}.php` | `db_tour.php` |
| Functions | `snake_case` with feature prefix | `tour_get_available()`, `booking_create()` |
| Variables | `snake_case` | `$tour_id`, `$total_price` |
| Constants | `SCREAMING_SNAKE_CASE` | `TOUR_STATUS_AVAILABLE`, `USER_ROLE_ADMIN` |
| DB columns in SQL | Match PascalCase from DATABASE.md exactly | `CostPerPerson`, `TourStatus`, `PriceAtBooking` |

---

## Critical Rules

- **Always** `declare(strict_types=1)` at the top of every file.
- **Always** use prepared statements — never string-interpolate user input into SQL.
- **Always** call `validate_required()` before any DB function in `api/` files.
- **Always** snapshot `Tour.CostPerPerson` into `BookedTour.PriceAtBooking` at insert time — never recalculate from a live JOIN for historical orders.
- **Never** read `$_POST` / `$_GET` inside `includes/` files — parse in `api/`, pass as arguments.
- **Never** `echo json_encode(...)` directly — use `json_success()` / `json_error()`.
- **Never** put session logic outside `includes/auth.php`.
- **Never** suppress errors with the `@` operator.

### Admin Gate (every `api/admin/*.php` must start with)

```php
require_once '../../includes/auth.php';
require_login();           // → json_error(401) if no session
require_role(USER_ROLE_ADMIN);  // → json_error(403) if not Admin
```

---

## Configuration & Secrets

- DB credentials live in `.env` (gitignored — never committed).
- `config/db.php` reads from `$_ENV` with safe fallbacks for local dev.
- `.gitignore` must include `.env` and `uploads/`.

---

## Pre-Commit Checklist

- No `var_dump()` / `print_r()` remaining
- No hardcoded credentials anywhere
- All SQL uses prepared statements
- `declare(strict_types=1)` present in every file
- PHP runs without errors under `error_reporting(E_ALL)`
- All `error_log()` calls use a `BE-` prefixed code
