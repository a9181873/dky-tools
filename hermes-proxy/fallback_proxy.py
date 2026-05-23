#!/usr/bin/env python3
"""Weighted-priority proxy for Hermes delegation.
Priority: OpenRouter > Cerebras > NVIDIA > GLM > Gemini
Weighted distribution + fallback on failure.
"""
import json
import os
import random
import threading
import time
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

def load_env(path="/opt/data/.env"):
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k, v)

load_env()

# Priority order + weights (higher = more traffic)
PROVIDERS = [
    {"name": "openrouter", "weight": 5,
     "base_url": "https://openrouter.ai/api/v1",
     "api_key": os.environ.get("OPENROUTER_API_KEY", ""),
     "model": os.environ.get("OR_MODEL", "nvidia/nemotron-3-super-120b-a12b:free")},
    {"name": "cerebras", "weight": 4,
     "base_url": "https://api.cerebras.ai/v1",
     "api_key": os.environ.get("CEREBRAS_API_KEY", ""),
     "model": "gpt-oss-120b"},
    {"name": "nvidia", "weight": 3,
     "base_url": "https://integrate.api.nvidia.com/v1",
     "api_key": os.environ.get("NVIDIA_API_KEY", ""),
     "model": "nvidia/nemotron-3-super-120b-a12b"},
    {"name": "glm", "weight": 2,
     "base_url": "https://open.bigmodel.cn/api/paas/v4",
     "api_key": os.environ.get("GLM_API_KEY", ""),
     "model": "glm-4-flash"},
    {"name": "gemini", "weight": 1,
     "base_url": "https://generativelanguage.googleapis.com/v1beta/openai",
     "api_key": os.environ.get("GEMINI_API_KEY", ""),
     "model": "gemini-2.5-flash"},
]

ACTIVE = [p for p in PROVIDERS if p["api_key"]]
WEIGHTS = [p["weight"] for p in ACTIVE]
PORT = int(os.environ.get("FALLBACK_PROXY_PORT", "8731"))


def call_provider(p, payload, retries=1):
    """Call one provider with retry. Returns (result_bytes, None) or (None, error)."""
    data = json.dumps({**payload, "model": p["model"]}).encode()
    url = f"{p['base_url']}/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {p['api_key']}"}

    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=180) as resp:
                return resp.read(), None
        except urllib.error.HTTPError as e:
            if e.code in (429, 503, 502) and attempt < retries:
                time.sleep(2 ** attempt)
                continue
            return None, f"{p['name']}: HTTP {e.code}"
        except Exception as e:
            if attempt < retries:
                time.sleep(1)
                continue
            return None, f"{p['name']}: {e}"
    return None, f"{p['name']}: max retries"


def weighted_call(payload):
    """Weighted random pick, then fallback through priority order on failure."""
    # Pick provider by weighted random
    pick = random.choices(ACTIVE, weights=WEIGHTS, k=1)[0]
    start_idx = ACTIVE.index(pick)

    # Try from picked index, fall through priority order
    errors = []
    for i in range(len(ACTIVE)):
        p = ACTIVE[(start_idx + i) % len(ACTIVE)]
        result, err = call_provider(p, payload)
        if result is not None:
            return 200, result
        errors.append(err)

    return 502, json.dumps({"error": f"All failed: {'; '.join(errors)}"}).encode()


class ProxyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        body_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(body_len).decode("utf-8") if body_len else "{}"
        status, result = weighted_call(json.loads(body))
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(result)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    names = " > ".join(p["name"] for p in ACTIVE)
    server = ThreadedHTTPServer(("127.0.0.1", PORT), ProxyHandler)
    print(f"Weighted proxy on :{PORT}  [{len(ACTIVE)}: {names}]", flush=True)
    server.serve_forever()
