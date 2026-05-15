# Cloudflare KV 雲端同步設定攻略

> 目的：把美股投資組合的資料存到 Cloudflare KV，讓對方完全不用碰任何後端設定。
> 一次性設定，5~10 分鐘完成。

---

## 〇、為什麼是 Cloudflare KV？

| 項目 | 數值 |
|------|------|
| 免費額度 | 100,000 reads/day、1,000 writes/day、1 GB 儲存 |
| 我們的用量估計 | 每天 < 50 writes、< 200 reads（單一使用者） |
| 是否要部署新服務 | ❌ 不用，跟你的 `use.dky.tw` 共用同一個 Pages 專案 |
| 對方要做什麼 | 完全不用做任何事 |

---

## 一、登入 Cloudflare Dashboard

1. 打開 https://dash.cloudflare.com
2. 用你部署 `use.dky.tw` 的帳號登入

---

## 二、建立 KV namespace（30 秒）

1. 左側選單 → **Storage & Databases** → **KV**
   - 舊版介面可能在 **Workers & Pages** → **KV**
2. 點右上 **Create a namespace**
3. Namespace name 填：`dky-stock-state`
4. 按 **Add**
5. 建好後會看到一行紀錄，請**記下它的 ID**（之後不會直接用，但出問題時很有用）

**驗證**：列表頁應該看到 `dky-stock-state`，State = `Ready`。

---

## 三、把 KV 綁定到 Pages 專案（1 分鐘）

1. 左側 **Workers & Pages** → 點 **use-dky-tw**（你的 Pages 專案，名字可能略不同，找你部署到 use.dky.tw 的那個）
2. 上方分頁 **Settings**
3. 左側 **Bindings**（舊版叫 **Functions** → **KV namespace bindings**）
4. 點 **Add**
   - Type 選 **KV namespace**
   - Variable name 填：`STOCK_KV` ⚠️**一字不差，全大寫底線**
   - KV namespace 從下拉選 `dky-stock-state`
   - Environment 通常勾 **Production**（如果有 Preview，也順手勾一下）
5. **Save**

> ⚠️ **常見錯誤**：Variable name 寫成 `stock_kv` 或 `STOCKKV` 都會讓後端找不到。必須是 `STOCK_KV`。

---

## 四、設定密碼 token（API 授權）（30 秒）

1. 同一個專案 **Settings** → 左側 **Variables and Secrets**（或舊版叫 **Environment variables**）
2. 點 **Add variable**
   - Variable name：`API_TOKEN` ⚠️ 一字不差
   - Value：
     ```
     bcd67b59cd18fdd2c7e4675c46e0126a3d6cacdf4811263e8c3725436f3c4fb2
     ```
     （這是現有網站密碼 `611118` 的 SHA-256，跟前端用同一個值就好）
   - Type 建議選 **Secret**（會自動加密儲存、不再可見）
   - Environment 勾 **Production**
3. **Save**

> 🔐 **如果之後改網站密碼**：那 `API_TOKEN` 也要跟著換成新密碼的 SHA-256。前端的 `PASSWORD_HASH` 一改，這邊也要改。

---

## 五、重新部署（讓綁定生效）（1 分鐘）

KV / 環境變數的更動**不會自動套用到已部署的版本**，必須重新部署一次：

**方法 A — 直接 redeploy 最新版**
1. **Deployments** 分頁
2. 找到最新的 production deployment → 右側 ⋯ → **Retry deployment**

**方法 B — 推一個新 commit（更直覺）**
```bash
git commit --allow-empty -m "redeploy: enable KV binding"
git push
```

**驗證部署完成**：Deployments 頁面最新一筆顯示 **Active**，時間是剛剛。

---

## 六、測試是否成功

### 測試 1：API 直接打（最快確認後端有起來）

打開瀏覽器，貼到網址列：
```
https://use.dky.tw/api/state
```
正常會看到：
```json
{"success":false,"error":"Unauthorized"}
```
✅ 看到 `Unauthorized` 代表**後端有起來、KV 也綁好了**（因為我們沒帶 token，被擋是對的）。

如果看到 `STOCK_KV namespace not bound` → 第三步綁定沒做好，回頭檢查 Variable name。
如果看到 404 或網頁 → 第五步沒部署，重做。

### 測試 2：實際同步流程

1. 用你自己的瀏覽器打開 https://use.dky.tw
2. 輸入密碼 `611118` 解鎖
3. 進入 📈 **美股追蹤**
4. 開 DevTools（F12）→ **Network** 分頁
5. 觀察應該看到：
   - `GET /api/state` 回 200，body 是 `{"success":true,"state":null,"updatedAt":0}`（第一次當然是空的）
   - 右下角的同步狀態顯示 `☁️ 已同步`（淡綠字）
6. 新增一筆買入 → **等 1.5 秒** → Network 應出現 `PUT /api/state` 回 200
7. 關掉整個瀏覽器，換另一台裝置（或無痕視窗 + 清快取）→ 重開 → 應該看到剛才那筆買入自動還原

### 測試 3：驗證隔離

如果想百分百確定資料存進 KV：
1. Dashboard → KV → `dky-stock-state` → 點 **View** / **KV pairs**
2. 應該看到一筆 key = `us-stocks:default`、value 是一大坨 JSON

---

## 七、之後的維運

### 想清空雲端資料 / 重置
- Dashboard → KV → `dky-stock-state` → 找到 key `us-stocks:default` → **Delete**
- 下次任何一個瀏覽器開 App，會把它本機資料推上去當新的雲端版本

### 看用量
- KV 列表頁可以看到每天的讀寫次數、儲存量
- 個人帳本永遠用不到免費額度的 1%

### 想完全砍掉這個同步
- Dashboard → 你的 Pages 專案 → Settings → Bindings → 刪除 `STOCK_KV`
- 前端會偵測到無回應 → 自動切到 `⚠️ 離線`，仍可用 localStorage 操作

### 換密碼怎麼辦？
1. 算新密碼的 SHA-256（瀏覽器 DevTools console 跑：
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('新密碼')).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
   ```
2. 把 [app.js:7](app.js#L7) 的 `PASSWORD_HASH` 換成新值，commit + push
3. Dashboard → Variables → 編輯 `API_TOKEN` 改成新值，重新部署

---

## 八、Troubleshooting Cheat Sheet

| 症狀 | 原因 | 修法 |
|------|------|------|
| 同步狀態一直顯示 `⚠️ 離線` | 後端沒部署 / KV 沒綁 / token 不對 | 開 DevTools Network 看 `/api/state` 的回應，照訊息查 |
| Network 顯示 401 | `API_TOKEN` 設錯，前後不一致 | 確認 Dashboard 的 `API_TOKEN` 跟 [app.js:7](app.js#L7) `PASSWORD_HASH` 完全相同 |
| Network 顯示 500，error 是 `STOCK_KV namespace not bound` | Variable name 拼錯，或忘記重新部署 | 改成 `STOCK_KV`（一字不差），retry deployment |
| 對方那邊看不到我這邊的資料 | 是不是其中一邊還在用舊版（Service Worker 卡舊版） | 對方關掉所有分頁、重新打開；或 DevTools → Application → Service Workers → Unregister |
| Dashboard 找不到 KV 選單 | Cloudflare 介面改版 | 搜尋 "KV" 或從 **Storage & Databases** 進 |

---

## 九、安全注意

- `API_TOKEN` 雖然存在 Cloudflare Secret，但這個值會在前端 JS bundle 裡（=網頁原始碼）。**理論上任何看到你網站的人都能拿到 token**。
- 真正擋外部存取的是「沒人知道 `use.dky.tw` 這個網址 + 沒人知道網站密碼」。
- 這跟原本 GAS 模式的安全層級**完全相同**（GAS URL 本來就是公開的），沒有變差。
- 想升級安全的話，後續可以改成「登入後才取得 short-lived token」，但目前不需要。

---

## 十、附錄：本地端開發測試

如果想在本地跑 `wrangler pages dev` 測試：

```bash
cd /Users/jy/tools/dky-tools/dky_use
# 建立本地的 KV namespace（會存在 .wrangler/ 下）
npx wrangler kv:namespace create STOCK_KV --preview

# 跑 dev server，把環境變數和 KV 綁起來
npx wrangler pages dev . --kv STOCK_KV --binding API_TOKEN=bcd67b59cd18fdd2c7e4675c46e0126a3d6cacdf4811263e8c3725436f3c4fb2
```

開 http://localhost:8788，行為跟 production 一樣，但 KV 資料只存在本地的 `.wrangler/` 目錄。

---

**就這樣，比 GAS 簡單十倍。對方什麼都不用做。**
