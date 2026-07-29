// 學習中心 — shared sidebar
(function() {
  if (document.querySelector('.dky-sidebar')) return;

  const sidebarHTML = `
  <nav class="dky-sidebar sidebar">
    <div class="sidebar-header">
      <a href="/">📚 學習中心</a>
      <div class="sub">系統課程 · 精選資源 · 自由探索</div>
    </div>
    <div class="sidebar-nav">
      <div class="section-title">📊 統計學習入門 (ISLP)</div>
      <a href="/statistics/02_What_Is_Statistical_Learning.html" class="nav-item done">2.1 什麼是統計學習？</a>
      <a href="/statistics/02_Assessing_Model_Accuracy.html" class="nav-item done">2.2 評估模型準確度</a>
      <a href="/statistics/02_Lab_Python_Introduction.html" class="nav-item done">2.3 Lab: Python 入門</a>
      <a href="/statistics/03_simple_linear_regression.html" class="nav-item done">3.1 簡單線性迴歸</a>
      <a href="/statistics/3.2_multiple_linear_regression.html" class="nav-item done">3.2 多元線性迴歸</a>
      <a href="/statistics/3_3_other_considerations.html" class="nav-item done">3.3 迴歸模型的其他考量</a>
      <a href="/statistics/3.4_the_marketing_plan.html" class="nav-item done">3.4 行銷計畫</a>
      <a href="/statistics/3.5_linear_regression_vs_knn.html" class="nav-item done">3.5 線性迴歸 vs KNN</a>
      <a href="/statistics/3.6_lab_linear_regression.html" class="nav-item done">3.6 Lab: 線性迴歸</a>
      <span class="nav-item done">4.1-4.2 分類概述</span>
      <a href="/statistics/4.3_logistic_regression.html" class="nav-item done">4.3 邏輯回歸</a>
      <a href="/statistics/04_Generative_Models.html" class="nav-item done">4.4 生成模型：LDA・QDA・Naive Bayes</a>
      <a href="/statistics/04_classification_methods_comparison.html" class="nav-item done">4.5 分類方法比較</a>
      <a href="/statistics/4_6_generalized_linear_models.html" class="nav-item done">4.6 廣義線性模型</a>
      <a href="/statistics/04_7_lab_classification_methods.html" class="nav-item done">4.7 Lab: 邏輯回歸・LDA・QDA・KNN</a>
      <a href="/statistics/05_cross_validation.html" class="nav-item done">5.1 交叉驗證</a>
      <a href="/statistics/05_the_bootstrap.html" class="nav-item done">5.2 Bootstrap</a>
      <a href="/statistics/05_lab_cross_validation_bootstrap.html" class="nav-item done">5.3 Lab: CV & Bootstrap</a>
      <a href="/statistics/6.1_subset_selection.html" class="nav-item done">6.1 子集選擇</a>
      <a href="/statistics/6.2_shrinkage_methods.html" class="nav-item done">6.2 收縮方法</a>
      <a href="/statistics/6.3_pcr_pls.html" class="nav-item done">6.3 PCR 與 PLS</a>
      <a href="/statistics/6.4_high_dimensions.html" class="nav-item done">6.4 高維度資料</a>
      <a href="/statistics/6.5_lab_regularization.html" class="nav-item done">6.5 Lab: 線性模型選擇與正則化</a>
      <a href="/statistics/7.1_polynomial_regression.html" class="nav-item done">7.1 多項式迴歸</a>
      <a href="/statistics/7.2_step_functions.html" class="nav-item done">7.2 階梯函數</a>
<a href="/statistics/7.3_basis_functions.html" class="nav-item done">7.3 基底函數</a>
<a href="/statistics/7.4_regression_splines.html" class="nav-item done">7.4 迴歸樣條</a>
<a href="/statistics/7.5_smoothing_splines.html" class="nav-item done">7.5 平滑樣條</a>
<a href="/statistics/7.6_local_regression.html" class="nav-item done">7.6 局部迴歸</a>
<a href="/statistics/7.7_generalized_additive_models.html" class="nav-item done">7.7 廣義加法模型</a>
<a href="/statistics/7.8_lab_nonlinear_modeling.html" class="nav-item done">7.8 Lab: 非線性建模</a>

      <div class="section-title" style="margin-top:0.8rem">📖 第 8 章：樹狀方法（Tree-Based Methods）</div>
      <a href="/statistics/8.1_decision_trees.html" class="nav-item done">8.1 決策樹基礎</a>
      <a href="/statistics/8.2_bagging_random_forests_boosting.html" class="nav-item done">8.2 Bagging・隨機森林・Boosting</a>
      <a href="/statistics/8.3_lab_tree_methods.html" class="nav-item done">8.3 Lab: 決策樹</a>

      <div class="section-title" style="margin-top:1.2rem">📖 第 9 章：支援向量機（SVM）</div>
      <a href="/statistics/9.1_maximal_margin_classifier.html" class="nav-item done">9.1 最大邊界分類器</a>
      <a href="/statistics/9.2_support_vector_classifiers.html" class="nav-item done">9.2 支援向量分類器</a>

      <div class="section-title" style="margin-top:1.2rem">🤖 更多課程 <span class="coming">即將推出</span></div>

      <div class="section-title" style="margin-top:0.8rem">📖 精選資源</div>
      <a href="/research/prompt-engineering-guide.html" class="nav-item-link">Prompt Engineering Guide</a>
      <a href="/research/" class="nav-item-link">→ 全部資源</a>
    </div>
    <div class="sidebar-footer">
      <a href="https://tools.dky.tw">工具箱</a>
      <a href="https://www.statlearning.com/">ISLP 課本</a>
    </div>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  const style = document.createElement('style');
  style.textContent = `
  .sidebar {
    width: 240px; background: #161b22; border-right: 1px solid #30363d;
    position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto; z-index: 100;
    display: flex; flex-direction: column;
  }
  .sidebar-header {
    padding: 1.2rem 1rem; border-bottom: 1px solid #30363d;
    font-weight: 700; font-size: 1rem; color: #f0f6fc;
  }
  .sidebar-header a { color: inherit; text-decoration: none; }
  .sidebar-header .sub { font-size: 0.72rem; color: #8b949e; font-weight: 400; }
  .sidebar-nav { flex: 1; padding: 0.8rem 0; }
  .sidebar-nav .section-title {
    padding: 0.5rem 1rem 0.3rem; font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.04em; color: #8b949e; display: flex; align-items: center; gap: 0.5rem;
  }
  .nav-item {
    display: block; padding: 0.35rem 1rem 0.35rem 1.5rem; font-size: 0.84rem;
    color: #484f58; border-left: 2px solid transparent; text-decoration: none;
  }
  a.nav-item:hover { background: rgba(88,166,255,0.06); }
  .nav-item.done { color: #8b949e; }
  a.nav-item.done:hover { color: #f0f6fc; border-left-color: #58a6ff; }
  .nav-item.pending { color: #d2991d; }
  .nav-item.done::before { content: "✓ "; color: #3fb950; font-size: 0.7rem; }
  .nav-item.pending::before { content: "○ "; color: #d2991d; font-size: 0.7rem; }
  .nav-item-link {
    display: block; padding: 0.35rem 1rem 0.35rem 1.5rem; font-size: 0.84rem;
    color: #58a6ff; border-left: 2px solid transparent; text-decoration: none;
  }
  .nav-item-link:hover { border-left-color: #58a6ff; background: rgba(88,166,255,0.05); }
  .coming { font-size: 0.65rem; color: #484f58; font-weight: 400; text-transform: none; }
  .sidebar-footer {
    padding: 0.8rem 1rem; border-top: 1px solid #30363d;
    font-size: 0.75rem; color: #8b949e; display: flex; gap: 0.8rem;
  }
  .sidebar-footer a { color: #58a6ff; text-decoration: none; }
  .sidebar-footer a:hover { text-decoration: underline; }
  body { margin-left: 240px; }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    body { margin-left: 0; }
  }
  `;
  document.head.appendChild(style);
})();
