# Tổ chức Project — Tóm tắt

## 1. Tech Stack

| Lớp | Công nghệ |
|---|---|
| Frontend Markup | HTML5 |
| Frontend Style | CSS3 thuần (BEM-lite, không preprocessor) |
| Frontend Logic | Vanilla JS (ES6+) + jQuery |
| Frontend Pattern | MPA (Multi-Page Application) — không router, không bundler |
| Backend | PHP thuần (procedural) + PDO |
| Database | MySQL |
| Server | Apache qua XAMPP |
| Pattern API | REST-lite, response envelope `{ success, data, message }` |

**CDN libs:** jQuery, AOS, Swiper, ViewerJS, Font Awesome 6.6.0, JustValidate.

---

## 2. Cây thư mục cấp cao

```
project/
├── backend/                # API PHP + DB layer
├── frontend/               # HTML/CSS/JS — client & admin
├── share-docs/             # Tài liệu dùng chung (DATABASE.md)
└── feature/                # Tài liệu mô tả từng feature
```

---

## 3. Backend — [`backend/`](backend/)

```
backend/
├── api/                          # Entry endpoints — public HTTP
│   ├── tour/                     # get_list.php, get_detail.php
│   ├── booking/                  # create.php
│   ├── user/                     # login.php
│   └── admin/
│       └── booking/              # get_list.php, update.php, delete.php
├── config/
│   └── db.php                    # Khởi tạo PDO ($pdo) + hằng số dùng chung
├── includes/
│   ├── response.php              # json_success(), json_error()
│   ├── auth.php                  # Session check, role check
│   ├── db_tour.php               # tour_get_list(), tour_get_detail()
│   ├── db_booking.php            # SQL cho booking (client + admin)
│   ├── db_order.php              # SQL cho order
│   └── db_user.php               # SQL cho user/auth
├── docs/
│   ├── BE-ARCHITECTURE.md
│   └── BE-PROJECT-RULES.md
└── CLAUDE.md
```

**Quy tắc tầng BE:**

| Tầng | Trách nhiệm | Không được làm |
|---|---|---|
| `api/*.php` | Parse `$_GET`/`$_POST`, gọi DB layer, trả `json_success/error` | Viết SQL trực tiếp |
| `includes/db_*.php` | Chuẩn bị statement, bind, fetch | Đọc `$_GET`/`$_POST`, echo |
| `config/*` | Hằng số, kết nối DB | Logic nghiệp vụ |
| `includes/auth.php` | Session, role gate | Truy vấn nghiệp vụ |

**Endpoint chính:**

| Endpoint | Method | Mục đích |
|---|---|---|
| `api/tour/get_list.php` | GET | Danh sách tour (lọc theo `category_id`) |
| `api/tour/get_detail.php` | GET | Chi tiết 1 tour theo `tour_id` |
| `api/booking/create.php` | POST | Tạo booking từ client |
| `api/user/login.php` | POST | Đăng nhập user/admin |
| `api/admin/booking/get_list.php` | GET | Danh sách booking cho admin |
| `api/admin/booking/update.php` | POST | Cập nhật trạng thái booking |
| `api/admin/booking/delete.php` | POST | Xoá booking |

---

## 4. Frontend — [`frontend/`](frontend/)

```
frontend/
├── client/                       # Trang public
│   ├── index.html                # Trang chủ — list tour
│   ├── tour-detail.html          # Chi tiết tour
│   └── cart.html                 # Giỏ hàng / booking
│
├── admin/                        # Trang admin
│   ├── login.html
│   ├── dashboard.html
│   ├── order-management.html
│   └── order-changing.html
│
├── assets/
│   ├── client/
│   │   ├── css/                  # style-1.css
│   │   ├── images/               # Ảnh tour, banner, icon
│   │   └── js/
│   │       ├── api/              # Layer AJAX — không động DOM
│   │       │   ├── tour.api.js
│   │       │   └── booking.api.js
│   │       ├── components/       # Render layer — HTML string + bind event
│   │       │   └── tour-card.js
│   │       ├── pages/            # Orchestrator — 1 file / 1 trang
│   │       │   ├── tour-list.js
│   │       │   ├── tour-detail.js
│   │       │   └── cart.js
│   │       ├── utils/            # Helper thuần
│   │       │   ├── http.js       # handleRequest()
│   │       │   ├── format.js     # formatPrice(), formatDate()
│   │       │   └── cart.js       # LocalStorage cart helpers
│   │       └── script.js         # Global handler
│   │
│   └── admin/
│       ├── css/                  # style.css
│       ├── images/               # Ảnh dùng cho admin panel
│       └── js/
│           ├── api/              # booking.api.js, user.api.js
│           ├── components/       # sider.js (sidebar admin)
│           ├── pages/            # login.js, dashboard.js,
│           │                     # order-management.js, order-changing.js
│           └── utils/            # http.js, format.js
│
├── docs/
│   ├── FE-ARCHITECTURE.md
│   └── FE-PROJECT-RULES.md
└── CLAUDE.md
```

**Quy tắc tầng FE:**

| Tầng | File | Trách nhiệm | Không được làm |
|---|---|---|---|
| **Page** | `js/pages/*.js` | Init, orchestrate API → render, bind event của page | Gọi `$.ajax` trực tiếp |
| **API** | `js/api/*.api.js` | Gọi `handleRequest`, map shape | Động DOM, show toast |
| **Component** | `js/components/*.js` | Build HTML string, bind event của component | Gọi API, biết page state |
| **Utils** | `js/utils/*.js` | Helper thuần, zero side effect | Biết feature/page |
| **CSS** | `assets/css/` | Style | Điều khiển hành vi JS |

---

## 5. Cách load script (vì không có bundler)

Tất cả file JS nạp tuần tự qua `<script src>` cuối `<body>`. **Thứ tự bắt buộc** (dưới phụ thuộc trên):

```
1. jquery               (CDN)
2. utils/format.js
3. utils/http.js
4. api/*.api.js
5. components/*.js
6. pages/*.js
7. script.js
```

Mọi `function` khai báo ở top-level đều thành **global** trên `window` → các file sau có thể dùng trực tiếp.

---

## 6. Luồng request chuẩn (FE → BE → DB)

```
[page]  pages/xxx.js
            │ gọi
            ▼
[api]   api/xxx.api.js  ──►  fetchXxx()
            │ gọi
            ▼
[http]  utils/http.js  ──►  handleRequest('GET', '/path', params)
            │ $.ajax( BASE_URL + '/path' )
            ▼
═══════════════ HTTP ═══════════════
            │
            ▼
[entry] backend/api/xxx/yyy.php
            │ gọi
            ▼
[db]    backend/includes/db_xxx.php  ──►  xxx_get_list($pdo, ...)
            │ PDO prepare/execute
            ▼
[mysql] SELECT ... FROM Tour ...
```

**Response envelope (luôn luôn):**
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "..." }
```

`handleRequest` đã unwrap `response.data` → tầng API/page nhận trực tiếp payload.

---

## 7. Quy ước đặt tên

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| File HTML | `kebab-case.html` | `tour-detail.html` |
| File JS | `kebab-case.js` + suffix lớp | `tour.api.js`, `tour-card.js` |
| Function JS | `camelCase` + prefix feature | `fetchTourList`, `renderTourCard` |
| Hằng số JS | `SCREAMING_SNAKE_CASE` | `BASE_URL`, `MAX_QUANTITY` |
| Class CSS | `kebab-case` BEM-lite | `.tour-card`, `.tour-card__title` |
| Biến CSS | `--kebab-case` | `--color-primary`, `--radius-md` |
| DOM hook | `#js-kebab-case` | `#js-tour-list`, `#js-submit-btn` |
| Cột DB trong JS | **PascalCase** đúng schema | `tour.TourID`, `tour.CostPerPerson` |
| Hàm PHP | `snake_case` + prefix bảng | `tour_get_list`, `booking_create` |
| Tham số PHP | `$snake_case` | `$category_id`, `$tour_id` |

> `#js-*` là **JS hook only**, không style trong CSS.

---

## 8. Error code prefix

| Prefix | Domain | Tầng | Ví dụ |
|---|---|---|---|
| `FE-AUTH-*` | Auth / session | Frontend | `FE-AUTH-001` thiếu session |
| `FE-FORM-*` | Validate form | Frontend | `FE-FORM-001` field rỗng |
| `FE-TOUR-*` | Tour list / detail | Frontend | `FE-TOUR-001` không tải được tour |
| `FE-BOOK-*` | Booking | Frontend | `FE-BOOK-001` sai số lượng |
| `FE-HTTP-*` | AJAX / network | Frontend | `FE-HTTP-001` request fail |
| `BE-DB-*` | PDO / SQL | Backend | `BE-DB-001` query lỗi |
| `BE-AUTH-*` | Session BE | Backend | `BE-AUTH-001` không có session |
| `BE-VAL-*` | Validate input BE | Backend | `BE-VAL-001` thiếu field |

Dùng trong `console.error()` (FE) hoặc `error_log()` (BE) — **không hiển thị raw code cho user**, chỉ show `message` qua `showToast`.

---

## 9. HTTP status & xử lý FE

Xử lý tập trung trong `utils/http.js`:

| Status | Ý nghĩa | FE action |
|---|---|---|
| 200 | OK | Resolve `data` |
| 201 | Created | Resolve `data` |
| 400 | Bad request | `showToast(error)` |
| 401 | Unauthenticated | Redirect login |
| 403 | Forbidden | Toast + redirect index |
| 404 | Not found | `showToast` |
| 409 | Conflict (tour full) | `showToast(warning)` |
| 422 | Validation fail | Hiển thị field-level error |
| 500 | Server error | Toast generic |

---

## 10. Tài liệu phải đọc

| File | Nội dung |
|---|---|
| [`frontend/CLAUDE.md`](frontend/CLAUDE.md) | Tech stack FE, layer rules, naming, error code |
| [`backend/CLAUDE.md`](backend/CLAUDE.md) | Tech stack BE, layer rules, endpoint contract |
| [`frontend/docs/FE-ARCHITECTURE.md`](frontend/docs/FE-ARCHITECTURE.md) | Sơ đồ layer FE, cross-page comm, data flow |
| [`frontend/docs/FE-PROJECT-RULES.md`](frontend/docs/FE-PROJECT-RULES.md) | Naming, code pattern, anti-pattern, git workflow |
| [`backend/docs/BE-ARCHITECTURE.md`](backend/docs/BE-ARCHITECTURE.md) | Endpoint list, request/response shape, auth flow |
| [`backend/docs/BE-PROJECT-RULES.md`](backend/docs/BE-PROJECT-RULES.md) | Naming, layer rules, anti-pattern phía BE |
| [`share-docs/DATABASE.md`](share-docs/DATABASE.md) | Schema toàn bộ bảng — **field PascalCase, dùng đúng tên cột** |
| [`feature/PROJECT-STRUCTURE.md`](feature/PROJECT-STRUCTURE.md) | Mô tả chi tiết cấu trúc thư mục |
| [`feature/FEATURE-TOUR-LIST.md`](feature/FEATURE-TOUR-LIST.md) | Ví dụ chi tiết 1 feature đầy đủ FE + BE |

---

## 11. Pre-commit checklist

- [ ] Không còn `console.log()` (chỉ `console.error()` cho lỗi)
- [ ] Không có `style=""` inline trong HTML do JS sinh ra
- [ ] Không gọi `$.ajax` ngoài `js/api/` hoặc `utils/http.js`
- [ ] Không có warning/error trên browser console
- [ ] CSS variable mới định nghĩa trong `base.css`, không inline
- [ ] PHP: không `echo` trong `includes/db_*.php`, chỉ return mảng
- [ ] PHP: dùng prepared statement, không nối chuỗi SQL
- [ ] Tên cột DB trong JS viết PascalCase đúng schema
