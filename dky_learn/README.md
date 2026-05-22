# dky_learn — DKY 學習中心

基於 ISLP 等教材的繁體中文統計學習／機器學習教學網站。

## 結構

```
dky_learn/
├── index.html          # 首頁（科目導航）
├── statistics/          # 統計學習 (ISLP)
│   ├── 02_What_Is_Statistical_Learning.html
│   └── 02_Assessing_Model_Accuracy.html
├── machine-learning/    # 機器學習（預留）
├── python/              # Python（預留）
└── devops/              # 開發工具（預留）
```

## 部署

- **網域**：learn.dky.tw
- **平台**：Cloudflare Pages（免費）
- **建置**：靜態 HTML，無需建置步驟
- **自動部署**：push main 觸發

## 教學文件格式

每個 HTML 教學頁面需包含：
1. MathJax CDN（LaTeX 公式）
2. highlight.js CDN（程式碼高亮）
3. 理論區塊 + 資料佐證引用
4. 完整可執行 Python 範例（Google Drive/Colab 相容）
5. 應用場景、優缺點、技術比較表
