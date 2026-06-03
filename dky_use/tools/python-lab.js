// ISLP Lab: Python 入門 — NumPy, pandas, matplotlib 基礎操作
export function render() {
  return `
<div class="python-lab">
  <style>
    .python-lab h2 { color: #58a6ff; margin: 1.5rem 0 0.5rem; font-size: 1.2rem; border-left: 3px solid #58a6ff; padding-left: 0.6rem; }
    .python-lab h3 { color: #f0f6fc; margin: 1rem 0 0.3rem; font-size: 1rem; }
    .python-lab p, .python-lab li { color: #c9d1d9; line-height: 1.7; }
    .python-lab code { background: #1f2937; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.88rem; color: #f0a060; }
    .python-lab pre { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1rem; overflow-x: auto; margin: 0.5rem 0 1rem; }
    .python-lab pre code { background: none; padding: 0; color: #c9d1d9; }
    .python-lab table { width: 100%; border-collapse: collapse; margin: 0.8rem 0; }
    .python-lab th { background: #1f2937; color: #f0f6fc; padding: 0.4rem 0.8rem; text-align: left; font-size: 0.88rem; }
    .python-lab td { border-bottom: 1px solid #30363d; padding: 0.4rem 0.8rem; font-size: 0.88rem; }
    .python-lab .tip { background: #1a2f1a; border-left: 3px solid #3fb950; padding: 0.6rem 1rem; margin: 0.8rem 0; border-radius: 0 4px 4px 0; font-size: 0.9rem; }
    .python-lab .warn { background: #2a1f0a; border-left: 3px solid #d2991d; padding: 0.6rem 1rem; margin: 0.8rem 0; border-radius: 0 4px 4px 0; font-size: 0.9rem; }
  </style>

  <h2>📐 NumPy — 數值運算基石</h2>
  <p>NumPy 是 Python 科學計算的核心，提供高效的多維陣列（ndarray）與向量化運算。</p>

  <h3>建立陣列</h3>
  <pre><code>import numpy as np

# 從 list 建立
a = np.array([1, 2, 3, 4, 5])       # 一維
b = np.array([[1, 2], [3, 4]])       # 二維 (2×2)

# 常用快速建立
np.zeros((3, 4))      # 3×4 全 0 矩陣
np.ones((2, 3))       # 2×3 全 1 矩陣
np.arange(0, 10, 2)   # [0, 2, 4, 6, 8]
np.linspace(0, 1, 5)  # [0.  , 0.25, 0.5 , 0.75, 1.  ]
np.random.randn(3, 2) # 3×2 標準常態亂數</code></pre>

  <h3>基本屬性與索引</h3>
  <pre><code>a = np.array([[1, 2, 3], [4, 5, 6]])
a.shape    # (2, 3)
a.ndim     # 2（維度數）
a.dtype    # dtype('int64')
a[0, 1]    # 2（第 0 列第 1 行）
a[:, :2]   # 所有列的前 2 行
a[a > 3]   # 布林索引 → [4, 5, 6]</code></pre>

  <h3>向量化運算（比迴圈快 10-100 倍）</h3>
  <pre><code>x = np.array([1, 2, 3])
y = np.array([4, 5, 6])
x + y        # [5, 7, 9]
x * y        # [4, 10, 18]（element-wise）
np.dot(x, y) # 32（內積）
np.sqrt(x)   # [1., 1.414, 1.732]
np.sum(x)    # 6
np.mean(x)   # 2.0</code></pre>

  <div class="tip">💡 向量化 = 一次處理整個陣列，不需要寫 for 迴圈。速度關鍵！</div>

  <h2>🐼 pandas — 資料處理中樞</h2>
  <p>pandas 提供 DataFrame（二維表格）和 Series（一維序列），是統計分析的主力工具。</p>

  <h3>建立 DataFrame</h3>
  <pre><code>import pandas as pd

# 從 dict 建立
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Carol'],
    'age': [25, 30, 28],
    'score': [88, 72, 95]
})

# 從 CSV 讀取（ISLP 課本常用）
df = pd.read_csv('Advertising.csv', index_col=0)</code></pre>

  <h3>核心操作速查</h3>
  <table>
    <tr><th>操作</th><th>程式碼</th><th>說明</th></tr>
    <tr><td>看前幾筆</td><td><code>df.head()</code></td><td>前 5 筆</td></tr>
    <tr><td>基本統計</td><td><code>df.describe()</code></td><td>count, mean, std, min, quartiles, max</td></tr>
    <tr><td>欄位資訊</td><td><code>df.info()</code></td><td>dtype、缺失值</td></tr>
    <tr><td>選取欄位</td><td><code>df['score']</code></td><td>回傳 Series</td></tr>
    <tr><td>選取多欄</td><td><code>df[['age', 'score']]</code></td><td>回傳 DataFrame</td></tr>
    <tr><td>條件篩選</td><td><code>df[df['score'] > 80]</code></td><td>Boolean indexing</td></tr>
    <tr><td>新增欄位</td><td><code>df['pass'] = df['score'] >= 60</code></td><td>向量化賦值</td></tr>
    <tr><td>排序</td><td><code>df.sort_values('score', ascending=False)</code></td><td>降冪排列</td></tr>
  </table>

  <h3>處理缺失值</h3>
  <pre><code>df.isnull().sum()           # 各欄缺失數
df.dropna()                 # 刪除有缺失的列
df.fillna(0)                # 缺失值補 0
df['age'].fillna(df['age'].median(), inplace=True)  # 用中位數填補</code></pre>

  <div class="warn">⚠️ 課本 Advertising.csv 中 TV、radio、newspaper、sales 全部沒有缺失值，但真實資料一定有！</div>

  <h2>📊 matplotlib — 資料視覺化</h2>
  <p>最基礎的繪圖套件，幾乎所有 Python 視覺化工具都建立在它之上。</p>

  <h3>基本繪圖模式</h3>
  <pre><code>import matplotlib.pyplot as plt

# 折線圖
plt.plot(df['TV'], df['sales'], 'o')  # 'o' = 散點
plt.xlabel('TV budget')
plt.ylabel('Sales')
plt.title('TV vs Sales')
plt.show()

# 子圖（多圖並排）
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
axes[0].scatter(df['TV'], df['sales']); axes[0].set_title('TV')
axes[1].scatter(df['radio'], df['sales']); axes[1].set_title('Radio')
axes[2].scatter(df['newspaper'], df['sales']); axes[2].set_title('Newspaper')
plt.tight_layout()
plt.show()</code></pre>

  <h3>常用圖表類型</h3>
  <table>
    <tr><th>類型</th><th>函數</th><th>適用場景</th></tr>
    <tr><td>散點圖</td><td><code>plt.scatter(x, y)</code></td><td>兩變數關係</td></tr>
    <tr><td>折線圖</td><td><code>plt.plot(x, y)</code></td><td>趨勢、時間序列</td></tr>
    <tr><td>直方圖</td><td><code>plt.hist(data, bins=20)</code></td><td>分佈形狀</td></tr>
    <tr><td>盒鬚圖</td><td><code>plt.boxplot(data)</code></td><td>中位數、離群值</td></tr>
    <tr><td>熱力圖</td><td><code>plt.imshow(corr)</code></td><td>相關矩陣</td></tr>
  </table>

  <h3>統計學習最常用的視覺化組合</h3>
  <pre><code># 相關矩陣熱力圖
import seaborn as sns  # 建立在 matplotlib 之上
corr = df.corr()
sns.heatmap(corr, annot=True, cmap='coolwarm')
plt.title('Correlation Matrix')
plt.show()

# 殘差圖（診斷迴歸模型）
residuals = y_true - y_pred
plt.scatter(y_pred, residuals, alpha=0.6)
plt.axhline(y=0, color='r', linestyle='--')
plt.xlabel('Fitted values')
plt.ylabel('Residuals')
plt.show()</code></pre>

  <div class="tip">💡 ISLP 課本使用 <code>subplots()</code> 管理多個圖表，<code>tight_layout()</code> 自動調整間距。</div>

  <h2>🔗 ISLP 課本對應章節</h2>
  <ul>
    <li><strong>2.3 Lab: Introduction to Python</strong> — 本篇內容的來源章節</li>
    <li><strong>3.6 Lab: Linear Regression</strong> — 用 sklearn 實作迴歸 + matplotlib 視覺化</li>
    <li><strong>4.6 Lab: Logistic Regression</strong> — 分類模型 + 混淆矩陣視覺化</li>
  </ul>
  <p style="margin-top:1rem">📖 <a href="https://www.statlearning.com/" target="_blank">下載免費 PDF：An Introduction to Statistical Learning</a></p>
</div>`;
}
