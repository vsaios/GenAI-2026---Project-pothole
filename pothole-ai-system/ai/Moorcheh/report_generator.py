import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Use HF_TOKEN (HuggingFace Inference) or OPENAI_API_KEY (OpenAI), default for local/test
api_key = os.getenv("HF_TOKEN") or os.getenv("OPENAI_API_KEY") or "hf-no-key-needed"
client = OpenAI(
    api_key=api_key,
    base_url=os.getenv("HF_ENDPOINT") or "https://api.openai.com/v1",
)

def generate_report(pothole: dict) -> str:
    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/report_prompt.txt")
    with open(prompt_path) as f:
        template = f.read()
    issue_type = pothole.get("issue_type", "pothole")
    formatted_prompt = template.format(
        road=pothole["road"],
        lat=round(pothole["lat"], 6),
        lng=round(pothole["lng"], 6),
        severity=pothole["severity"].upper(),
        timestamp=pothole["timestamp"],
        id=pothole["id"],
        issue_type=issue_type,
    )
    message = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": formatted_prompt}]
    )
    return message.choices[0].message.content

def generate_report_subject(pothole: dict) -> str:
    issue_type = pothole.get("issue_type", "pothole").title()
    severity_tag = {
        "high":   f"URGENT — {issue_type} Safety Hazard",
        "medium": f"ACTION REQUIRED — {issue_type} Detected",
        "low":    f"{issue_type} Report"
    }.get(pothole["severity"].lower(), f"{issue_type} Report")
    return f"[StreetSafe] {severity_tag} | {pothole['road']}, Toronto | ID #{pothole['id']}"

def generate_chat_response(user_message: str, potholes: list) -> str:
    chat_prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/chat_prompt.txt")
    with open(chat_prompt_path) as f:
        system_prompt = f.read()

    clean_potholes = []
    for p in potholes:
        if isinstance(p, dict):
            record = p.get("metadata") or p
            if record.get("road"):
                clean_potholes.append(record)

    pothole_context = "\n".join([
        f"- {p['road']}, Toronto: severity={p['severity'].upper()}, "
        f"coords=({round(p['lat'],4)}, {round(p['lng'],4)}), "
        f"reported={p['timestamp']}, status={p['status']}"
        for p in clean_potholes
    ]) or "No potholes currently detected in the system."

    message = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": f"Current Toronto pothole data:\n{pothole_context}\n\nUser question: {user_message}"}
        ]
    )
    return message.choices[0].message.content

def generate_followup_email(pothole: dict, days_ago: int) -> str:
    followup_path = os.path.join(os.path.dirname(__file__), "../prompts/followup_prompt.txt")
    with open(followup_path) as f:
        template = f.read()
    formatted_prompt = template.format(
        road=pothole["road"],
        severity=pothole["severity"].upper(),
        id=pothole["id"],
        days_ago=days_ago
    )
    message = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": formatted_prompt}]
    )
    return message.choices[0].message.content