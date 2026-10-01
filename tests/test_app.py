import tempfile
import unittest
from contextlib import closing
from datetime import date, timedelta
from pathlib import Path

from app import create_app


class BackendApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        database = Path(self.temp_dir.name) / "test.sqlite3"
        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "test-only-secret",
            "DATABASE": str(database),
            "SESSION_COOKIE_SECURE": False,
        })
        self.client = self.app.test_client()
        self.csrf_token = self.client.get("/api/csrf").json["csrfToken"]

    def tearDown(self):
        self.temp_dir.cleanup()

    def post_json(self, path, payload, token=None):
        return self.client.post(
            path,
            json=payload,
            headers={"X-CSRF-Token": token or self.csrf_token},
        )

    def register(self, email="customer@example.com"):
        response = self.post_json("/api/auth/register", {
            "name": "Test Customer",
            "email": email,
            "password": "test-password-123",
        })
        self.assertEqual(response.status_code, 201, response.get_json())
        self.csrf_token = response.json["csrfToken"]
        return response.json["user"]

    def test_csrf_is_required_for_mutations(self):
        response = self.client.post("/api/auth/register", json={
            "name": "Test Customer",
            "email": "customer@example.com",
            "password": "test-password-123",
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("session token", response.json["error"])

    def test_registration_hashes_password_and_rejects_duplicate_email(self):
        self.register()
        duplicate = self.post_json("/api/auth/register", {
            "name": "Another Customer",
            "email": "CUSTOMER@example.com",
            "password": "another-password-123",
        })
        self.assertEqual(duplicate.status_code, 409)
        with self.app.app_context():
            from flask import current_app
            import sqlite3

            with closing(sqlite3.connect(current_app.config["DATABASE"])) as connection:
                password_hash = connection.execute(
                    "SELECT password_hash FROM users WHERE email = ?",
                    ("customer@example.com",),
                ).fetchone()[0]
        self.assertNotEqual(password_hash, "test-password-123")
        self.assertTrue(password_hash.startswith("scrypt:"))

    def test_provider_review_and_booking_round_trip(self):
        self.register()
        service_response = self.post_json("/api/services", {
            "fullName": "Test Provider",
            "name": "Home Electrician",
            "category": "Electrical",
            "description": "Residential wiring and light repair.",
            "location": "Lahore",
            "hourlyRate": "1800",
            "phone": "+92 300 1234567",
            "experience": "7",
            "certification": "",
            "profilePhoto": "",
        })
        self.assertEqual(service_response.status_code, 201, service_response.get_json())
        service = service_response.json["service"]
        listed = self.client.get("/api/services").json["services"]
        self.assertEqual(len(listed), 1)
        self.assertEqual(listed[0]["id"], service["id"])

        review_response = self.post_json(f"/api/services/{service['id']}/reviews", {
            "rating": 5,
            "comment": "Clear communication and careful work.",
        })
        self.assertEqual(review_response.status_code, 201, review_response.get_json())
        self.assertEqual(
            self.client.get("/api/services").json["services"][0]["reviews"][0]["name"],
            "Test Customer",
        )
        duplicate_review = self.post_json(f"/api/services/{service['id']}/reviews", {
            "rating": 4,
            "comment": "A second review should not be accepted.",
        })
        self.assertEqual(duplicate_review.status_code, 409)

        booking_response = self.post_json("/api/bookings", {
            "serviceId": service["id"],
            "requestedService": service["name"],
            "requestedProvider": service["fullName"],
            "customerName": "Test Customer",
            "customerEmail": "customer@example.com",
            "customerPhone": "+92 300 1234567",
            "location": "10 Main Street, Lahore",
            "date": (date.today() + timedelta(days=1)).isoformat(),
            "time": "10:30",
            "details": "Please check a faulty wall switch.",
        })
        self.assertEqual(booking_response.status_code, 201, booking_response.get_json())
        self.assertEqual(booking_response.json["booking"]["status"], "requested")
        self.assertEqual(len(self.client.get("/api/bookings").json["bookings"]), 1)

    def test_listing_and_review_creation_require_login(self):
        service_payload = {
            "fullName": "Test Provider", "name": "Home Electrician", "category": "Electrical",
            "description": "Residential wiring and light repair.", "location": "Lahore",
            "hourlyRate": "1800", "phone": "+92 300 1234567", "experience": 7,
        }
        self.assertEqual(self.post_json("/api/services", service_payload).status_code, 401)
        self.assertEqual(
            self.post_json("/api/services/not-a-service/reviews", {"rating": 5, "comment": "Good work."}).status_code,
            401,
        )

    def test_booking_rejects_invalid_phone_and_past_date(self):
        payload = {
            "requestedService": "Plumbing", "requestedProvider": "",
            "customerName": "Test Customer", "customerEmail": "customer@example.com",
            "customerPhone": "bad-phone", "location": "Lahore",
            "date": (date.today() - timedelta(days=1)).isoformat(),
            "time": "10:30", "details": "Fix a leaking tap.",
        }
        response = self.post_json("/api/bookings", payload)
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
