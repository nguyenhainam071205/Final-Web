# PROJECT-RULES.md — Backend (Procedural PHP, Layer-based)

## Tech Stack
- **Language:** PHP 8.1+
- **Style:** Procedural (no classes, no OOP)
- **Database Access:** PDO — prepared statements only

---

## 1. Directory Structure

```
backend/
├── config/
│   ├── db.php              # PDO connection → exposes $pdo
│   └── constants.php       # App-wide constants (STATUS, ROLES…)
├── api/                    # Entry points — called directly by AJAX
│   ├── tour/
│   │   ├── get_list.php
│   │   ├── get_detail.php
│   │   └── search.php
│   ├── booking/
│   │   ├── create.php
│   │   └── get_by_user.php
│   ├── category/
│   │   └── get_list.php
│   └── user/
│       ├── login.php
│       └── register.php
├── includes/               # Shared helpers — required by api/ files
│   ├── db_tour.php         # SQL functions for Tour
│   ├── db_booking.php      # SQL functions for Booking
│   ├── db_category.php
│   ├── db_user.php
│   ├── response.php        # json_success() / json_error()
│   ├── validator.php       # validate_required() / validate_int()
│   └── auth.php            # session helpers: is_logged_in(), get_current_user()
└── uploads/                # File uploads (outside web root preferred)
```

---

## 2. Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Folders | `snake_case` | `api/booking/` |
| API entry files | `verb_noun.php` | `get_list.php`, `create.php` |
| Include/helper files | `db_{feature}.php` | `db_tour.php` |
| Functions | `snake_case` with feature prefix | `tour_get_available()` |
| Variables | `snake_case` | `$tour_id`, `$total_price` |
| Constants | `SCREAMING_SNAKE_CASE` | `TOUR_STATUS_AVAILABLE` |
| DB columns in SQL | Match schema exactly | `CostPerPerson`, `TourStatus` |

---

## 3. File Responsibilities

**`api/{feature}/action.php`** — Input, validation, call helper, respond. Nothing else.  
**`includes/db_{feature}.php`** — All SQL for that feature. No `$_POST`, no `echo`.  
**`includes/response.php`** — All output. Never `echo` JSON manually.  
**`includes/validator.php`** — All input checks. Call before any DB function.

```php
// ✅ api/tour/get_list.php — clean entry point
<?php
declare(strict_types=1);
require_once '../../config/db.php';
require_once '../../includes/db_tour.php';
require_once '../../includes/response.php';
require_once '../../includes/validator.php';

$category_id = (int)($_GET['category_id'] ?? 0);
$tours = tour_get_available($pdo, $category_id);
json_success($tours);
```

```php
// ✅ includes/db_tour.php — SQL only
function tour_get_available(PDO $pdo, int $category_id): array {
    $sql = "SELECT * FROM Tour WHERE TourStatus = 'Available' AND CategoryID = :cid";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cid' => $category_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
```

---

## 4. Code Patterns (MUST follow)

### Response Format
```php
// includes/response.php
function json_success(mixed $data = [], int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

function json_error(string $message, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
```

### Validation
```php
// ✅ Validate at the top of every api/ file, before any DB call
validate_required($_POST, ['tour_id', 'quantity']);  // calls json_error() and exit if missing
validate_positive_int((int)$_POST['quantity']);
```

### Error Handling
```php
// ✅ Wrap DB calls in try/catch at api/ level
try {
    $result = booking_create($pdo, $data);
    json_success($result, 201);
} catch (PDOException $e) {
    error_log($e->getMessage());
    json_error('Database error', 500);
}
```

### Cross-feature Logic
```php
// ✅ require the other feature's helper — never duplicate SQL
// api/booking/create.php
require_once '../../includes/db_tour.php';    // need tour info
require_once '../../includes/db_booking.php'; // own feature

$tour = tour_get_by_id($pdo, $tour_id);      // reuse existing function
if (!$tour) json_error('Tour not found', 404);
```

### Database (mandatory rules)
```php
// ✅ Always prepared statements
$stmt = $pdo->prepare("SELECT * FROM Tour WHERE TourID = :id");
$stmt->execute([':id' => $tour_id]);

// ❌ NEVER string interpolation
$pdo->query("SELECT * FROM Tour WHERE TourID = $tour_id"); // SQL injection
```

---

## 5. Anti-patterns (MUST NOT do)

| ❌ Don't | ✅ Do instead |
|---|---|
| `echo json_encode(...)` directly | Use `json_success()` / `json_error()` |
| SQL inside `api/` files | Move to `includes/db_{feature}.php` |
| Duplicate SQL across files | Extract to shared helper function |
| `$_POST` / `$_GET` inside `includes/` | Parse input in `api/`, pass as args |
| Hardcoded DB credentials | Keep in `config/db.php`, load from env |
| `die()` for error responses | Use `json_error()` then `exit` |
| `var_dump()` / `print_r()` left in code | Remove before commit |

---

## 6. Git Workflow

**Branch naming:**
```
feature/tour-search
fix/booking-price-snapshot
chore/add-category-index
```

**Commit message:** `type(scope): mô tả ngắn`
```
feat(tour): add category filter to get_list API
fix(booking): store PriceAtBooking instead of live price
chore(db): add index on Tour.DepartureDate
```

**Before commit checklist:**
- No `var_dump()` / `print_r()` remaining
- No hardcoded credentials
- All SQL uses prepared statements
- PHP runs without errors (`error_reporting(E_ALL)`)

---

## 7. PHP-Specific Rules

- `declare(strict_types=1)` at top of every file
- Type-hint all function parameters and return types
- Never suppress errors with `@` operator
- Session logic only inside `includes/auth.php`
- File uploads: validate MIME type + size; store in `uploads/` outside web root
