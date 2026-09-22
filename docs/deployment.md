# Production deployment

This application runs behind the host Nginx server for `wedding-adis.anggit.dev`. Docker publishes the application only on `127.0.0.1:8112`; the application and its SQLite database remain private to the Compose network and volumes.

## First-time host setup

1. No external database or cache container is required. SQLite, database cache, database sessions, and database queues are persisted in the Compose-managed SQLite volume.
2. Create `/opt/wedding/.env.production` from `.env.production.example`. Generate `APP_KEY` with `php artisan key:generate --show`. Make the file readable only by the deployment user.
3. Add `deploy/nginx/wedding-adis.anggit.dev.location.conf` to the existing TLS server block, then validate and reload host Nginx.

## Deploy a tagged release

1. Check out the release tag and build the images:

   ```sh
   docker compose -f compose.production.yaml build
   ```

2. Run database migrations explicitly before replacing the application:

   ```sh
   docker compose -f compose.production.yaml run --rm app php artisan migrate --force
   ```

3. Start the stack and confirm its health endpoint:

   ```sh
   docker compose -f compose.production.yaml up -d
   curl --fail --header 'Host: wedding-adis.anggit.dev' http://127.0.0.1:8112/up
   ```

4. Create the first Admin interactively, if needed:

   ```sh
   docker compose -f compose.production.yaml exec app php artisan app:create-admin
   ```

Never run `DatabaseSeeder` in production: it creates the development test account.

## Rollback

Check out the previous release tag, rebuild, and start the stack again. Roll back only after confirming that its code is compatible with the current database schema; migrations are intentionally not rolled back automatically.

## Backup status

Automated backups are intentionally deferred. The SQLite volume and `invitation-media` volume are not protected from host loss until an off-host backup destination is added.
