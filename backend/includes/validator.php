<?php
declare(strict_types=1);

/**
 * Calls json_error(400) if any key in $required is absent or empty in $input.
 *
 * @param array<string, mixed> $input
 * @param string[]             $required
 */
function validate_required(array $input, array $required): void
{
    foreach ($required as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            json_error("Missing required field: {$field}", 400);
        }
    }
}

/**
 * Calls json_error(422) if $value is not a positive integer.
 */
function validate_positive_int(int $value, string $field = 'value'): void
{
    if ($value <= 0) {
        json_error("Field '{$field}' must be a positive integer", 422);
    }
}
