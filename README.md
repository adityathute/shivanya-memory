# Shivanya Memory

Standalone TypeScript Memory application for ShivanyaMS.

## Architecture

- Frontend: Next.js App Router + TypeScript
- Shared frontend foundation: shivanya-sdk packages
- Authentication: shivanya-auth in token mode
- Backend: Django + Django REST Framework
- Database: PostgreSQL shared with the Shivanya authentication service
- User identity: read-only reference to the auth service user table
- Legacy source reference: shivms Memory implementation

## Local development

Frontend environment:

- NEXT_PUBLIC_AUTH_URL
- NEXT_PUBLIC_MEMORY_API_URL
- NEXT_PUBLIC_MEMORY_API_PREFIX

Backend environment:

- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_HOST
- DB_PORT
- AUTH_JWT_SIGNING_KEY

AUTH_JWT_SIGNING_KEY must match the signing key used by shivanya-auth for its JWT access tokens.

Generate the Memory migrations locally before the first database setup:

python backend/manage.py makemigrations memory
python backend/manage.py migrate

Run the frontend with pnpm --dir frontend dev and the backend with python backend/manage.py runserver 8002.

For local SDK workspace testing, link the latest packages from the shivanya-sdk auth-v2 workspace before installing the frontend dependencies. The application is intentionally configured against the shivanya-auth token client rather than the legacy @shivms/auth package.

## Migration rule

The existing V0 Memory application remains untouched. This repository is the future replacement and can be switched to memory.shivanyams.com only after production testing is complete.
