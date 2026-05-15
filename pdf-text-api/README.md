# PDF 文字擷取後端 (pdf-text-api)

DKY.tw 工具箱 `/pdf` 頁面的後端引擎。
四層 fallback：**PyMuPDF → Docling → pdftotext → Tesseract OCR**。

部署於 OCI ARM 機器，透過 Cloudflare Tunnel 對外提供 `https://pdf-api.dky.tw`。

---

## 一、OCI ARM 機器部署步驟

### 1.1 開機並連線

OCI Console → Compute → Instances → 確認你的 Ampere A1 ARM 機器在運行。
SSH 進去（預設使用者通常是 `ubuntu` 或 `opc`）：
```bash
ssh -i ~/.ssh/your_key.pem ubuntu@<oci-public-ip>
```

### 1.2 安裝 Docker

Ubuntu 22.04 ARM：
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git curl
sudo usermod -aG docker $USER
newgrp docker  # 立即生效
docker --version && docker compose version
```

### 1.3 取得本專案

兩種方式：

**方式 A — git clone（推薦）**
```bash
cd ~
git clone <你的-repo-url> pdf-text-api
cd pdf-text-api
```

**方式 B — 手動 scp**
```bash
# 在 Windows 本機
scp -r -i ~/.ssh/your_key.pem c:/Users/JY/Desktop/tool/pdf-text-api ubuntu@<oci-ip>:~/
```

### 1.4 建立 .env

```bash
cp .env.example .env
nano .env   # 填入 TUNNEL_TOKEN（取得方式見下節）
```

### 1.5 啟動

```bash
docker compose up -d --build      # 首次 build 需 5-10 分鐘 (Docling 模型下載)
docker compose logs -f            # 觀察啟動進度
```

成功訊息範例：
```
pdf-text-api  | INFO:     Uvicorn running on http://0.0.0.0:8000
pdf-cloudflared | INF Connection registered ... protocol=quic
```

---

## 二、Cloudflare Tunnel 設定

### 2.1 建立 Tunnel

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左側選單 → **Zero Trust** → **Networks** → **Tunnels**
3. **+ Create a tunnel** → 選 **Cloudflared** → 命名 `dky-pdf-api` → Save
4. 環境選 **Docker**，複製顯示的 token（很長一串 `eyJ...`）
5. 把 token 貼進 OCI 機器的 `~/pdf-text-api/.env`：
   ```
   TUNNEL_TOKEN=eyJhIjoi...全部貼進來...
   ```
6. 在 OCI 機器執行 `docker compose up -d` 啟動 cloudflared
7. 回 Cloudflare 頁面點 **Next**

### 2.2 設定 Public Hostname

繼續設定畫面 → **Public Hostnames** → **+ Add a public hostname**：

| 欄位 | 值 |
|---|---|
| Subdomain | `pdf-api` |
| Domain | `dky.tw` |
| Path | （留空） |
| Type | `HTTP` |
| URL | `pdf-text-api:8000` |

點 **Save hostname**。Cloudflare 會自動建 DNS CNAME。

### 2.3 設定 Rate Limit（防止濫用）

1. Cloudflare Dashboard → 選 `dky.tw` zone
2. 左側 **Security** → **WAF** → **Rate limiting rules** → **Create rule**
3. 設定：
   - **Rule name**: `pdf-api-throttle`
   - **If incoming requests match**: `(http.host eq "pdf-api.dky.tw")`
   - **Then**: Block
   - **For duration**: 10 seconds
   - **Counting characteristics**: IP address
   - **Period**: 1 minute
   - **Requests**: 10
4. Deploy

---

## 三、驗證

### 3.1 健康檢查
```bash
curl https://pdf-api.dky.tw/api/health
# {"status":"ok","service":"pdf-text-api","version":"1.0.0"}
```

### 3.2 抽取測試
```bash
# 純文字 PDF
curl -F "file=@test.pdf" \
  "https://pdf-api.dky.tw/api/extract?method=auto&langs=zh,en"

# 強制 OCR（掃描件）
curl -F "file=@scanned.pdf" \
  "https://pdf-api.dky.tw/api/extract?method=tesseract&langs=zh,en"

# 純文字輸出
curl -F "file=@test.pdf" \
  "https://pdf-api.dky.tw/api/extract?output=text"
```

### 3.3 瀏覽器測試
直接打開 `https://pdf-api.dky.tw/` → 內嵌 Web UI 拖曳 PDF。

### 3.4 從 DKY.tw 前端測試
打開 `https://dky.tw/pdf` → 上傳 PDF → 應顯示「🟢 後端引擎：fitz · X.XXs」。

---

## 四、API 規格

### `POST /api/extract`

**Query params**
| 名稱 | 預設 | 說明 |
|---|---|---|
| `method` | `auto` | `auto` / `fitz` / `docling` / `pdftotext` / `tesseract` |
| `langs` | `zh,en` | 逗號分隔，如 `zh,en` / `vi,en` / `ja,en` |
| `output` | `json` | `json` 或 `text`（純文字回傳） |

**Body**: multipart, field `file` 為 PDF（≤ 20MB）

**Response (json)**
```json
{
  "filename": "doc.pdf",
  "method_used": "fitz",
  "text": "[第 1 頁]\n...",
  "page_count": 3,
  "char_count": 1024,
  "took_ms": 230,
  "tried": [{"method":"fitz","ok":true,"chars":1024}]
}
```

### `GET /api/health`
```json
{"status":"ok","service":"pdf-text-api","version":"1.0.0"}
```

---

## 五、常見問題

### Q1: docker build 失敗，提示 ARM wheel 找不到？
某些套件（如 `pdftotext`）需要編譯。Dockerfile 已裝 `build-essential` 與 `libpoppler-cpp-dev`，理論上能編譯成功。若仍失敗，檢查 OCI 機器的 swap 是否足夠（建議 ≥ 2GB）：
```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Q2: Docling 首次請求很慢？
首次會下載 ~300MB 模型到容器內。Dockerfile 已嘗試在 build 階段預載；若預載失敗（例如網路不穩），會在第一次實際請求時才下載。

### Q3: 想關掉 Docling 節省記憶體？
編輯 `parser.py` 把 `METHODS_ORDER` 改成 `("fitz", "pdftotext", "tesseract")`，再 `docker compose up -d --build`。

### Q4: 後續想加 MinerU？
1. 在 `docker-compose.yml` 加入 mineru-api 服務
2. 在 `parser.py` 新增 `_with_mineru(pdf_bytes, langs)` 透過環境變數 `MINERU_API_URL=http://mineru-api:18080` 呼叫
3. 把 `mineru` 加入 `METHODS_ORDER` 適當位置（建議 docling 之前）

### Q5: 怎麼更新？
```bash
cd ~/pdf-text-api
git pull
docker compose up -d --build
```

---

## 六、檔案結構
```
pdf-text-api/
├── main.py              # FastAPI app + CORS + 內嵌 Web UI
├── parser.py            # 四層 fallback 引擎
├── Dockerfile           # ARM64 / AMD64 通用 (multi-arch)
├── docker-compose.yml   # pdf-text-api + cloudflared
├── requirements.txt     # Python 套件
├── .env.example         # TUNNEL_TOKEN 範本
├── .gitignore
└── README.md            # 本檔案
```
