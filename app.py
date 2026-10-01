from __future__ import annotations

import base64
import binascii
import os
import re
import secrets
import sqlite3
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from functools import wraps
from pathlib import Path
from typing import Any, Callable

from flask import Flask, g, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash


BASE_DIR = Path(__file__).resolve().parent
CATEGORIES = {
    "Construction", "Carpentry", "Electrical", "Plumbing", "Agriculture & Farming",
    "Cleaning", "Painting & Design", "AC & Cooling", "Lock & Security", "Auto Repair",
    "Packers & Movers", "General Labor", "Other",
}
PHONE_PATTERN = re.compile(r"^[0-9+() -]{7,20}$")
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHOTO_PREFIXES = {
    "data:image/jpeg;base64": ("image/jpeg", b"\xff\xd8\xff"),
    "data:image/png;base64": ("image/png", b"\x89PNG\r\n\x1a\n"),
    "data:image/webp;base64": ("image/webp", b"RIFF"),
}


class ApiError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.status_code = status_code


def create_app(test_config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__, static_folder=None)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("FIXER_SECRET_KEY") or secrets.token_urlsafe(48),
        DATABASE=os.environ.get("FIXER_DATABASE") or str(BASE_DIR / "instance" / "fixer.sqlite3"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("FIXER_COOKIE_SECURE", "0") == "1",
        PERMANENT_SESSION_LIFETIME=60 * 60 * 24 * 7,
        MAX_CONTENT_LENGTH=3 * 1024 * 1024,
    )
    if test_config:
        app.config.update(test_config)

    initialize_database(app.config["DATABASE"])

    def get_db() -> sqlite3.Connection:
        if "db" not in g:
            connection = sqlite3.connect(app.config["DATABASE"])
            connection.row_factory = sqlite3.Row
            connection.execute("PRAGMA foreign_keys = ON")
            g.db = connection
        return g.db

    @app.teardown_appcontext
    def close_db(_error: BaseException | None = None) -> None:
        connection = g.pop("db", None)
        if connection is not None:
            connection.close()

    @app.before_request
    def require_csrf_token():
        if request.path.startswith("/api/") and request.method not in {"GET", "HEAD", "OPTIONS"}:
            expected = session.get("csrf_token", "")
            provided = request.headers.get("X-CSRF-Token", "")
            if not expected or not secrets.compare_digest(expected, provided):
                return jsonify(error="Your session token is missing or expired. Refresh the page and try again."), 400
        return None

    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        return jsonify(error=str(error)), error.status_code

    @app.errorhandler(413)
    def handle_large_request(_error: Exception):
        return jsonify(error="The uploaded profile photo is too large."), 413

    def json_body() -> dict[str, Any]:
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            raise ApiError("Send a JSON object.")
        return payload

    def required_text(payload: dict[str, Any], field: str, limit: int) -> str:
        value = payload.get(field)
        if not isinstance(value, str) or not value.strip():
            raise ApiError(f"{field} is required.")
        value = value.strip()
        if len(value) > limit:
            raise ApiError(f"{field} must be {limit} characters or fewer.")
        return value

    def current_user() -> sqlite3.Row | None:
        user_id = session.get("user_id")
        if not user_id:
            return None
        return get_db().execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)
        ).fetchone()

    def login_required(handler: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(handler)
        def wrapped(*args: Any, **kwargs: Any):
            user = current_user()
            if user is None:
                raise ApiError("Log in to continue.", 401)
            g.current_user = user
            return handler(*args, **kwargs)
        return wrapped

    def public_user(user: sqlite3.Row) -> dict[str, str]:
        return {"id": user["id"], "name": user["name"], "email": user["email"]}

    def csrf_token() -> str:
        token = session.get("csrf_token")
        if not token:
            token = secrets.token_urlsafe(32)
            session["csrf_token"] = token
        return token

    def service_json(row: sqlite3.Row, reviews: list[dict[str, Any]]) -> dict[str, Any]:
        return {
            "id": row["id"],
            "fullName": row["full_name"],
            "profilePhoto": row["profile_photo"],
            "name": row["name"],
            "category": row["category"],
            "description": row["description"],
            "location": row["location"],
            "hourlyRate": row["hourly_rate"],
            "currency": row["currency"],
            "phone": row["phone"],
            "experience": row["experience"],
            "certification": row["certification"],
            "reviews": reviews,
        }

    @app.get("/")
    @app.get("/index.html")
    def index_page():
        return send_from_directory(BASE_DIR, "index.html")

    @app.get("/fixer-info.html")
    def info_page():
        return send_from_directory(BASE_DIR, "fixer-info.html")

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.get("/api/csrf")
    def get_csrf_token():
        return jsonify(csrfToken=csrf_token())

    @app.get("/api/auth/me")
    def get_current_user():
        user = current_user()
        return jsonify(user=public_user(user) if user else None)

    @app.post("/api/auth/register")
    def register():
        payload = json_body()
        name = required_text(payload, "name", 80)
        email = required_text(payload, "email", 254).lower()
        password = payload.get("password")
        if not EMAIL_PATTERN.fullmatch(email):
            raise ApiError("Enter a valid email address.")
        if not isinstance(password, str) or len(password) < 8 or len(password) > 256:
            raise ApiError("Password must be between 8 and 256 characters.")
        user_id = str(uuid.uuid4())
        try:
            get_db().execute(
                "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                (user_id, name, email, generate_password_hash(password), datetime.now(timezone.utc).isoformat(timespec="seconds")),
            )
            get_db().commit()
        except sqlite3.IntegrityError:
            raise ApiError("An account with this email already exists. Try logging in.", 409) from None
        user = get_db().execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        session.clear()
        session.permanent = True
        session["user_id"] = user_id
        return jsonify(user=public_user(user), csrfToken=csrf_token()), 201

    @app.post("/api/auth/login")
    def login():
        payload = json_body()
        email = required_text(payload, "email", 254).lower()
        password = payload.get("password")
        user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not isinstance(password, str) or not check_password_hash(user["password_hash"], password):
            raise ApiError("Incorrect email or password.", 401)
        session.clear()
        session.permanent = True
        session["user_id"] = user["id"]
        return jsonify(user=public_user(user), csrfToken=csrf_token())

    @app.post("/api/auth/logout")
    def logout():
        session.clear()
        return jsonify(ok=True)

    @app.get("/api/services")
    def list_services():
        db = get_db()
        rows = db.execute(
            "SELECT services.*, users.name AS account_name FROM services "
            "JOIN users ON users.id = services.user_id ORDER BY services.created_at DESC"
        ).fetchall()
        review_rows = db.execute(
            "SELECT reviews.*, users.name AS reviewer_name FROM reviews "
            "JOIN users ON users.id = reviews.user_id ORDER BY reviews.created_at DESC"
        ).fetchall()
        reviews_by_service: dict[str, list[dict[str, Any]]] = {}
        for review in review_rows:
            reviews_by_service.setdefault(review["service_id"], []).append({
                "id": review["id"], "serviceId": review["service_id"],
                "name": review["reviewer_name"], "rating": review["rating"],
                "comment": review["comment"], "createdAt": review["created_at"],
            })
        return jsonify(services=[
            service_json(row, reviews_by_service.get(row["id"], [])) for row in rows
        ])

    @app.post("/api/services")
    @login_required
    def create_service():
        payload = json_body()
        full_name = required_text(payload, "fullName", 80)
        name = required_text(payload, "name", 60)
        category = required_text(payload, "category", 60)
        description = required_text(payload, "description", 140)
        location = required_text(payload, "location", 80)
        phone = required_text(payload, "phone", 20)
        certification = payload.get("certification", "")
        certification = certification.strip() if isinstance(certification, str) else ""
        if len(certification) > 120:
            raise ApiError("Certification must be 120 characters or fewer.")
        if category not in CATEGORIES:
            raise ApiError("Choose a valid service category.")
        if not PHONE_PATTERN.fullmatch(phone):
            raise ApiError("Enter a valid phone number.")
        try:
            rate = Decimal(str(payload.get("hourlyRate", "")))
            experience = int(payload.get("experience"))
        except (InvalidOperation, TypeError, ValueError):
            raise ApiError("Enter a valid hourly rate and years of experience.") from None
        if not rate.is_finite() or rate < 0 or rate > 1_000_000:
            raise ApiError("Hourly rate must be between 0 and 1,000,000.")
        if experience < 0 or experience > 80:
            raise ApiError("Experience must be between 0 and 80 years.")
        photo = payload.get("profilePhoto", "")
        if not isinstance(photo, str):
            raise ApiError("Profile photo must be an image.")
        if photo:
            try:
                prefix, encoded = photo.split(",", 1)
                mime, signature = PHOTO_PREFIXES[prefix]
                image_bytes = base64.b64decode(encoded, validate=True)
            except (ValueError, KeyError, binascii.Error):
                raise ApiError("Upload a valid JPEG, PNG, or WebP profile photo.") from None
            if len(image_bytes) > 1_200_000 or not image_bytes.startswith(signature):
                raise ApiError("Profile photo must be a valid image smaller than 1.2 MB.")
            photo = f"data:{mime};base64,{encoded}"
        service_id = str(uuid.uuid4())
        user = g.current_user
        created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        get_db().execute(
            "INSERT INTO services (id, user_id, full_name, name, category, description, location, "
            "hourly_rate, currency, phone, experience, certification, profile_photo, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (service_id, user["id"], full_name, name, category, description, location,
             str(rate), "INR", phone, experience, certification, photo, created_at),
        )
        get_db().commit()
        row = get_db().execute("SELECT * FROM services WHERE id = ?", (service_id,)).fetchone()
        return jsonify(service=service_json(row, [])), 201

    @app.post("/api/services/<service_id>/reviews")
    @login_required
    def create_review(service_id: str):
        payload = json_body()
        try:
            rating = int(payload.get("rating"))
        except (TypeError, ValueError):
            raise ApiError("Choose a rating from 1 to 5.") from None
        comment = required_text(payload, "comment", 500)
        if rating < 1 or rating > 5:
            raise ApiError("Choose a rating from 1 to 5.")
        db = get_db()
        service = db.execute("SELECT id FROM services WHERE id = ?", (service_id,)).fetchone()
        if service is None:
            raise ApiError("This provider is not available for reviews.", 404)
        review_id = str(uuid.uuid4())
        user = g.current_user
        try:
            db.execute(
                "INSERT INTO reviews (id, service_id, user_id, rating, comment, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (review_id, service_id, user["id"], rating, comment,
                 datetime.now(timezone.utc).isoformat(timespec="seconds")),
            )
            db.commit()
        except sqlite3.IntegrityError:
            raise ApiError("You have already reviewed this provider.", 409) from None
        return jsonify(review={
            "id": review_id, "serviceId": service_id, "name": user["name"],
            "rating": rating, "comment": comment,
        }), 201

    @app.route("/api/bookings", methods=["GET", "POST"])
    def bookings():
        if request.method == "GET":
            user = current_user()
            if user is None:
                raise ApiError("Log in to view your booking requests.", 401)
            rows = get_db().execute(
                "SELECT DISTINCT bookings.* FROM bookings "
                "LEFT JOIN services ON services.id = bookings.service_id "
                "WHERE bookings.customer_user_id = ? OR services.user_id = ? "
                "ORDER BY bookings.created_at DESC",
                (user["id"], user["id"]),
            ).fetchall()
            return jsonify(bookings=[dict(row) for row in rows])

        payload = json_body()
        service_id = payload.get("serviceId") or None
        requested_service = required_text(payload, "requestedService", 80)
        requested_provider = payload.get("requestedProvider", "")
        if not isinstance(requested_provider, str) or len(requested_provider) > 80:
            raise ApiError("Provider name must be 80 characters or fewer.")
        service = None
        if service_id:
            service = get_db().execute("SELECT id, name, full_name FROM services WHERE id = ?", (service_id,)).fetchone()
            if service is None:
                raise ApiError("This provider is not available for booking.", 404)
            requested_service = service["name"]
            requested_provider = service["full_name"]
        customer_name = required_text(payload, "customerName", 80)
        customer_email = required_text(payload, "customerEmail", 254).lower()
        customer_phone = required_text(payload, "customerPhone", 20)
        location = required_text(payload, "location", 240)
        details = required_text(payload, "details", 500)
        booking_date = required_text(payload, "date", 10)
        booking_time = required_text(payload, "time", 5)
        if not EMAIL_PATTERN.fullmatch(customer_email):
            raise ApiError("Enter a valid email address.")
        if not PHONE_PATTERN.fullmatch(customer_phone):
            raise ApiError("Enter a valid phone number.")
        try:
            parsed_date = date.fromisoformat(booking_date)
            datetime.strptime(booking_time, "%H:%M")
        except ValueError:
            raise ApiError("Enter a valid preferred date and time.") from None
        if parsed_date < date.today():
            raise ApiError("Choose today or a future date.")
        booking_id = str(uuid.uuid4())
        customer_user_id = session.get("user_id")
        created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        get_db().execute(
            "INSERT INTO bookings (id, service_id, customer_user_id, requested_service, requested_provider, "
            "customer_name, customer_email, customer_phone, location, booking_date, booking_time, details, status, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (booking_id, service_id, customer_user_id, requested_service, requested_provider,
             customer_name, customer_email, customer_phone, location, booking_date, booking_time,
             details, "requested", created_at),
        )
        get_db().commit()
        return jsonify(booking={
            "id": booking_id, "reference": booking_id.split("-")[0].upper(),
            "status": "requested", "requestedService": requested_service,
        }), 201

    return app


def initialize_database(database_path: str) -> None:
    path = Path(database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    try:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS services (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                full_name TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                hourly_rate TEXT NOT NULL,
                currency TEXT NOT NULL,
                phone TEXT NOT NULL,
                experience INTEGER NOT NULL,
                certification TEXT NOT NULL DEFAULT '',
                profile_photo TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                comment TEXT NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE (service_id, user_id)
            );
            CREATE TABLE IF NOT EXISTS bookings (
                id TEXT PRIMARY KEY,
                service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
                customer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
                requested_service TEXT NOT NULL,
                requested_provider TEXT NOT NULL DEFAULT '',
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                location TEXT NOT NULL,
                booking_date TEXT NOT NULL,
                booking_time TEXT NOT NULL,
                details TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS services_category_idx ON services(category);
            CREATE INDEX IF NOT EXISTS reviews_service_idx ON reviews(service_id);
            CREATE INDEX IF NOT EXISTS bookings_service_idx ON bookings(service_id);
            """
        )
    finally:
        connection.close()


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
