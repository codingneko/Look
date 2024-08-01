FROM php:8.2-apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

RUN rm -rf /var/www/html/* && \
    apt-get update && \
    apt-get upgrade && \
    apt-get install -y bash curl nodejs npm

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

COPY app /var/www/html

RUN cd /var/www/html && \
    composer install && \
    composer clear-cache

RUN apt-get update && apt-get install -y \
    libbz2-dev \
    libfreetype6-dev \
    libicu-dev \
    libjpeg-dev \
    libmcrypt-dev \
    libpng-dev \
    libonig-dev \
    libzip-dev \
    libreadline-dev \
    sudo \
    zip \
 && rm -rf /var/lib/apt/lists/*

COPY crawler .

RUN npm i && \
    npm i -g npx && \
    npx tsc

CMD [ "node", "dist/crawler.js"]
