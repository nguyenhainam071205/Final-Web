# Feature: Hiển thị danh sách tour trên `index.html`

## 1. Mục đích & UX

Trang chủ `index.html` hiển thị **2 dãy tour** lấy từ database:

| Section | Tiêu đề | Category hiển thị |
|---|---|---|
| Section 4 | "Tour Trong Nước" | `CategoryID = 1` |
| Section 6 | "Tour Nước Ngoài" | `CategoryID = 2` |

Mỗi card hiển thị: ảnh thumbnail, tiêu đề tour, giá/người, mã tour, ngày khởi hành, thời gian (duration), rating 5 sao (cứng). Click vào ảnh hoặc tiêu đề → chuyển sang `tour-detail.html?tour_id=<id>`.

Yêu cầu lọc: chỉ tour có `TourStatus = 'Available'`, sắp xếp theo `DepartureDate ASC`.

---

## 2. Sơ đồ luồng dữ liệu

```
┌─────────────────────────────┐
│  index.html                 │   2 container có data-category-id
│  #js-tour-list (=1)         │
│  #js-tour-ngoai-list (=2)   │
└──────────────┬──────────────┘
               │ DOMContentLoaded
               ▼
┌─────────────────────────────┐
│  pages/tour-list.js         │   initTourList(selector)
│  - đọc data-category-id     │
│  - hiển thị skeleton        │
│  - gọi fetchTourList(id)    │
│  - render hoặc báo lỗi      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  api/tour.api.js            │   fetchTourList(categoryId)
│  → handleRequest('GET',...) │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  utils/http.js              │   handleRequest()
│  $.ajax → BASE_URL + path   │
│  trả về response.data       │
└──────────────┬──────────────┘
               │ HTTP GET /Project/backend/api/tour/get_list.php?category_id=1
               ▼
┌─────────────────────────────┐
│  api/tour/get_list.php      │   Entry layer
│  - đọc $_GET['category_id'] │
│  - tour_get_list($pdo, id)  │
│  - json_success([...])      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  includes/db_tour.php       │   tour_get_list()
│  SELECT ... FROM Tour       │
│  WHERE TourStatus='Available'│
│  AND CategoryID=:cat (nếu)  │
│  ORDER BY DepartureDate ASC │
└──────────────┬──────────────┘
               │ Array<Tour>
               ▼
       (đi ngược về FE)
               │
               ▼
┌─────────────────────────────┐
│  components/tour-card.js    │   renderTourCards(tours, sel)
│  - map mỗi tour → HTML str  │
│  - $(sel).html(joined)      │
└─────────────────────────────┘
```

---

## 3. Tầng FE — chi tiết từng file

### 3.1. [`frontend/client/index.html`](../client/index.html)

**Section 4 (line ~720):**
```html
<div class="inner-list" id="js-tour-list" data-category-id="1"></div>
```

**Section 6 (line ~748):**
```html
<div class="inner-list" id="js-tour-ngoai-list" data-category-id="2"></div>
```

**Thứ tự script ở cuối body** (quan trọng vì có dependency):
1. `jquery-3.7.1.min.js` — phải load trước mọi script JS dùng `$`
2. `utils/format.js` — `formatPrice`, `formatDate`
3. `utils/http.js` — `handleRequest`, `BASE_URL`
4. `api/tour.api.js` — `fetchTourList`
5. `components/tour-card.js` — `renderTourCard`, `renderTourCards`
6. `pages/tour-list.js` — `initTourList`
7. `script.js` — global handlers

---

### 3.2. [`frontend/assets/client/js/pages/tour-list.js`](../assets/client/js/pages/tour-list.js)

Vai trò: **orchestrator** — không trực tiếp gọi `$.ajax`, không build HTML; chỉ điều phối API → render.

```js
async function initTourList(selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    const categoryId = parseInt(container.dataset.categoryId ?? '0', 10);

    setLoading(selector, true);          // hiển thị "Đang tải..."
    try {
        const result = await fetchTourList(categoryId);
        const tours  = result.tours ?? [];
        if (tours.length === 0) {
            $(selector).html('<p>Chưa có tour nào.</p>');
            return;
        }
        renderTourCards(tours, selector);
    } catch (err) {
        console.error('FE-TOUR-001', err);
        $(selector).html('<p>Lỗi tải dữ liệu.</p>');
    } finally {
        setLoading(selector, false);
    }
}

$(function () {
    initTourList('#js-tour-list');
    initTourList('#js-tour-ngoai-list');
});
```

Hai lần gọi `initTourList` chạy **song song** (mỗi container 1 promise), không chặn nhau.

---

### 3.3. [`frontend/assets/client/js/api/tour.api.js`](../assets/client/js/api/tour.api.js)

Tầng API — chỉ định **endpoint nào** + **payload nào**, không biết DOM.

```js
async function fetchTourList(categoryId = 0) {
    return handleRequest('GET', '/tour/get_list.php', { category_id: categoryId });
}
```

`handleRequest` đã unwrap `response.data` nên giá trị return là object `{ tours: [...] }`, không phải envelope.

---

### 3.4. [`frontend/assets/client/js/utils/http.js`](../assets/client/js/utils/http.js)

Wrapper chung cho mọi AJAX:

```js
const BASE_URL = '/Project/backend/api';

async function handleRequest(method, url, data = {}) {
    try {
        const response = await $.ajax({
            url: BASE_URL + url, method, data, dataType: 'json',
        });
        return response.data;        // bóc envelope
    } catch (err) {
        console.error('FE-HTTP-001', err);
        showToast(err.responseJSON?.message ?? 'Something went wrong', 'error');
        throw err;
    }
}
```

Nguyên tắc: **mọi `$.ajax` phải đi qua đây**. Tầng API chỉ truyền tham số.

---

### 3.5. [`frontend/assets/client/js/components/tour-card.js`](../assets/client/js/components/tour-card.js)

Render layer — **pure function**, nhận object trả về string HTML; không gọi API, không biết URL.

```js
function renderTourCard(tour) {
    const code = String(tour.TourID).padStart(9, '0');
    return `
        <div class="product-item">
            <div class="inner-image">
                <a href="tour-detail.html?tour_id=${tour.TourID}">
                    <img src="${tour.TourThumbnail}" alt="${tour.Title}">
                </a>
            </div>
            <div class="inner-content">
                <h3 class="inner-address">
                    <a href="tour-detail.html?tour_id=${tour.TourID}">${tour.Title}</a>
                </h3>
                <div class="inner-price">
                    <div class="inner-new-price">
                        <span class="price">${formatPrice(tour.CostPerPerson)}</span>
                        <span class="unit">đ</span>
                    </div>
                </div>
                <div class="inner-description">
                    <div class="inner-desc-item">Mã Tour: <b>${code}</b></div>
                    <div class="inner-desc-item">Ngày Khởi Hành: <b>${formatDate(tour.DepartureDate)}</b></div>
                    <div class="inner-desc-item">Thời Gian: <b>${tour.Duration}</b></div>
                </div>
                <div class="inner-rating"><!-- 5 sao cứng --></div>
            </div>
        </div>`;
}

function renderTourCards(tours, selector) {
    $(selector).html(tours.map(renderTourCard).join(''));
}
```

Tham chiếu cột DB ở dạng PascalCase đúng theo [DATABASE.md](../../share-docs/DATABASE.md).

---

### 3.6. [`frontend/assets/client/js/utils/format.js`](../assets/client/js/utils/format.js)

Helper thuần, không side effect:

| Hàm | Ví dụ input | Ví dụ output |
|---|---|---|
| `formatPrice(2590000)` | number/string | `"2.590.000"` (vi-VN locale) |
| `formatDate("2026-07-15")` | YYYY-MM-DD | `"15/07/2026"` |

---

## 4. Tầng BE — chi tiết từng file

### 4.1. [`backend/api/tour/get_list.php`](../../backend/api/tour/get_list.php)

Entry endpoint — chỉ parse input, gọi DB layer, trả response.

```php
<?php
declare(strict_types=1);

require_once '../../includes/response.php';
require_once '../../config/constants.php';
require_once '../../config/db.php';
require_once '../../includes/db_tour.php';

header('Access-Control-Allow-Origin: *');

$category_id = (int)($_GET['category_id'] ?? 0);

try {
    $tours = tour_get_list($pdo, $category_id);
    json_success(['tours' => $tours]);
} catch (PDOException $e) {
    error_log('BE-DB-001 tour/get_list: ' . $e->getMessage());
    json_error('Database error', 500);
}
```

**Không cần auth** — danh sách tour là public.
**Không validation** — `(int)$category_id` tự cast về 0 nếu vô lệ; `0` được DB layer hiểu là "không lọc category".

---

### 4.2. [`backend/includes/db_tour.php`](../../backend/includes/db_tour.php) — `tour_get_list()`

Layer dữ liệu — chỉ chứa SQL, không đọc `$_GET`.

```php
function tour_get_list(PDO $pdo, int $category_id = 0): array
{
    if ($category_id > 0) {
        $stmt = $pdo->prepare(
            "SELECT TourID, Title, Vehicle, Timeline, DeparturePlace,
                    DepartureDate, Duration, CostPerPerson,
                    TourThumbnail, TourStatus, MaxParticipants, CategoryID
             FROM Tour
             WHERE TourStatus = :status
               AND CategoryID = :category_id
             ORDER BY DepartureDate ASC"
        );
        $stmt->execute([
            ':status'      => TOUR_STATUS_AVAILABLE,
            ':category_id' => $category_id,
        ]);
    } else {
        $stmt = $pdo->prepare(
            "SELECT TourID, Title, Vehicle, Timeline, DeparturePlace,
                    DepartureDate, Duration, CostPerPerson,
                    TourThumbnail, TourStatus, MaxParticipants, CategoryID
             FROM Tour
             WHERE TourStatus = :status
             ORDER BY DepartureDate ASC"
        );
        $stmt->execute([':status' => TOUR_STATUS_AVAILABLE]);
    }
    return $stmt->fetchAll();
}
```

**Index DB hỗ trợ query này:**
- `idx_tour_status` trên `TourStatus`
- `idx_tour_categoryid` trên `CategoryID`
- `idx_tour_departuredate` trên `DepartureDate` (để `ORDER BY` không phải sort lại)

---

## 5. Schema DB — bảng `Tour` (cột FE dùng)

Theo [`share-docs/DATABASE.md`](../../share-docs/DATABASE.md):

| Cột | Type | FE đọc ở đâu |
|---|---|---|
| `TourID` | INT PK | Mã tour, link `tour-detail.html?tour_id=` |
| `Title` | VARCHAR(255) | Tên tour trên card |
| `DepartureDate` | DATE | Ngày khởi hành (qua `formatDate`) |
| `Duration` | VARCHAR(100) | Thời gian (vd: "5 Ngày 4 Đêm") |
| `CostPerPerson` | DECIMAL(10,2) | Giá/người (qua `formatPrice`) |
| `TourThumbnail` | VARCHAR(500) | URL ảnh card |
| `TourStatus` | ENUM | Filter ở DB layer (chỉ `Available`) |
| `CategoryID` | INT FK | Filter theo section |

---

## 6. Response envelope

Format chuẩn của `response.php`:

**Thành công:**
```json
{
  "success": true,
  "data": {
    "tours": [
      {
        "TourID": 1,
        "Title": "Tour Hạ Long 3N2Đ",
        "DepartureDate": "2026-07-15",
        "Duration": "3 Ngày 2 Đêm",
        "CostPerPerson": 2590000,
        "TourThumbnail": "...",
        "TourStatus": "Available",
        "MaxParticipants": 30,
        "CategoryID": 1
      }
    ]
  }
}
```

**Lỗi DB:**
```json
{ "success": false, "message": "Database error" }
```
HTTP status 500. `handleRequest` log `FE-HTTP-001` và `showToast` thông báo lỗi.

---

## 7. Các điểm chưa làm / có thể mở rộng

| Mở rộng | Cách thực hiện |
|---|---|
| Filter category động (tab/dropdown) | Thêm UI element, bind change handler gọi lại `initTourList(selector)` với `data-category-id` mới hoặc truyền thẳng vào `fetchTourList(id)` |
| Phân trang (page) | Thêm `?page=N&limit=12` vào endpoint, BE trả thêm `total/page/limit`, FE thêm component `pagination.js` |
| Search (keyword) | Tạo endpoint riêng `tour/search.php` với `?q=` (hoặc thêm tham số vào `get_list.php`); SQL `WHERE Title LIKE :q` |
| Sort theo giá / ngày tăng giảm | Truyền `?sort=price_asc` etc.; whitelist các giá trị ở BE để tránh SQL injection cột |
| Hiển thị "đã đầy chỗ" | Đổi filter SQL bỏ `WHERE TourStatus='Available'` và FE render badge khác cho `Full/Cancelled` |
| Skeleton loading nâng cấp | Thay text "Đang tải..." bằng skeleton card với CSS shimmer |

---

## 8. Quy ước & ràng buộc cần nhớ

- **Layer separation**: `pages/*` không gọi `$.ajax`; `api/*` không động DOM; `components/*` không biết URL/state.
- **PascalCase cột DB**: trong JS phải viết `tour.TourID`, `tour.CostPerPerson` chứ không phải `tour_id` hay `costPerPerson`.
- **Mọi AJAX qua `handleRequest`**, không gọi `$.ajax` trực tiếp ngoài `utils/http.js`.
- **Error code prefix**: FE log `FE-TOUR-*` cho lỗi tour, BE log `BE-DB-*` cho lỗi PDO.
- **Public endpoint**: `/tour/get_list.php` không cần auth, không có session check.
