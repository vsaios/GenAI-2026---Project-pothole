import sys
import os

# Cross-platform path to AI Moorcheh module
_here = os.path.dirname(os.path.abspath(__file__))
AI_PATH = os.path.normpath(os.path.join(_here, "..", "..", "..", "ai", "Moorcheh"))
if AI_PATH not in sys.path:
    sys.path.insert(0, AI_PATH)

from fastapi import APIRouter
from pydantic import BaseModel
from memory_client import get_potholes, get_summary, save_pothole, mark_sent_to_311
from report_generator import generate_chat_response
from email_sender import send_pothole_report

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        all_potholes = get_potholes()
        answer = generate_chat_response(request.message, all_potholes)
        return {"answer": answer, "potholes_found": len(all_potholes)}
    except Exception as e:
        return {
            "answer": f"Chat service error: {str(e)}. Check HF_ENDPOINT in ai/Moorcheh/.env and Moorcheh connection.",
            "potholes_found": 0,
        }

@router.get("/potholes")
async def get_all_potholes():
    return get_potholes()

@router.get("/potholes/{road}")
async def get_potholes_by_road(road: str):
    return get_potholes(road)

@router.get("/summary")
async def summary():
    return get_summary()


# ============================================================
# NEW — pothole reporting with automatic email to 311
# ============================================================

class PotholeReport(BaseModel):
    lat: float
    lng: float
    severity: str
    road: str
    frame_timestamp: str = ""

@router.post("/report")
async def report_pothole(data: PotholeReport):
    """
    Called when a pothole is detected by the dashcam.
    1. Saves to Moorcheh memory
    2. Generates AI email
    3. Sends to 311 Toronto automatically
    """
    # Step 1 — save to Moorcheh
    pothole = save_pothole(
        lat=data.lat,
        lng=data.lng,
        severity=data.severity,
        road=data.road,
        frame_timestamp=data.frame_timestamp
    )

    # Step 2 & 3 — generate and send email
    email_result = send_pothole_report(pothole)

    # Step 4 — mark as sent in Moorcheh memory
    if email_result["status"] == "sent":
        mark_sent_to_311(pothole["id"])

    return {
        "pothole":      pothole,
        "email_status": email_result["status"],
        "sent_to":      email_result["sent_to"],
        "subject":      email_result["subject"]
    }