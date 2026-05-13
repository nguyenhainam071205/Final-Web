<?php
declare(strict_types=1);

/**
 * ZaloPay OpenAPI v2 helper. All ZaloPay-specific logic lives here.
 * Reads ZALOPAY_* constants defined in config/constants.php.
 */

/**
 * Build a ZaloPay app_trans_id of the form "yymmdd_<order_id>".
 * Date is in Asia/Ho_Chi_Minh (GMT+7) per ZaloPay spec.
 */
function zalopay_build_app_trans_id(int $order_id): string
{
    $date = (new DateTime('now', new DateTimeZone('Asia/Ho_Chi_Minh')))->format('ymd');
    return $date . '_' . $order_id;
}

/**
 * Inverse of zalopay_build_app_trans_id — pull the OrderID out of an app_trans_id.
 * Returns null if the format is unrecognised.
 */
function zalopay_parse_order_id_from_trans(string $app_trans_id): ?int
{
    $parts = explode('_', $app_trans_id, 2);
    if (count($parts) !== 2) return null;
    if (!ctype_digit($parts[1])) return null;
    return (int)$parts[1];
}

/**
 * Compute the create-order MAC.
 *   data = app_id|app_trans_id|app_user|amount|app_time|embed_data|item
 *   mac  = HMAC_SHA256(key1, data)
 */
function zalopay_sign_create(array $payload): string
{
    $data = $payload['app_id']
          . '|' . $payload['app_trans_id']
          . '|' . $payload['app_user']
          . '|' . $payload['amount']
          . '|' . $payload['app_time']
          . '|' . $payload['embed_data']
          . '|' . $payload['item'];
    return hash_hmac('sha256', $data, ZALOPAY_KEY1);
}

/**
 * Verify a callback. ZaloPay sends `{ data: <json string>, mac: <hex> }`.
 * The MAC is computed over the raw `data` string with key2.
 */
function zalopay_verify_callback(string $data_raw, string $mac): bool
{
    $expected = hash_hmac('sha256', $data_raw, ZALOPAY_KEY2);
    return hash_equals($expected, $mac);
}

/**
 * POSTs form-encoded params and decodes the JSON response.
 *
 * @return array<string, mixed>
 * @throws RuntimeException on transport error or non-JSON response
 */
function zalopay_post(string $url, array $form): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($form),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT        => 15,
    ]);
    $body = curl_exec($ch);
    if ($body === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException('ZaloPay HTTP error: ' . $err);
    }
    curl_close($ch);
    $decoded = json_decode((string)$body, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('ZaloPay non-JSON response: ' . substr((string)$body, 0, 200));
    }
    return $decoded;
}

/**
 * Build the ZaloPay /v2/create payload, POST it, and return the decoded response.
 *
 * @param array<int, array{TourID:int, Title:string, Quantity:int, PriceAtBooking:float}> $items
 * @return array<string, mixed>
 */
function zalopay_create_order(int $order_id, float $amount, string $app_user, array $items): array
{
    $app_trans_id = zalopay_build_app_trans_id($order_id);

    $embed_data_arr = [
        'redirecturl' => rtrim(ZALOPAY_DOMAIN_WEBSITE, '/') . '/Project/frontend/client/payment-result.html',
    ];
    $item_arr = array_map(fn($it) => [
        'itemid'       => (string)$it['TourID'],
        'itemname'     => $it['Title'],
        'itemprice'    => (int)round($it['PriceAtBooking']),
        'itemquantity' => $it['Quantity'],
    ], $items);

    $payload = [
        'app_id'       => ZALOPAY_APP_ID,
        'app_trans_id' => $app_trans_id,
        'app_user'     => $app_user !== '' ? $app_user : ('user_' . $order_id),
        'app_time'     => (int)round(microtime(true) * 1000),
        'amount'       => (int)round($amount),
        'description'  => 'Thanh toan don hang #' . $order_id,
        'bank_code'    => '',
        'embed_data'   => json_encode($embed_data_arr, JSON_UNESCAPED_UNICODE),
        'item'         => json_encode($item_arr, JSON_UNESCAPED_UNICODE),
        'callback_url' => rtrim(ZALOPAY_DOMAIN_WEBSITE, '/') . '/Project/backend/api/booking/zalopay_callback.php',
    ];
    $payload['mac'] = zalopay_sign_create($payload);

    $response = zalopay_post(rtrim(ZALOPAY_DOMAIN, '/') . '/v2/create', $payload);
    $response['_app_trans_id'] = $app_trans_id;
    return $response;
}
