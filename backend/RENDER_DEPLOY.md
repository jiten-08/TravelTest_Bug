# Render Backend Deploy

Use these settings for the backend web service:

```text
Root Directory: backend
Build Command: bash build.sh
Start Command: gunicorn backend.wsgi:application
```

Required environment variables:

```text
DJANGO_SECRET=your-secret-key
DEBUG=False
```

For a persistent production database, create a Render PostgreSQL database and connect it to
the web service. Render should provide `DATABASE_URL`; the app uses it automatically.

If you prefer individual database variables instead of `DATABASE_URL`, set:

```text
USE_POSTGRES=true
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432
```

If you do not set `DATABASE_URL` or `USE_POSTGRES=true`, the app uses SQLite. SQLite can
work for local development, but Render file storage is not reliable for production data
and can cause 500 errors when creating accounts.
