# 로컬 미리보기 + 자막 저장 서버
# 실행: python3 server.py  →  http://localhost:8765 (본편), http://localhost:8765/edit.html (자막 수정)
# - 영상 이어보기(Range 요청) 지원: Safari도 재생됨
# - POST /api/subs 로 subs.json 저장 (저장 전 subs_backup/ 에 이전 버전 보관)
import json, os, re, shutil, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))
SUBS = os.path.join(ROOT, 'subs.json')


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if not rng or not os.path.isfile(path):
            return super().do_GET()
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        size = os.path.getsize(path)
        start = int(m.group(1)) if m.group(1) else 0
        end = int(m.group(2)) if m.group(2) else size - 1
        end = min(end, size - 1)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        with open(path, 'rb') as f:
            f.seek(start)
            left = end - start + 1
            try:
                while left > 0:
                    chunk = f.read(min(1 << 16, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass

    def do_POST(self):
        if self.path != '/api/subs':
            return self.send_error(404)
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        try:
            data = json.loads(body)
        except ValueError:
            return self.send_error(400, '잘못된 JSON')
        if os.path.exists(SUBS):
            os.makedirs(os.path.join(ROOT, 'subs_backup'), exist_ok=True)
            shutil.copy(SUBS, os.path.join(ROOT, 'subs_backup', time.strftime('subs_%m%d_%H%M%S.json')))
        with open(SUBS, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    print('http://localhost:8765  (자막 수정: /edit.html)')
    ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
