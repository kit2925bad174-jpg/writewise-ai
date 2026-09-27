import json
import urllib.request

payload = json.dumps({
    "text": "I is going to school yesterday.",
    "mode": "General",
    "user_id": 1,
}).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/analyze",
    data=payload,
    headers={"Content-Type": "application/json"},
)
with urllib.request.urlopen(req, timeout=30) as resp:
    body = resp.read().decode("utf-8")
    print(resp.status)
    print(body[:2000])
