"""
PDF 文字擷取引擎 — 四層 fallback 鏈
Layer 1: PyMuPDF (fitz) — 文字層直接抽取，最快
Layer 2b: Docling — 佈局分析 + Tesseract OCR (僅圖片頁)
Layer 3: pdftotext (poppler) — 輕量備案
Layer 4: Tesseract OCR — 強制全頁渲染後 OCR，最後手段
"""
from __future__ import annotations

import io
import logging
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Iterable

import fitz  # PyMuPDF

logger = logging.getLogger("pdf-parser")

# 語言代碼正規化（前端輸入 → Tesseract traineddata 名稱）
LANG_MAP = {
    "zh": "chi_tra", "zh-TW": "chi_tra", "chi_tra": "chi_tra",
    "zh-CN": "chi_sim", "chi_sim": "chi_sim",
    "en": "eng", "eng": "eng",
    "vi": "vie", "vie": "vie",
    "ja": "jpn", "jpn": "jpn",
    "ko": "kor", "kor": "kor",
    "th": "tha", "tha": "tha",
    "fr": "fra", "fra": "fra",
    "de": "deu", "deu": "deu",
    "es": "spa", "spa": "spa",
    "pt": "por", "por": "por",
}

DEFAULT_LANGS = ["chi_tra", "chi_sim", "eng"]
QUALITY_MIN_CHARS = 50  # 抽出文字 (去空白後) 少於此值視為失敗，繼續 fallback


def normalize_langs(langs: Iterable[str] | None) -> list[str]:
    if not langs:
        return DEFAULT_LANGS
    out: list[str] = []
    for code in langs:
        c = (code or "").strip()
        if not c:
            continue
        mapped = LANG_MAP.get(c) or LANG_MAP.get(c.lower()) or c
        if mapped not in out:
            out.append(mapped)
    return out or DEFAULT_LANGS


def _quality_ok(text: str) -> bool:
    return len("".join(text.split())) >= QUALITY_MIN_CHARS


# -------- Layer 1: PyMuPDF --------
def _with_fitz(pdf_bytes: bytes) -> tuple[str, int]:
    pages: list[str] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        page_count = doc.page_count
        for i, page in enumerate(doc, 1):
            text = page.get_text() or ""
            pages.append(f"[第 {i} 頁]\n{text.strip()}")
    return "\n\n".join(pages), page_count


# -------- Layer 2b: Docling --------
_docling_converter = None


def _get_docling(langs: list[str]):
    """延遲載入 Docling，並快取轉換器（首次很慢，後續快）"""
    global _docling_converter
    if _docling_converter is not None:
        return _docling_converter
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import (
        PdfPipelineOptions,
        TesseractCliOcrOptions,
    )
    from docling.document_converter import DocumentConverter, PdfFormatOption

    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.ocr_options = TesseractCliOcrOptions(
        force_full_page_ocr=False,
        lang=langs,
    )
    _docling_converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
        }
    )
    return _docling_converter


def _with_docling(pdf_bytes: bytes, langs: list[str]) -> tuple[str, int]:
    converter = _get_docling(langs)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = Path(tmp.name)
    try:
        result = converter.convert(tmp_path)
        text = result.document.export_to_markdown()
        page_count = len(result.document.pages) if hasattr(result.document, "pages") else 0
        return text, page_count
    finally:
        tmp_path.unlink(missing_ok=True)


# -------- Layer 3: pdftotext (poppler) --------
def _with_pdftotext(pdf_bytes: bytes) -> tuple[str, int]:
    import pdftotext  # type: ignore
    pdf = pdftotext.PDF(io.BytesIO(pdf_bytes), physical=True)
    pages = [f"[第 {i} 頁]\n{(p or '').strip()}" for i, p in enumerate(pdf, 1)]
    return "\n\n".join(pages), len(pdf)


# -------- Layer 4: Tesseract OCR (整頁渲染) --------
def _with_tesseract(pdf_bytes: bytes, langs: list[str]) -> tuple[str, int]:
    import pytesseract
    from PIL import Image

    if not shutil.which("pdftoppm"):
        raise RuntimeError("pdftoppm not installed (poppler-utils)")

    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = Path(tmpdir) / "in.pdf"
        pdf_path.write_bytes(pdf_bytes)
        prefix = Path(tmpdir) / "page"
        # 200 DPI 平衡品質與速度
        subprocess.run(
            ["pdftoppm", "-r", "200", "-png", str(pdf_path), str(prefix)],
            check=True, capture_output=True, timeout=120,
        )
        png_files = sorted(Path(tmpdir).glob("page-*.png"))
        if not png_files:
            raise RuntimeError("pdftoppm 未輸出任何頁面")

        lang_str = "+".join(langs)
        pages: list[str] = []
        for i, png in enumerate(png_files, 1):
            img = Image.open(png)
            text = pytesseract.image_to_string(img, lang=lang_str) or ""
            pages.append(f"[第 {i} 頁]\n{text.strip()}")
        return "\n\n".join(pages), len(png_files)


# -------- 主入口 --------
METHODS_ORDER = ("fitz", "docling", "pdftotext", "tesseract")


def extract(pdf_bytes: bytes, method: str = "auto",
            langs: Iterable[str] | None = None) -> dict:
    """
    抽取 PDF 文字。回傳：
    {
      "method_used": str,
      "text": str,
      "page_count": int,
      "char_count": int,
      "took_ms": int,
      "tried": [{"method": "fitz", "ok": False, "error": "..."}, ...]
    }
    """
    start = time.monotonic()
    langs_n = normalize_langs(langs)
    tried: list[dict] = []

    methods = METHODS_ORDER if method == "auto" else (method,)

    last_text = ""
    last_pages = 0
    last_method = None

    for m in methods:
        try:
            if m == "fitz":
                text, pages = _with_fitz(pdf_bytes)
            elif m == "docling":
                text, pages = _with_docling(pdf_bytes, langs_n)
            elif m == "pdftotext":
                text, pages = _with_pdftotext(pdf_bytes)
            elif m == "tesseract":
                text, pages = _with_tesseract(pdf_bytes, langs_n)
            else:
                raise ValueError(f"unknown method: {m}")

            ok = _quality_ok(text)
            tried.append({"method": m, "ok": ok,
                          "chars": len("".join(text.split()))})
            last_text, last_pages, last_method = text, pages, m

            # 指定 method 時不論品質都直接回傳；auto 模式下只在達標時 return
            if method != "auto" or ok:
                break
        except Exception as e:
            logger.warning("method %s failed: %s", m, e)
            tried.append({"method": m, "ok": False, "error": str(e)[:200]})

    if last_method is None:
        raise RuntimeError("所有引擎都失敗：" + "; ".join(
            f"{t['method']}={t.get('error','low quality')}" for t in tried))

    took_ms = int((time.monotonic() - start) * 1000)
    return {
        "method_used": last_method,
        "text": last_text,
        "page_count": last_pages,
        "char_count": len(last_text),
        "took_ms": took_ms,
        "tried": tried,
    }
