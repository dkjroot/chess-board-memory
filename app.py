"""Run with Python 3.10+: python app.py. Everything stays on this computer."""

import argparse
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from secrets import token_urlsafe
from threading import Lock
from time import monotonic
from urllib.parse import urlsplit

from game import Practice

ROOT = Path(__file__).parent
SESSIONS: dict[str, tuple[Practice, float]] = {}
LOCK = Lock()


class Handler(BaseHTTPRequestHandler):
    def reply(self, status: int, data: bytes, content_type: str, cookie: str = "") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'")
        if cookie:
            self.send_header("Set-Cookie", f"practice={cookie}; HttpOnly; SameSite=Strict; Path=/")
        self.end_headers()
        self.wfile.write(data)

    def json_reply(self, status: int, data: dict, cookie: str = "") -> None:
        self.reply(status, json.dumps(data).encode(), "application/json; charset=utf-8", cookie)

    def do_GET(self) -> None:
        route = urlsplit(self.path).path
        files = {"/": ("index.html", "text/html"), "/style.css": ("style.css", "text/css"),
                 "/app.js": ("app.js", "text/javascript"),
                 "/favicon.svg": ("favicon.svg", "image/svg+xml")}
        if route not in files:
            self.json_reply(404, {"error": "Page not found."})
            return
        filename, mime = files[route]
        self.reply(200, (ROOT / "static" / filename).read_bytes(), mime + "; charset=utf-8")

    def do_POST(self) -> None:
        if self.path not in ("/api/start", "/api/check"):
            self.json_reply(404, {"error": "Endpoint not found."})
            return
        origin = self.headers.get("Origin")
        if origin and origin != f"http://{self.headers.get('Host')}":
            self.json_reply(403, {"error": "Please use the app from its own browser page."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 8192:
                raise ValueError("Invalid request size.")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("Expected a JSON object.")
            cookie = SimpleCookie(self.headers.get("Cookie", ""))
            sid = cookie["practice"].value if "practice" in cookie else ""
            with LOCK:
                now = monotonic()
                for expired in [key for key, (_, touched) in SESSIONS.items() if now - touched > 86400]:
                    del SESSIONS[expired]
                if sid not in SESSIONS:
                    sid = token_urlsafe(24)
                    SESSIONS[sid] = (Practice(), now)
                practice = SESSIONS[sid][0]
                SESSIONS[sid] = (practice, now)
                result = practice.start(data) if self.path == "/api/start" else practice.check(data.get("id"), data.get("placement"))
            self.json_reply(200, result, sid)
        except (ValueError, TypeError, UnicodeDecodeError) as exc:
            self.json_reply(400, {"error": str(exc)})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local chess board memory practice")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Chess Board Memory: http://127.0.0.1:{args.port} (Ctrl+C to stop)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
