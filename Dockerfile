# syntax=docker/dockerfile:1

FROM composer:2 AS vendor

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-dist --optimize-autoloader

FROM node:24-alpine AS frontend

WORKDIR /var/www/html

ENV APP_KEY=base64:MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=

RUN apk add --no-cache php php-dom php-mbstring php-pdo_sqlite php-phar php-session php-tokenizer

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
COPY --from=vendor /var/www/html/vendor ./vendor
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php \
    && php artisan package:discover --ansi \
    && php artisan wayfinder:generate --with-form \
    && npm run build

FROM php:8.4-fpm-alpine AS app

WORKDIR /var/www/html

RUN apk add --no-cache \
        curl \
        freetype \
        libjpeg-turbo \
        libpng \
        libpq \
        libwebp \
        su-exec \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        freetype-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        libpq-dev \
        libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" exif gd opcache pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && addgroup -S -g 1000 app \
    && adduser -S -D -u 1000 -G app app

COPY --chown=app:app . .
COPY --from=vendor --chown=app:app /var/www/html/vendor ./vendor
COPY --from=frontend --chown=app:app /var/www/html/public/build ./public/build
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/php/entrypoint /usr/local/bin/app-entrypoint

RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php \
    && php artisan package:discover --ansi \
    && mkdir -p storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views \
    && php artisan storage:link \
    && chmod +x /usr/local/bin/app-entrypoint \
    && chown -R app:app bootstrap/cache storage

ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]

FROM nginxinc/nginx-unprivileged:1.28-alpine AS web

USER root

RUN apk add --no-cache curl

COPY --from=app /var/www/html/public /var/www/html/public
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

USER nginx
