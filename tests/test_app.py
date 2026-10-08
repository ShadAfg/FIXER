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

    def post_json(self, path, payload, token=None, client=None):
        return (client or self.client).post(
            path,
            json=payload,
            headers={"X-CSRF-Token": token or self.csrf_token},
        )

    def patch_json(self, path, payload, token=None, client=None):
        return (client or self.client).patch(
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
        provider = self.register("provider@example.com")
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
        self.assertTrue(service["isOwner"])
        listed = self.client.get("/api/services").json["services"]
        self.assertEqual(len(listed), 1)
        self.assertEqual(listed[0]["id"], service["id"])
        self_review = self.post_json(f"/api/services/{service['id']}/reviews", {
            "rating": 5, "comment": "Providers cannot review their own listings."
        })
        self.assertEqual(self_review.status_code, 403)
        self_booking = self.post_json("/api/bookings", {
            "serviceId": service["id"], "requestedService": service["name"],
            "customerPhone": "+92 300 1234567", "location": "Lahore",
            "date": (date.today() + timedelta(days=1)).isoformat(), "time": "10:30",
            "details": "Providers cannot book their own listings.",
        })
        self.assertEqual(self_booking.status_code, 400)

        customer_client = self.app.test_client()
        customer_token = customer_client.get("/api/csrf").json["csrfToken"]
        customer_response = self.post_json("/api/auth/register", {
            "name": "Test Customer",
            "email": "customer@example.com",
            "password": "test-password-123",
        }, token=customer_token, client=customer_client)
        self.assertEqual(customer_response.status_code, 201, customer_response.get_json())
        customer_token = customer_response.json["csrfToken"]
        self.assertFalse(customer_client.get("/api/services").json["services"][0]["isOwner"])

        update_payload = {
            "fullName": "Test Provider", "name": "Home Electrical Repairs", "category": "Electrical",
            "description": "Residential wiring and light repair.", "location": "Lahore",
            "hourlyRate": "1900", "phone": "+92 300 1234567", "experience": 8,
            "certification": "", "profilePhoto": "",
        }
        owner_update = self.patch_json(f"/api/services/{service['id']}", update_payload)
        self.assertEqual(owner_update.status_code, 200, owner_update.get_json())
        self.assertEqual(owner_update.json["service"]["name"], "Home Electrical Repairs")
        foreign_update = self.patch_json(
            f"/api/services/{service['id']}", update_payload,
            token=customer_token, client=customer_client,
        )
        self.assertEqual(foreign_update.status_code, 403)

        review_response = self.post_json(f"/api/services/{service['id']}/reviews", {
            "rating": 5,
            "comment": "Clear communication and careful work.",
        }, token=customer_token, client=customer_client)
        self.assertEqual(review_response.status_code, 201, review_response.get_json())
        self.assertEqual(
            customer_client.get("/api/services").json["services"][0]["reviews"][0]["name"],
            "Test Customer",
        )
        duplicate_review = self.post_json(f"/api/services/{service['id']}/reviews", {
            "rating": 4,
            "comment": "A second review should not be accepted.",
        }, token=customer_token, client=customer_client)
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
        }, token=customer_token, client=customer_client)
        self.assertEqual(booking_response.status_code, 201, booking_response.get_json())
        self.assertEqual(booking_response.json["booking"]["status"], "requested")
        provider_bookings = self.client.get("/api/bookings").json["bookings"]
        customer_bookings = customer_client.get("/api/bookings").json["bookings"]
        self.assertEqual(len(provider_bookings), 1)
        self.assertEqual(len(customer_bookings), 1)
        self.assertTrue(provider_bookings[0]["is_provider"])
        self.assertTrue(customer_bookings[0]["is_customer"])

        provider_update = self.patch_json(
            f"/api/bookings/{booking_response.json['booking']['id']}",
            {"status": "accepted"},
        )
        self.assertEqual(provider_update.status_code, 200, provider_update.get_json())
        self.assertEqual(customer_client.get("/api/bookings").json["bookings"][0]["status"], "accepted")
        customer_cancel = self.patch_json(
            f"/api/bookings/{booking_response.json['booking']['id']}",
            {"status": "cancelled"}, token=customer_token, client=customer_client,
        )
        self.assertEqual(customer_cancel.status_code, 200, customer_cancel.get_json())

        provider_cannot_cancel = self.patch_json(
            f"/api/bookings/{booking_response.json['booking']['id']}",
            {"status": "cancelled"},
        )
        self.assertEqual(provider_cannot_cancel.status_code, 409)
        completion_request = self.post_json("/api/bookings", {
            "serviceId": service["id"], "requestedService": service["name"],
            "customerPhone": "+92 300 1234567", "location": "10 Main Street, Lahore",
            "date": (date.today() + timedelta(days=2)).isoformat(), "time": "11:30",
            "details": "Please install a new wall light.",
        }, token=customer_token, client=customer_client)
        self.assertEqual(completion_request.status_code, 201, completion_request.get_json())
        completion_id = completion_request.json["booking"]["id"]
        self.assertEqual(self.patch_json(
            f"/api/bookings/{completion_id}", {"status": "accepted"}
        ).status_code, 200)
        completion_response = self.patch_json(
            f"/api/bookings/{completion_id}", {"status": "completed"}
        )
        self.assertEqual(completion_response.status_code, 200, completion_response.get_json())
        provider_notifications = self.client.get("/api/notifications").json["notifications"]
        self.assertGreaterEqual(len(provider_notifications), 1)
        self.assertEqual(provider_notifications[0]["event"], "booking_received")

        archived = self.client.delete(
            f"/api/services/{service['id']}", headers={"X-CSRF-Token": self.csrf_token}
        )
        self.assertEqual(archived.status_code, 200, archived.get_json())
        self.assertEqual(self.client.get("/api/services").json["services"], [])
        self.assertEqual(len(self.client.get("/api/bookings").json["bookings"]), 2)

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
        self.assertEqual(self.patch_json("/api/services/not-a-service", {}).status_code, 401)
        self.assertEqual(
            self.client.delete(
                "/api/services/not-a-service", headers={"X-CSRF-Token": self.csrf_token}
            ).status_code,
            401,
        )

    def test_booking_rejects_invalid_phone_and_past_date(self):
        self.register()
        payload = {
            "requestedService": "Plumbing", "requestedProvider": "",
            "customerName": "Test Customer", "customerEmail": "customer@example.com",
            "customerPhone": "bad-phone", "location": "Lahore",
            "date": (date.today() - timedelta(days=1)).isoformat(),
            "time": "10:30", "details": "Fix a leaking tap.",
        }
        response = self.post_json("/api/bookings", payload)
        self.assertEqual(response.status_code, 400)
        payload["customerPhone"] = "+92 300 1234567"
        response = self.post_json("/api/bookings", payload)
        self.assertEqual(response.status_code, 400)

    def test_guest_cannot_create_booking(self):
        response = self.post_json("/api/bookings", {
            "requestedService": "Plumbing", "customerPhone": "+92 300 1234567",
            "location": "Lahore", "date": (date.today() + timedelta(days=1)).isoformat(),
            "time": "10:30", "details": "Fix a leaking tap.",
        })
        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
