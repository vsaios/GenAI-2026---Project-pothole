import os
import time
from dotenv import load_dotenv
from openai import OpenAI

# 1. Load local .env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# 2. Setup Client for HF Endpoint
# Ensure your .env has: HF_ENDPOINT=https://your-endpoint-url.aws.endpoints.huggingface.cloud/v1/
endpoint = os.getenv("HF_ENDPOINT")

if not endpoint:
    print("❌ ERROR: HF_ENDPOINT not found in .env!")
    exit()

client = OpenAI(
    api_key="hf-no-key-needed", 
    base_url=endpoint
)

# --- MOCK DATA ---
mock_pothole = {
    "road": "St. George St & Bloor St W",
    "lat": 43.6673,
    "lng": -79.3995,
    "severity": "high",
    "timestamp": "2026-03-14 12:00:00",
    "id": "TOR-HACK-001"
}

mock_history = [
    {"road": "Bay St", "severity": "low", "lat": 43.65, "lng": -79.38, "timestamp": "2026-03-14 09:00:00"}
]

# --- TEST EXECUTION ---

def run_integration_test():
    print(f"🚀 Testing HuggingFace Endpoint: {endpoint}")
    
    # Test 1: Subject Line Logic (No API call needed)
    from report_generator import generate_report_subject
    subject = generate_report_subject(mock_pothole)
    print(f"✅ Subject Test: {subject}")

    # Test 2: Email Generation (API call)
    print("\n📡 Calling HF Endpoint for Report Generation...")
    try:
        from report_generator import generate_report
        report = generate_report(mock_pothole)
        print("--- Generated Report Body ---")
        print(report)
        print("-----------------------------")
        print("✅ Report Generation Success!")
    except Exception as e:
        print(f"❌ Report Generation Failed: {e}")

    # Test 3: Chatbot Response (API call)
    print("\n📡 Calling HF Endpoint for Chat Response...")
    try:
        from report_generator import generate_chat_response
        chat = generate_chat_response("Are there any potholes on Bay St?", mock_history)
        print(f"Chat Output: {chat}")
        print("✅ Chat Response Success!")
    except Exception as e:
        print(f"❌ Chat Response Failed: {e}")

if __name__ == "__main__":
    start_time = time.time()
    run_integration_test()
    print(f"\n⏱️ Total Test Time: {round(time.time() - start_time, 2)}s")