<?php
declare(strict_types=1);

/**
 * Приём заявок с формы.
 * Основной канал — Telegram, резервный — e-mail.
 * Настройки: скопируйте config.example.php в config.php и заполните.
 */

header('X-Content-Type-Options: nosniff');

$configFile = __DIR__ . '/config.php';
$config = is_file($configFile) ? require $configFile : [];

$telegramToken = getenv('TELEGRAM_BOT_TOKEN') ?: (string)($config['telegram_token'] ?? '');
$telegramChat  = getenv('TELEGRAM_CHAT_ID') ?: (string)($config['telegram_chat_id'] ?? '');
$toEmail       = (string)($config['email_to'] ?? 'kosyha@list.ru');
$fromEmail     = (string)($config['email_from'] ?? ('site@' . ($_SERVER['HTTP_HOST'] ?? 'localhost')));

$isAjax = ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest';

function respond(bool $ok, string $error = '', bool $ajax = true, int $code = 200): void
{
    if (!$ajax) {
        $location = $ok ? '/?sent=1#contact' : '/?error=1#contact';
        header('Location: ' . $location, true, 303);
        exit;
    }

    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Метод не поддерживается', $isAjax, 405);
}

/* ---------- Антиспам: honeypot ---------- */
$honeypot = trim((string)($_POST['website'] ?? ''));
if ($honeypot !== '') {
    // Боту отвечаем «успехом», чтобы он не искал обход
    respond(true, '', $isAjax);
}

/* ---------- Антиспам: слишком быстрая отправка ---------- */
$ts = (int)($_POST['ts'] ?? 0);
if ($ts > 0 && (int)(microtime(true) * 1000) - $ts < 1500) {
    respond(false, 'Похоже на автоматическую отправку. Попробуйте ещё раз.', $isAjax, 429);
}

/* ---------- Проверка источника ---------- */
$host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
$referer = (string)($_SERVER['HTTP_REFERER'] ?? '');
if ($referer !== '') {
    $refHost = strtolower((string)parse_url($referer, PHP_URL_HOST));
    if ($refHost !== '' && $host !== '' && $refHost !== $host) {
        respond(false, 'Запрос с недопустимого источника.', $isAjax, 403);
    }
}

/* ---------- Rate limit: 3 заявки с IP за 10 минут ---------- */
$ip = (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
$rateFile = sys_get_temp_dir() . '/lead_' . hash('sha256', $ip) . '.json';
$now = time();
$stamps = [];
if (is_file($rateFile)) {
    $raw = @file_get_contents($rateFile);
    $decoded = $raw !== false ? json_decode($raw, true) : null;
    if (is_array($decoded)) {
        $stamps = array_values(array_filter($decoded, static fn($t) => is_int($t) && $t > $now - 600));
    }
}
if (count($stamps) >= 3) {
    respond(false, 'Слишком много заявок. Попробуйте через 10 минут или напишите в Telegram.', $isAjax, 429);
}
$stamps[] = $now;
@file_put_contents($rateFile, json_encode($stamps), LOCK_EX);

/* ---------- Данные формы ---------- */
function field(string $key, int $max = 500): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    return mb_substr($value, 0, $max);
}

$name     = field('name', 100);
$contact  = field('contact', 200);
$message  = field('message', 2000);
$task     = field('task', 40);
$page     = field('page', 500);
$utmSource   = field('utm_source', 100);
$utmMedium   = field('utm_medium', 100);
$utmCampaign = field('utm_campaign', 100);
$consent  = (string)($_POST['consent'] ?? '');

if (mb_strlen($name) < 2) {
    respond(false, 'Укажите имя (минимум 2 символа).', $isAjax, 422);
}
if (mb_strlen($contact) < 3) {
    respond(false, 'Укажите способ связи.', $isAjax, 422);
}
if ($consent !== '1') {
    respond(false, 'Нужно согласие на обработку персональных данных.', $isAjax, 422);
}

$tasks = [
    'landing' => 'Лендинг',
    'site-leads' => 'Сайт + заявки под ключ',
    'automation' => 'Автоматизация',
    'unknown' => 'Пока не знает',
];
$taskLabel = $tasks[$task] ?? 'Не указано';

$lines = [
    '🔔 Новая заявка с сайта',
    '',
    'Имя: ' . $name,
    'Связь: ' . $contact,
    'Задача: ' . $taskLabel,
];
if ($message !== '') {
    $lines[] = 'Комментарий: ' . $message;
}
if ($page !== '') {
    $lines[] = 'Страница: ' . $page;
}
if ($utmSource !== '' || $utmMedium !== '' || $utmCampaign !== '') {
    $lines[] = 'UTM: ' . trim($utmSource . ' / ' . $utmMedium . ' / ' . $utmCampaign);
}
$lines[] = 'Дата: ' . date('d.m.Y H:i');

$text = mb_substr(implode("\n", $lines), 0, 3900);

$telegramOk = false;
$emailOk = false;

/* ---------- Telegram ---------- */
if ($telegramToken !== '' && $telegramChat !== '') {
    $url = 'https://api.telegram.org/bot' . $telegramToken . '/sendMessage';
    $payload = [
        'chat_id' => $telegramChat,
        'text' => $text,
        'disable_web_page_preview' => 'true',
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($payload),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);
        $result = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($result === false) {
            error_log('Telegram cURL error: ' . curl_error($ch));
        }
        curl_close($ch);
        $telegramOk = $code >= 200 && $code < 300;
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query($payload),
                'timeout' => 10,
            ],
        ]);
        $result = @file_get_contents($url, false, $context);
        $telegramOk = $result !== false;
    }
} else {
    error_log('Lead form: Telegram token/chat_id не настроены (api/config.php).');
}

/* ---------- E-mail (резерв и дубль) ---------- */
$subject = 'Заявка с сайта: ' . $taskLabel;
$body = $text;
$headers = [
    'From: Сайт Ольги Косых <' . $fromEmail . '>',
    'Reply-To: ' . (filter_var($contact, FILTER_VALIDATE_EMAIL) ? $contact : $fromEmail),
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
];
if (function_exists('mail')) {
    $emailOk = @mail($toEmail, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
}

if (!$telegramOk && !$emailOk) {
    error_log('Lead form: не удалось отправить ни в Telegram, ни на e-mail.');
    respond(false, 'Не удалось отправить заявку. Напишите в Telegram: @Aleka_Olga', $isAjax, 500);
}

respond(true, '', $isAjax);
