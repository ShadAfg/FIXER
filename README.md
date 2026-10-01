# FIXER

FIXER is a local services marketplace for discovering providers, publishing service listings, posting reviews, and storing booking requests.

## Features

- Search service categories and provider listings.
- Register and log in with server-side password hashing and signed sessions.
- Create public provider listings with a profile photo.
- Post one review per account for each provider listing.
- Submit booking requests and review requests associated with your customer or provider account.
- Save providers in browser storage.
- Store accounts, listings, reviews, and bookings in SQLite.

Sample provider profiles and their reviews are fictional demonstration content. They are not stored in the server database. FIXER does not currently verify provider credentials or send booking notifications.

## Requirements

- Python 3.10 or newer. The project is tested with Python 3.14.

## Run locally (PowerShell)

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:FIXER_SECRET_KEY = (python -c "import secrets; print(secrets.token_hex(32))")
python app.py
```

Open <http://127.0.0.1:5000>. The SQLite database is created at `instance/fixer.sqlite3` on first start. Keep `FIXER_SECRET_KEY` stable between restarts so existing sessions remain valid.

## Tests

```powershell
python -m unittest discover -s tests -v
```

## API

All mutation routes require the session's CSRF token in the `X-CSRF-Token` header. The frontend obtains it from `GET /api/csrf`.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Health check |
| `GET` | `/api/auth/me` | Public | Current session account |
| `POST` | `/api/auth/register` | Public | Create account and sign in |
| `POST` | `/api/auth/login` | Public | Sign in |
| `POST` | `/api/auth/logout` | Signed in | End session |
| `GET` | `/api/services` | Public | List provider listings and reviews |
| `POST` | `/api/services` | Signed in | Create provider listing |
| `POST` | `/api/services/<id>/reviews` | Signed in | Create a review |
| `GET` | `/api/bookings` | Signed in | List requests for the customer or provider |
| `POST` | `/api/bookings` | Public | Store a booking request |

## Before public deployment

Run behind HTTPS with a production WSGI server, set a strong persistent `FIXER_SECRET_KEY`, and set `FIXER_COOKIE_SECURE=1`. Add rate limiting, account recovery/email verification, provider moderation and credential checks, automated database backups, and an email/SMS notification provider before treating this local MVP as a production marketplace. Do not use Flask's built-in development server for public traffic.
