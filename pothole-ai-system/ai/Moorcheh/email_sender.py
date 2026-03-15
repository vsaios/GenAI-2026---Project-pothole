import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from report_generator import generate_report, generate_report_subject
from department_router import get_311_email, get_311_name

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ============================================================
# TESTING_MODE = True  → sends to your own email (safe)
# TESTING_MODE = False → sends to 311@toronto.ca (real)
# ============================================================
TESTING_MODE = True

def send_pothole_report(pothole: dict) -> dict:
    """Generate AI report and email it to 311 Toronto."""

    subject  = generate_report_subject(pothole)
    body     = generate_report(pothole)
    maps_url = f"https://maps.google.com/?q={pothole['lat']},{pothole['lng']}"

    full_body = f"""To: {get_311_name()}

{body}

---
AUTOMATED SYSTEM DATA
Report ID:   #{pothole['id']}
Street:      {pothole['road']}, Toronto
GPS:         {round(pothole['lat'], 6)}, {round(pothole['lng'], 6)}
Severity:    {pothole['severity'].upper()}
Detected:    {pothole['timestamp']}
Maps link:   {maps_url}
System:      StreetSafe Toronto — AI Pothole Monitoring
"""

    # Pick recipient based on mode
    recipient = os.getenv("TEST_EMAIL") if TESTING_MODE else os.getenv("TO_EMAIL", "311@toronto.ca")

    try:
        _send_gmail(
            to=recipient,
            subject=subject,
            body=full_body
        )
        print(f"[Email] ✓ Sent to {recipient}")
        return {
            "subject":    subject,
            "body":       full_body,
            "sent_to":    recipient,
            "status":     "sent",
            "testing":    TESTING_MODE
        }
    except Exception as e:
        print(f"[Email] ✗ Failed: {e}")
        return {
            "subject":    subject,
            "body":       full_body,
            "sent_to":    recipient,
            "status":     f"failed: {str(e)}",
            "testing":    TESTING_MODE
        }

def _send_gmail(to: str, subject: str, body: str):
    """Send email via Gmail SMTP."""
    gmail_user     = os.getenv("GMAIL_USER")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_password:
        raise ValueError("GMAIL_USER or GMAIL_APP_PASSWORD not set in .env")

    msg = MIMEMultipart()
    msg["From"]    = gmail_user
    msg["To"]      = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_password)
        server.send_message(msg)