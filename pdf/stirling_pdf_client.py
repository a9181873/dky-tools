#!/usr/bin/env python3
"""Small CLI client for the local Stirling PDF API used by Hermes."""

__version__ = "1.1.0"

from __future__ import annotations

import argparse
import http.cookiejar
import json
import mimetypes
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path


DEFAULT_BASE_URL = "http://127.0.0.1:18080"
PUBLIC_URL = "https://pdf.dky.tw"  # Web UI for human users
DEFAULT_WORKSPACE = Path("/home/ubuntu/.hermes/workspace")
ALT_WORKSPACE = Path("/opt/data/workspace")


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def load_config() -> tuple[str, str]:
    env_files = (
        Path("/home/ubuntu/.hermes/.stirling-pdf.env"),  # Primary (confirmed deployed)
        Path("/opt/data/.env"),
        Path("/opt/data/.stirling-pdf.env"),
        Path("/home/ubuntu/.hermes/.env"),
        Path("/home/ubuntu/stack/.env"),
    )
    found_any = False
    for env_file in env_files:
        if env_file.exists():
            found_any = True
        load_env_file(env_file)
    base_url = os.environ.get("STIRLING_PDF_URL", DEFAULT_BASE_URL).rstrip("/")
    api_key = os.environ.get("STIRLING_PDF_API_KEY", "")
    if not api_key:
        searched = "\n  ".join(str(p) for p in env_files)
        hint = "" if found_any else f"\n未找到任何 .env 檔案，搜尋過的路徑：\n  {searched}"
        raise SystemExit(
            f"STIRLING_PDF_API_KEY 未設定。{hint}\n"
            f"請在 .env 檔案中加入 STIRLING_PDF_API_KEY=<your-key>，"
            f"或設定環境變數 STIRLING_PDF_API_KEY。\n"
            f"API Key 可從 Stirling PDF Web UI 的帳號設定中取得，"
            f"或使用全域 Key（SECURITY_CUSTOMGLOBALAPIKEY）。"
        )
    return base_url, api_key


def workspace_root() -> Path:
    if ALT_WORKSPACE.exists():
        return ALT_WORKSPACE
    return DEFAULT_WORKSPACE


def bool_field(value: bool) -> str:
    return "true" if value else "false"


def parse_drive_url(url: str) -> str | None:
    parsed = urllib.parse.urlparse(url)
    if "drive.google.com" not in parsed.netloc:
        return None
    match = re.search(r"/file/d/([^/]+)", parsed.path)
    if match:
        file_id = match.group(1)
    else:
        query = urllib.parse.parse_qs(parsed.query)
        file_id = (query.get("id") or [""])[0]
    if not file_id:
        return None
    return f"https://drive.google.com/uc?export=download&id={file_id}"


def filename_from_headers(headers, fallback: str) -> str:
    disposition = headers.get("Content-Disposition", "")
    # RFC 5987: filename*=UTF-8''encoded_name (case-insensitive)
    match = re.search(r"filename\*\s*=\s*[Uu][Tt][Ff]-8'[^']*'([^;\s]+)", disposition)
    if match:
        return urllib.parse.unquote(match.group(1)).strip()
    # Standard: filename="name" or filename=name
    match = re.search(r'filename\s*=\s*"?([^";]+)', disposition)
    if match:
        return match.group(1).strip()
    return fallback


def download_url(url: str, dest_dir: Path) -> Path:
    direct = parse_drive_url(url) or url
    cookiejar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookiejar))
    req = urllib.request.Request(direct, headers={"User-Agent": "Hermes Stirling PDF Client"})
    resp = opener.open(req, timeout=120)
    data = resp.read()
    content_type = resp.headers.get("Content-Type", "")

    if "text/html" in content_type and b"drive.google.com" in data[:20000]:
        html = data.decode("utf-8", errors="ignore")
        match = re.search(r'href="([^"]*confirm=[^"]+)"', html)
        if match:
            retry_url = urllib.parse.urljoin("https://drive.google.com", match.group(1).replace("&amp;", "&"))
            resp = opener.open(urllib.request.Request(retry_url, headers={"User-Agent": "Hermes Stirling PDF Client"}), timeout=120)
            data = resp.read()
            retry_ct = resp.headers.get("Content-Type", "")
            if "text/html" in retry_ct:
                raise SystemExit(
                    "Google Drive 下載失敗：重試後仍收到 HTML 頁面。\n"
                    "可能原因：檔案非公開分享或需要登入。請確認分享連結設定為『知道連結的人都能查看』。"
                )

    fallback = "downloaded.pdf" if ".pdf" in direct.lower() else "downloaded-file"
    name = filename_from_headers(resp.headers, fallback)
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._") or fallback
    dest_dir.mkdir(parents=True, exist_ok=True)
    out = dest_dir / f"{int(time.time())}_{safe_name}"
    out.write_bytes(data)
    return out


def resolve_input(value: str) -> Path:
    if re.match(r"^https?://", value, re.I):
        return download_url(value, workspace_root() / "pdf-inputs")
    path = Path(value).expanduser()
    if not path.exists():
        raise SystemExit(f"Input not found: {value}")
    return path


def encode_multipart(fields: list[tuple[str, object]], files: list[tuple[str, Path]]) -> tuple[bytes, str]:
    boundary = "----hermes-stirling-" + uuid.uuid4().hex
    chunks: list[bytes] = []

    def add_line(line: str) -> None:
        chunks.append(line.encode("utf-8") + b"\r\n")

    for name, value in fields:
        values = value if isinstance(value, (list, tuple)) else [value]
        for item in values:
            add_line(f"--{boundary}")
            add_line(f'Content-Disposition: form-data; name="{name}"')
            add_line("")
            chunks.append(str(item).encode("utf-8") + b"\r\n")

    for name, path in files:
        filename = path.name
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        add_line(f"--{boundary}")
        add_line(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"')
        add_line(f"Content-Type: {content_type}")
        add_line("")
        chunks.append(path.read_bytes() + b"\r\n")

    add_line(f"--{boundary}--")
    return b"".join(chunks), f"multipart/form-data; boundary={boundary}"


def output_path(args, default_name: str) -> Path:
    out = Path(args.output).expanduser() if args.output else workspace_root() / "pdf-results" / default_name
    out.parent.mkdir(parents=True, exist_ok=True)
    return out


def save_response(resp, out: Path) -> Path:
    disposition_name = filename_from_headers(resp.headers, out.name)
    if out.is_dir():
        out = out / disposition_name
    out.write_bytes(resp.read())
    return out


def post_api(path: str, fields: list[tuple[str, object]], files: list[tuple[str, Path]], out: Path) -> Path:
    base_url, api_key = load_config()
    body, content_type = encode_multipart(fields, files)
    req = urllib.request.Request(
        base_url + path,
        data=body,
        method="POST",
        headers={
            "Content-Type": content_type,
            "X-API-KEY": api_key,
            "Accept": "*/*",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=600) as resp:
            return save_response(resp, out)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if exc.code == 401:
            raise SystemExit(
                f"認證失敗 (401)：API Key 無效或已過期。\n"
                f"請確認 STIRLING_PDF_API_KEY 是否正確設定。\n"
                f"可從 Stirling PDF Web UI → 帳號設定中重新取得 API Key。\n"
                f"詳細訊息：{detail}"
            ) from exc
        if exc.code == 403:
            raise SystemExit(
                f"存取被拒 (403)：可能是 CSRF 保護、權限不足或 API Key 類型不匹配。\n"
                f"若使用全域 Key，請確認伺服器的 SECURITY_CUSTOMGLOBALAPIKEY 設定。\n"
                f"詳細訊息：{detail}"
            ) from exc
        raise SystemExit(f"Stirling API error {exc.code}: {detail}") from exc


def status(_args) -> None:
    base_url, api_key = load_config()
    req = urllib.request.Request(base_url + "/api/v1/info/status", headers={"X-API-KEY": api_key})
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(resp.read().decode("utf-8", errors="replace"))


def run_ocr(args) -> None:
    src = resolve_input(args.input)
    # Pass languages as comma-separated string (Stirling PDF API expectation)
    languages = ",".join(lang.strip() for lang in args.languages.split(",") if lang.strip())
    fields = [
        ("languages", languages),
        ("sidecar", bool_field(args.sidecar)),
        ("deskew", bool_field(not args.no_deskew)),
        ("clean", bool_field(not args.no_clean)),
        ("cleanFinal", bool_field(args.clean_final)),
        ("ocrType", "force-ocr" if args.force else "skip-text"),
        ("ocrRenderType", args.render_type),
        ("removeImagesAfter", bool_field(False)),
    ]
    out = output_path(args, src.stem + ".ocr.pdf")
    print(post_api("/api/v1/misc/ocr-pdf", fields, [("fileInput", src)], out))


def run_compress(args) -> None:
    src = resolve_input(args.input)
    fields = [
        ("optimizeLevel", args.level),
        ("linearize", bool_field(args.linearize)),
        ("normalize", bool_field(args.normalize)),
        ("grayscale", bool_field(args.grayscale)),
        ("lineArt", bool_field(args.line_art)),
        ("lineArtThreshold", args.line_art_threshold),
        ("lineArtEdgeLevel", args.line_art_edge_level),
    ]
    if args.expected_size:
        fields.append(("expectedOutputSize", args.expected_size))
    out = output_path(args, src.stem + ".compressed.pdf")
    print(post_api("/api/v1/misc/compress-pdf", fields, [("fileInput", src)], out))


def run_merge(args) -> None:
    files = [resolve_input(item) for item in args.inputs]
    fields = [
        ("sortType", "orderProvided"),
        ("removeCertSign", bool_field(args.remove_cert_sign)),
        ("generateToc", bool_field(args.generate_toc)),
    ]
    out = output_path(args, "merged.pdf")
    print(post_api("/api/v1/general/merge-pdfs", fields, [("fileInput", path) for path in files], out))


def run_split(args) -> None:
    src = resolve_input(args.input)
    out = output_path(args, src.stem + ".split.zip")
    print(post_api("/api/v1/general/split-pages", [("pageNumbers", args.pages)], [("fileInput", src)], out))


def run_extract_pages(args) -> None:
    src = resolve_input(args.input)
    fields = [("pageNumbers", args.pages), ("customMode", "CUSTOM")]
    out = output_path(args, src.stem + ".pages.pdf")
    print(post_api("/api/v1/general/rearrange-pages", fields, [("fileInput", src)], out))


def run_pdf_to_word(args) -> None:
    src = resolve_input(args.input)
    out = output_path(args, src.stem + "." + args.format)
    fields = [("outputFormat", args.format)]
    print(post_api("/api/v1/convert/pdf/word", fields, [("fileInput", src)], out))


def run_pdf_to_text(args) -> None:
    src = resolve_input(args.input)
    out = output_path(args, src.stem + "." + args.format)
    fields = [("outputFormat", args.format)]
    print(post_api("/api/v1/convert/pdf/text", fields, [("fileInput", src)], out))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Hermes CLI for local Stirling PDF")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("status")
    p.set_defaults(func=status)

    p = sub.add_parser("ocr")
    p.add_argument("input")
    p.add_argument("-o", "--output")
    p.add_argument("--languages", default="chi_tra,eng")
    p.add_argument("--force", action="store_true")
    p.add_argument("--sidecar", action="store_true")
    p.add_argument("--no-deskew", action="store_true")
    p.add_argument("--no-clean", action="store_true")
    p.add_argument("--clean-final", action="store_true")
    p.add_argument("--render-type", choices=["hocr", "sandwich"], default="hocr")
    p.set_defaults(func=run_ocr)

    p = sub.add_parser("compress")
    p.add_argument("input")
    p.add_argument("-o", "--output")
    p.add_argument("--level", type=int, choices=range(1, 10), default=5)
    p.add_argument("--expected-size")
    p.add_argument("--linearize", action="store_true")
    p.add_argument("--normalize", action="store_true")
    p.add_argument("--grayscale", action="store_true")
    p.add_argument("--line-art", action="store_true")
    p.add_argument("--line-art-threshold", type=float, default=55)
    p.add_argument("--line-art-edge-level", type=int, choices=[1, 2, 3], default=1)
    p.set_defaults(func=run_compress)

    p = sub.add_parser("merge")
    p.add_argument("inputs", nargs="+")
    p.add_argument("-o", "--output")
    p.add_argument("--keep-cert-sign", dest="remove_cert_sign", action="store_false")
    p.add_argument("--generate-toc", action="store_true")
    p.set_defaults(remove_cert_sign=True, func=run_merge)

    p = sub.add_parser("split")
    p.add_argument("input")
    p.add_argument("-o", "--output")
    p.add_argument("--pages", default="all")
    p.set_defaults(func=run_split)

    p = sub.add_parser("extract-pages")
    p.add_argument("input")
    p.add_argument("-o", "--output")
    p.add_argument("--pages", required=True)
    p.set_defaults(func=run_extract_pages)

    p = sub.add_parser("pdf-to-word")
    p.add_argument("input")
    p.add_argument("-o", "--output")
    p.add_argument("--format", choices=["doc", "docx", "odt"], default="docx")
    p.set_defaults(func=run_pdf_to_word)

    p = sub.add_parser("pdf-to-text")
    p.add_argument("input")
    p.add_argument("-o", "--output")
    p.add_argument("--format", choices=["txt", "rtf"], default="txt")
    p.set_defaults(func=run_pdf_to_text)

    return parser


def main() -> None:
    args = build_parser().parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
