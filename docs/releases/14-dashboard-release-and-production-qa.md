# Dashboard release and production QA

This runbook covers the invitation dashboard release from staging through
production. The `invitations` migration seeds the first published version with
`config/invitation.php` using `insertOrIgnore`; the database row becomes the
source of truth after migration.

## Staging

Run from the application release directory with the staging environment loaded:

```bash
php artisan config:clear
php artisan migrate --force
php artisan storage:link
npm ci
npm run build
php artisan optimize
```

Verify the initial publication before editing any draft:

```bash
php artisan tinker --execute="dump(App\Models\Invitation::query()->where('key', config('invitation.key'))->firstOrFail()->published_content === config('invitation'));"
```

The command must output `true`. Do not run `migrate:fresh` or the default
`db:seed` against staging or production: the default seeder creates a demo
user, while the invitation seed is part of the idempotent migration.

## Staging QA

Automated checks:

```bash
npm run check
npm run types:check
php artisan test
```

Manual browser checks, using a real admin account:

- Open `/admin/invitation`; a guest and a non-admin receive login/403.
- Save a draft and confirm the public root still shows the previous published
  title and content.
- Open draft preview and exercise cover reveal, audio, countdown, RSVP,
  gallery lightbox, gifts copy, story, and a narrow viewport.
- Remove a required field, click Publish, and confirm every returned error is
  shown while the previous public version remains active.
- Publish a valid draft; confirm the admin sees publisher and timestamp, the
  draft is cleared, and `/` shows the new version.
- Try to archive/delete a referenced media asset; confirm the operation is
  rejected. Empty gallery and story collections must remain publishable.

## Production preflight

Before migration, take a database backup and record its location and checksum:

```bash
mkdir -p backups
mysqldump --single-transaction --routines --triggers "$DB_DATABASE" \
  > "backups/invitation-$(date -u +%Y%m%dT%H%M%SZ).sql"
sha256sum backups/invitation-*.sql
```

For SQLite, copy the database while the application is in maintenance mode
instead of using `mysqldump`.

Confirm:

- `APP_ENV=production`, `APP_DEBUG=false`, and `APP_URL` is the HTTPS origin.
- The production database credentials point to the intended database.
- `SESSION_SECURE_COOKIE=true` and the session/cache/queue stores are
  reachable.
- `FILESYSTEM_DISK` is durable and writable; run `storage:link` for the local
  public disk or verify the configured object-storage bucket and public asset
  URL.
- HTTPS terminates correctly and CSS, JavaScript, invitation images, and audio
  load from the production origin.

## Production rollout and fallback

1. Enable maintenance mode if the deployment platform needs a write pause.
2. Deploy the application release.
3. Run `php artisan migrate --force`, then `php artisan storage:link` and
   `php artisan optimize`.
4. Check `/up`, the public root, and `/admin/invitation` before disabling
   maintenance mode.
5. If migration or smoke checks fail, keep the previous application release
   and restore the recorded database backup only when the migration changed
   data. Re-run the public-root check before reopening traffic.

The fallback configuration source is `config/invitation.php`: if no managed
row exists, `Invitation::contentForGuests()` falls back to it. Never delete a
valid managed row as a rollback shortcut; restore the backup or redeploy the
previous release instead.

## Release record

- Staging migration/time:
- Staging parity check:
- Staging QA owner:
- Production backup/checksum:
- Production migration/time:
- Production smoke-test owner:
- Rollback decision/owner:
