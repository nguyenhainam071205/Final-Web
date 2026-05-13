<?php
declare(strict_types=1);

// Tour
const TOUR_STATUS_AVAILABLE = 'Available';
const TOUR_STATUS_FULL      = 'Full';
const TOUR_STATUS_CANCELLED = 'Cancelled';

// Order — DB stores TINYINT/INT (0 = Cancel, 1 = Pending, 2 = Success)
const ORDER_STATUS_CANCEL  = 0;
const ORDER_STATUS_PENDING = 1;
const ORDER_STATUS_SUCCESS = 2;

// User
const USER_ROLE_ADMIN    = 'admin';
const USER_ROLE_CUSTOMER = 'user';

// User.Status uses TINYINT (1 = Active, 0 = Locked)
const USER_STATUS_ACTIVE = 1;
const USER_STATUS_LOCKED = 0;

// Category
const CATEGORY_STATUS_ACTIVE   = 'Active';
const CATEGORY_STATUS_INACTIVE = 'Inactive';

// ZaloPay (OpenAPI v2). Loaded from .env via config/db.php.
define('ZALOPAY_APP_ID',         (int)($_ENV['ZALOPAY_APPID']    ?? 0));
define('ZALOPAY_KEY1',           (string)($_ENV['ZALOPAY_KEY1']   ?? ''));
define('ZALOPAY_KEY2',           (string)($_ENV['ZALOPAY_KEY2']   ?? ''));
define('ZALOPAY_DOMAIN',         (string)($_ENV['ZALOPAY_DOMAIN'] ?? 'https://sb-openapi.zalopay.vn'));
define('ZALOPAY_DOMAIN_WEBSITE', (string)($_ENV['DOMAIN_WEBSITE'] ?? ''));
