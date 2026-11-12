<?php
/**
 * Скопируйте этот файл в config.php и заполните значения.
 * config.php не попадает в Git (см. .gitignore).
 *
 * Как получить токен:
 * 1. Откройте @BotFather в Telegram → /newbot → задайте имя.
 * 2. Скопируйте токен вида 1234567890:AAE...
 * 3. Напишите своему боту любое сообщение.
 * 4. Откройте https://api.telegram.org/bot<ТОКЕН>/getUpdates и найдите chat.id.
 *    Для группы добавьте бота в группу и используйте отрицательный id (например, -1001234567890).
 */

if (basename((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === basename(__FILE__)) {
    http_response_code(403);
    exit('Forbidden');
}

return [
    'telegram_token'   => 'ВСТАВЬТЕ_ТОКЕН_БОТА',
    'telegram_chat_id' => 'ВСТАВЬТЕ_CHAT_ID',
    'email_to'         => 'kosyha@list.ru',
    'email_from'       => 'site@kosyhafrilanser.ru',
];
