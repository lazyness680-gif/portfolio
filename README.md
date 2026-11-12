# Сайт-портфолио «Ольга Косых»

Одностраничный сайт на чистом HTML / CSS / JS для малого бизнеса:
лендинги, сайты-визитки и автоматизация заявок. Без сборщиков, фреймворков и админки.

- **Боевой сайт:** https://kosyhafrilanser.ru/ (хостинг reg.ru).
- **Техническое превью:** https://lazyness680-gif.github.io/portfolio/ (GitHub Pages, без PHP-формы).

---

## Структура

```
portfolio/
├── index.html          # весь сайт: hero, боли, услуги, кейсы, квиз, цены, FAQ, форма
├── privacy.html        # политика конфиденциальности
├── 404.html            # страница ошибки
├── css/styles.css      # темы, адаптив, все стили
├── js/
│   ├── theme.js        # светлая/тёмная тема
│   ├── quiz.js         # мини-квиз
│   └── main.js         # меню, аккордеоны, анимации, форма
├── api/
│   ├── lead.php        # приём заявок: Telegram + e-mail
│   ├── config.example.php
│   └── config.php      # создаётся вручную, в Git не попадает
├── assets/img/
│   ├── olga.jpg            # фото для hero-блока
│   ├── olga-placeholder.svg # запасная заглушка
│   ├── favicon.svg
│   └── og-image.jpg
├── robots.txt
├── sitemap.xml
├── .htaccess
└── README.md
```

---

## Локальный просмотр

Из папки `portfolio/`:

```bash
python -m http.server 8000
```

Откройте `http://localhost:8000/`.

Форма локально не отправится (нужен PHP), но покажет ошибку и ссылку на Telegram — это нормально. Для проверки отправки нужен PHP 8+:

```bash
php -S localhost:8000
```

---

## Что заменить перед публикацией

### 1. Фото

В hero-блоке стоит портрет `assets/img/olga.jpg` (635×686, ~65 КБ). Если захотите заменить — положите новый портрет в `assets/img/` и обновите путь и размеры в `index.html`:

```html
<img src="assets/img/olga.jpg" alt="Ольга Косых" width="635" height="686" fetchpriority="high">
```

Кадр лучше вертикальный, от 800 px по ширине, JPEG/WebP до 200 КБ. Пропорции рамки заданы в `css/styles.css` (`.photo-frame`, `aspect-ratio`) — подгоните под новое фото, чтобы не обрезать лицо. После замены фото пересоберите `og-image.jpg` (1200×630), чтобы превью в соцсетях совпадало.

### 2. Контакты

Поиском по проекту замените:

- `@Aleka_Olga` — если изменится Telegram;
- `kosyha@list.ru` — если изменится почта;
- `https://github.com/lazyness680-gif` — профиль GitHub.

### 3. Домен

Боевой домен уже прописан: **https://kosyhafrilanser.ru/**. Если он изменится, замените адрес в:

- `index.html` — `canonical`, Open Graph, Twitter Card, JSON-LD;
- `privacy.html` — `canonical` и текст политики;
- `sitemap.xml`;
- `robots.txt`;
- `api/config.example.php` — `email_from`.

### 3.1. DNS и IP на reg.ru

Домен `kosyhafrilanser.ru` указывает на хостинг reg.ru. В панели домена должны быть записи:

| Тип | Имя | Значение |
| --- | --- | --- |
| A | `@` | `31.31.196.39` |
| AAAA | `@` | `2a00:f940:2:2:1:1:0:34` |
| A | `www` | `31.31.196.39` |
| AAAA | `www` | `2a00:f940:2:2:1:1:0:34` |

Если панель reg.ru сама подставляет A-записи хостинга — сверьте, что IPv4 и IPv6 совпадают с указанными. После смены DNS подождите 1–24 часа (обычно 1–2 часа).

### 4. Тексты, кейсы, цены

Всё в `index.html`, секции подписаны комментариями:

- `<!-- PAINS -->` — боли;
- `<!-- SERVICES -->` — услуги;
- `<!-- CASES -->` — кейсы: лендинг для бренда шоколада (реальный, живой сайт [niperom.ru](https://www.niperom.ru/), код [niperom-landing](https://github.com/lazyness680-gif/niperom-landing)), сайт для психолога ([psyhonline-site](https://github.com/lazyness680-gif/psyhonline-site), реальный), магазин «Инструменты» (в работе), ИИ-администратор ВК ([vk-ai-admin-bot](https://github.com/lazyness680-gif/vk-ai-admin-bot), демо), TimeTracker ([TimeTracker](https://github.com/lazyness680-gif/TimeTracker), демо); формат «Было → Сделали → Стало»;
- `<!-- PRICING -->` — пакеты и цены;
- `<!-- FAQ -->` — вопросы и ответы.

Цены пакетов «Сайт + заявки под ключ» и «Автоматизация» пока «по запросу» — впишите, когда определитесь.

### 5. Яндекс.Метрика

1. Создайте счётчик в [Метрике](https://metrika.yandex.ru/).
2. В `index.html` найдите закомментированный блок `Яндекс.Метрика`, замените `XXXXXXXX` на номер счётчика и раскомментируйте.
3. В `js/main.js` в начале файла укажите:

```js
var METRIKA_ID = 12345678; // номер счётчика
```

Цели, которые отправляются автоматически: `lead_submit`, `tg_click`, `quiz_complete`, `quiz_tg_click`, `case_open`, `email_click`. Создайте их в Метрике с такими же идентификаторами.

---

## Telegram-бот для заявок

1. В Telegram откройте [@BotFather](https://t.me/BotFather) → `/newbot` → получите токен.
2. Напишите боту любое сообщение (или добавьте его в группу).
3. Откройте в браузере:

   ```
   https://api.telegram.org/bot<ТОКЕН>/getUpdates
   ```

   и найдите `"chat":{"id":...}`. Для группы id отрицательный.
4. В папке `api/` скопируйте `config.example.php` в `config.php`:

   ```bash
   cp api/config.example.php api/config.php
   ```

5. Заполните:

```php
return [
    'telegram_token'   => '1234567890:AAE...',
    'telegram_chat_id' => '123456789',
    'email_to'         => 'kosyha@list.ru',
    'email_from'       => 'site@ваш-домен.ru',
];
```

6. Отправьте тестовую заявку с сайта — сообщение должно прийти в Telegram, копия — на почту.

> `api/config.php` добавлен в `.gitignore` и не должен попадать в публичный репозиторий.

Если Telegram недоступен, заявка уйдёт на e-mail. Если и почта не настроена — пользователь увидит ссылку на Telegram.

---

## Техническое превью на GitHub Pages

Резервная копия: **https://lazyness680-gif.github.io/portfolio/**

Репозиторий: **https://github.com/lazyness680-gif/portfolio**

Обновление после правок:

```bash
git add -A
git commit -m "Что изменилось"
git push
```

GitHub Pages пересоберёт сайт автоматически за 1–2 минуты (ветка `main`, папка `/`).
На Pages не работают PHP-форма и `.htaccess` — боевая версия живёт на reg.ru.

---

## Деплой на reg.ru

Боевой сайт: **https://kosyhafrilanser.ru/**

| Параметр | Значение |
| --- | --- |
| Домен | `kosyhafrilanser.ru` |
| IPv4 | `31.31.196.39` |
| IPv6 | `2a00:f940:2:2:1:1:0:34` |
| Корень сайта | `public_html/` (или `www/` — как в панели) |
| PHP | 8.0+ |

1. **Домен.** Убедитесь, что домен `kosyhafrilanser.ru` привязан к хостингу reg.ru.
2. **DNS.** Проверьте A/AAAA-записи по таблице из раздела «3.1. DNS и IP на reg.ru».
3. **SSL.** Включите бесплатный SSL Let's Encrypt в панели, дождитесь выпуска и включите редирект на HTTPS.
4. **Загрузка файлов.** Через FTP/SFTP (FileZilla) загрузите **содержимое** папки `portfolio/` в `public_html/` — так, чтобы `index.html` лежал прямо в корне.
5. **Права.** Файлы — `644`, папки — `755`. Файл `.htaccess` загружайте в бинарном режиме.
6. **Конфиг формы.** Скопируйте `api/config.example.php` в `api/config.php`, заполните токен Telegram и chat id (см. раздел «Telegram-бот для заявок»).
7. **Проверка.** Откройте `https://kosyhafrilanser.ru/`, проверьте:
   - тему (светлая/тёмная);
   - меню на телефоне;
   - квиз;
   - раскрытие кейсов и FAQ;
   - отправку формы (Telegram + почта);
   - `https://kosyhafrilanser.ru/404.html` и несуществующий адрес;
   - `robots.txt` и `sitemap.xml`.
8. **Вебмастер.** Добавьте сайт в [Яндекс.Вебмастер](https://webmaster.yandex.ru/), подтвердите домен, отправьте `sitemap.xml`.

### Если хостинг без PHP

Форма не сможет отправлять заявки. Варианты:

- оставить только кнопки Telegram (форма покажет ссылку при ошибке);
- подключить внешний обработчик (Formspree, Getform, Cloudflare Worker);
- использовать GitHub Pages только для превью, а боевую версию — на reg.ru.

---

## Проверка перед сдачей

- [ ] Заменено фото.
- [ ] Заменён домен во всех файлах.
- [ ] Заполнен `api/config.php`, заявка приходит в Telegram и на почту.
- [ ] Включён SSL, работает редирект с `http` и `www`.
- [ ] Метрика установлена, цели созданы и срабатывают.
- [ ] Проверено на телефоне (iOS/Android) и в 4 браузерах.
- [ ] Lighthouse mobile ≥ 90 по всем категориям.
- [ ] Нет непроверенных цифр и обещаний в кейсах.
- [ ] Политика конфиденциальности открывается, чекбокс обязателен.

---

## Технические заметки

- Сайт полностью статический, правки — в коде. Админки нет by design.
- Тёмная тема хранится в `localStorage`, по умолчанию — системная.
- Анимации отключаются при `prefers-reduced-motion: reduce`.
- CSS-переменные тем — в начале `css/styles.css`.
- Кейсы и FAQ — нативные `<details>`, работают без JS.
- Квиз и форма требуют JS; без JS остаются прямые ссылки на Telegram.
- Шрифты — Google Fonts (Lora + Manrope). Можно заменить на локальные, чтобы убрать внешнюю зависимость.
