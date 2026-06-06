---
name: stirling-pdf
description: Use when the user asks Hermes to process PDFs with the local Stirling PDF service, including OCR, compression, merge, split, page extraction, text extraction, or PDF-to-Word conversion.
version: 1.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [pdf, ocr, stirling-pdf, automation]
    related_skills: []
---

# Stirling PDF — Hermes 使用指南

## Overview

使用本地 Stirling PDF 實例進行伺服器端 PDF 操作。

| 用途 | 存取方式 |
|------|----------|
| 人類使用者（瀏覽器） | `https://pdf.dky.tw` （Cloudflare Proxy → OCI Docker） |
| Hermes（API 呼叫） | `http://127.0.0.1:18080`（本機直連） |
| tools.dky.tw 入口 | 「PDF 進階」→ 連到 `https://pdf.dky.tw` |

---

## 部署架構

```
使用者 ──→ Cloudflare Proxy ──→ OCI VM ──→ Docker Container (Stirling PDF :18080)
                                              ├── /configs  (持久化設定+資料庫)
                                              └── tessdata_best/chi_tra + eng

Hermes ──→ 本機 127.0.0.1:18080 (直連，不經 Cloudflare)
```

---

## Hermes 環境配置

### 已部署的檔案位置

| 檔案 | 路徑 |
|------|------|
| Shell wrapper | `/home/ubuntu/.hermes/.local/bin/stirling-pdf` |
| Python client | `/home/ubuntu/.hermes/scripts/stirling_pdf_client.py` |
| Skill 說明 | `/home/ubuntu/.hermes/skills/productivity/stirling-pdf/SKILL.md` |
| 環境變數 | `/home/ubuntu/.hermes/.stirling-pdf.env` |

### 環境變數

客戶端需要兩個環境變數：

| 變數 | 必要性 | 說明 | 預設值 |
|------|--------|------|--------|
| `STIRLING_PDF_API_KEY` | **必要** | API 認證金鑰（全域 Key） | （無，未設定會報錯） |
| `STIRLING_PDF_URL` | 選填 | Stirling PDF 伺服器 URL | `http://127.0.0.1:18080` |

### `.env` 檔案

客戶端依序搜尋以下路徑（先找到的優先）：

```
/home/ubuntu/.hermes/.stirling-pdf.env   ← 主要（已確認部署）
/opt/data/.env
/opt/data/.stirling-pdf.env
/home/ubuntu/.hermes/.env
/home/ubuntu/stack/.env
```

`.env` 格式：

```bash
STIRLING_PDF_URL=http://127.0.0.1:18080
STIRLING_PDF_API_KEY=your-global-api-key
```

### API Key 來源

本實例使用**全域 API Key**（`SECURITY_CUSTOMGLOBALAPIKEY`），
設定在 Docker 環境變數或 `/home/ubuntu/stack/.env` 中。

Hermes 的 `.stirling-pdf.env` 中的 `STIRLING_PDF_API_KEY` 必須與伺服器的全域 Key 一致。

---

## Web UI 登入（瀏覽器）

### 存取流程

```
https://pdf.dky.tw/  ──302──→  https://pdf.dky.tw/login
```

Cloudflare DNS proxy 啟用，根路徑自動跳轉到 `/login`。

### 帳號資訊

| 項目 | 值 |
|------|-----|
| 帳號 | `admin` |
| 初始密碼 | 在 OCI `/home/ubuntu/stack/.env` 的 `STIRLING_PDF_INITIAL_PASSWORD` |

### ⚠️ 登入失敗排查

> **重要**：`STIRLING_PDF_INITIAL_PASSWORD` 只在「首次啟動」（資料庫不存在時）生效。一旦資料庫已建立，修改此變數不會改變密碼。

**可能原因與解決方法（依可能性排序）：**

#### 原因 1：初始密碼已失效（資料庫已建立後密碼被覆蓋）

`SECURITY_INITIALLOGIN_PASSWORD` / `STIRLING_PDF_INITIAL_PASSWORD` 只在首次建立資料庫時寫入。若容器曾經啟動過，密碼可能已被寫入資料庫且之後被變更，或首次啟動時使用了不同的密碼。

**解法 — 刪除資料庫重建帳號：**

```bash
# 1. SSH 進入 OCI VM
ssh ubuntu@<oci-ip>

# 2. 停止容器
cd /home/ubuntu/stack
docker compose stop stirling-pdf

# 3. 找到並刪除資料庫檔案
#    configs 目錄通常掛載在 docker-compose.yml 中定義的路徑
find /home/ubuntu/stack -name "*.mv.db" -o -name "stirling-pdf-DB*"
#    刪除找到的 .mv.db 檔案
rm /home/ubuntu/stack/configs/stirling-pdf-DB.mv.db  # 路徑依實際為準

# 4. 確認 .env 中的初始密碼
grep -i "INITIAL_PASSWORD\|INITIALLOGIN" /home/ubuntu/stack/.env

# 5. 重啟容器（會以 .env 中的密碼重新建立資料庫）
docker compose up -d stirling-pdf

# 6. 等待啟動完成
docker compose logs -f stirling-pdf | head -50
```

> **注意**：刪除 DB 會清除所有使用者帳號和設定，但不影響 PDF 檔案。

#### 原因 2：Cloudflare Proxy 導致 Cookie/CSRF 問題

Cloudflare 終止 SSL 後，後端收到的是 HTTP 連線。若 Stirling PDF 嘗試發送 `Secure` cookie，瀏覽器會拒絕（因為它認為連線不安全）。

**解法 — 在 Docker 環境變數中加入：**

```yaml
environment:
  # 告知 Stirling PDF 前端使用 HTTPS
  SYSTEM_CONNECTIONTIMEOUT: "300"
  # 若仍有 CSRF 問題，暫時停用以測試（確認後應恢復）
  SECURITY_CSRFDISABLED: "true"
```

**Cloudflare 端設定：**
- SSL/TLS 模式設為 **Full** 或 **Full (Strict)**（而非 Flexible）
- 或者在 Cache Rules 中，對 `pdf.dky.tw` 設定 Cache Level = **No Query String**

#### 原因 3：Docker volume 未正確掛載 /configs

若 `/configs` 沒有掛載持久化 volume，每次容器重啟都會重建資料庫，但密碼可能變成預設值 `stirling`。

**檢查方式：**

```bash
# 查看容器的 volume 掛載
docker inspect stirling-pdf | grep -A5 Mounts

# 確認 configs 目錄有資料
ls -la /home/ubuntu/stack/configs/
```

#### 原因 4：使用了錯誤的 Docker image

需要 `latest-fat` 或含登入功能的 image。`ultra-lite` 版本不支援登入。

```bash
# 檢查使用的 image
docker inspect stirling-pdf --format='{{.Config.Image}}'
```

### 快速診斷指令

```bash
# 在 OCI VM 上執行：

# 1. 檢查容器狀態
docker ps | grep stirling

# 2. 查看容器日誌（找 login/auth 相關錯誤）
docker logs stirling-pdf --tail 100 2>&1 | grep -i "auth\|login\|password\|denied\|error"

# 3. 用本機直連測試 API（繞過 Cloudflare）
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:18080/api/v1/info/status

# 4. 用 API Key 測試認證
source /home/ubuntu/.hermes/.stirling-pdf.env
curl -s -H "X-API-KEY: $STIRLING_PDF_API_KEY" http://127.0.0.1:18080/api/v1/info/status

# 5. 測試 Web 登入（模擬瀏覽器）
curl -v -c /tmp/cookies.txt https://pdf.dky.tw/login 2>&1 | grep -i "set-cookie\|location\|csrf"
```

---

## CLI 命令參考

### 版本與狀態

```bash
stirling-pdf --version
stirling-pdf status
```

---

### OCR（光學文字辨識）

預設支援繁體中文（tessdata_best/chi_tra）+ 英文。

```bash
stirling-pdf ocr <input> [options]
```

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `<input>` | PDF 檔案路徑或 URL | （必要） |
| `-o, --output` | 輸出路徑 | `<workspace>/pdf-results/<stem>.ocr.pdf` |
| `--languages` | OCR 語言（逗號分隔） | `chi_tra,eng` |
| `--force` | 強制 OCR（即使已有文字層） | 否 |
| `--sidecar` | 同時產生純文字 sidecar 檔 | 否 |
| `--no-deskew` | 停用自動校正傾斜 | 否（預設校正） |
| `--no-clean` | 停用影像清理 | 否（預設清理） |
| `--clean-final` | 最終輸出也套用清理 | 否 |
| `--render-type` | 渲染方式：`hocr` 或 `sandwich` | `hocr` |

```bash
# 基本繁中 OCR
stirling-pdf ocr scan.pdf -o output.ocr.pdf

# 強制 OCR
stirling-pdf ocr scan.pdf --force -o output.ocr.pdf

# 日文 + 英文
stirling-pdf ocr scan.pdf --languages jpn,eng -o output.ocr.pdf

# Google Drive 公開連結
stirling-pdf ocr "https://drive.google.com/file/d/<id>/view?usp=sharing" -o output.ocr.pdf
```

---

### Compress（壓縮）

```bash
stirling-pdf compress <input> [options]
```

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `--level` | 壓縮等級 1-9 | `5` |
| `--expected-size` | 目標檔案大小 | 無 |
| `--linearize` | 網頁優化 | 否 |
| `--grayscale` | 轉灰階 | 否 |

```bash
stirling-pdf compress large.pdf --level 5 -o small.pdf
```

---

### Merge（合併）

```bash
stirling-pdf merge a.pdf b.pdf c.pdf -o merged.pdf
```

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `--keep-cert-sign` | 保留憑證簽章 | 否（預設移除） |
| `--generate-toc` | 自動產生目錄 | 否 |

---

### Split（分割）

```bash
stirling-pdf split input.pdf --pages all -o split.zip
```

---

### Extract Pages（擷取頁面）

```bash
stirling-pdf extract-pages input.pdf --pages 1,3,5-9 -o pages.pdf
```

---

### PDF to Word / Text

```bash
stirling-pdf pdf-to-word input.pdf -o output.docx    # --format: doc/docx/odt
stirling-pdf pdf-to-text input.pdf -o output.txt      # --format: txt/rtf
```

---

## 預設值一覽

| 項目 | 預設值 |
|------|--------|
| API URL（Hermes） | `http://127.0.0.1:18080` |
| Web UI（人類） | `https://pdf.dky.tw` |
| OCR 語言 | `chi_tra,eng`（繁中 + 英文，tessdata_best） |
| OCR 模式 | `skip-text` |
| OCR 渲染 | `hocr` |
| 自動校正傾斜 | 啟用 |
| 影像清理 | 啟用 |
| 預設輸出目錄 | `~/. hermes/workspace/pdf-results/` 或 `/opt/data/workspace/pdf-results/` |

---

## 注意事項

1. **`STIRLING_PDF_INITIAL_PASSWORD` 只在首次啟動時生效**。之後改密碼需透過 Web UI 或刪除資料庫重建。
2. **Web UI 登入密碼 ≠ API Key**。兩者是獨立的認證機制。
3. **Google Drive 私人連結會失敗**。請確認設為「知道連結的人都能查看」。
4. **繁中 PDF 轉 Word 前需先 OCR**。先 `ocr` 再 `pdf-to-word`。
5. **壓縮等級 7-9 會明顯降低影像品質**。建議從 5 開始。
6. **Split 輸出是 zip 檔案**。
7. **Cloudflare proxy 可能影響登入**。若有問題先試 `SECURITY_CSRFDISABLED=true`。

---

## 驗證清單

- [ ] `stirling-pdf status` 回傳版本和 `UP`
- [ ] `stirling-pdf --version` 顯示 `1.1.0`
- [ ] OCR 輸出 PDF 存在且非空
- [ ] 繁中 OCR 後搜尋結果包含預期中文字詞
- [ ] Web UI 可透過 `https://pdf.dky.tw` 登入
