import os
import mimetypes
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
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
    """Generate AI report and email it to 311 Toronto, with optional image attachment."""

    subject  = generate_report_subject(pothole)
    body     = generate_report(pothole)
    maps_url = f"https://maps.google.com/?q={pothole['lat']},{pothole['lng']}"

    issue_type = pothole.get("issue_type", "pothole").title()
    full_body = f"""To: {get_311_name()}

{body}

---
AUTOMATED SYSTEM DATA
Report ID:   #{pothole['id']}
Issue Type:  {issue_type}
Street:      {pothole['road']}, Toronto
GPS:         {round(pothole['lat'], 6)}, {round(pothole['lng'], 6)}
Severity:    {pothole['severity'].upper()}
Detected:    {pothole['timestamp']}
Maps link:   {maps_url}
System:      StreetSafe Toronto — AI Monitoring
"""

    recipient = os.getenv("TEST_EMAIL") if TESTING_MODE else os.getenv("TO_EMAIL", "311@toronto.ca")
    image_path = pothole.get("image_path")

    try:
        _send_gmail(
            to=recipient,
            subject=subject,
            body=full_body,
            image_path=image_path,
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

def _send_gmail(to: str, subject: str, body: str, image_path: str = None):
    """Send email via Gmail SMTP, optionally attaching an image."""
    gmail_user     = os.getenv("GMAIL_USER")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_password:
        raise ValueError("GMAIL_USER or GMAIL_APP_PASSWORD not set in .env")

    msg = MIMEMultipart()
    msg["From"]    = gmail_user
    msg["To"]      = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    if image_path and os.path.isfile(image_path):
        mime_type, _ = mimetypes.guess_type(image_path)
        if mime_type and mime_type.startswith("image/"):
            maintype, subtype = mime_type.split("/", 1)
        else:
            maintype, subtype = "application", "octet-stream"

        with open(image_path, "rb") as f:
            attachment = MIMEBase(maintype, subtype)
            attachment.set_payload(f.read())
        encoders.encode_base64(attachment)
        filename = os.path.basename(image_path)
        attachment.add_header("Content-Disposition", "attachment", filename=filename)
        msg.attach(attachment)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_password)
        server.send_message(msg)
