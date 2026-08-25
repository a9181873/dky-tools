/* 全站共用：完整課程地圖側欄、搜尋、快捷鍵、進度、上一課／下一課。 */
(function () {
  if (document.querySelector('.study-sidebar')) return;

  // [章節, 課名, 網址] — 三條課程線 + 延伸閱讀，全站唯一導覽資料源
  const lessons = [
    ['統計學習 · 第 2 章','2.1 什麼是統計學習？','/statistics/02_What_Is_Statistical_Learning'],
    ['','2.2 評估模型準確度','/statistics/02_Assessing_Model_Accuracy'],
    ['','2.3 Lab：Python 入門','/statistics/02_Lab_Python_Introduction'],
    ['第 3 章｜線性迴歸','3.1 簡單線性迴歸','/statistics/03_simple_linear_regression'],
    ['','3.2 多元線性迴歸','/statistics/3.2_multiple_linear_regression'],
    ['','3.3 迴歸模型的其他考量','/statistics/3_3_other_considerations'],
    ['','3.4 行銷計畫','/statistics/3.4_the_marketing_plan'],
    ['','3.5 線性迴歸 vs KNN','/statistics/3.5_linear_regression_vs_knn'],
    ['','3.6 Lab：線性迴歸','/statistics/3.6_lab_linear_regression'],
    ['第 4 章｜分類','4.3 邏輯回歸','/statistics/4.3_logistic_regression'],
    ['','4.4 生成模型（LDA/QDA）','/statistics/04_Generative_Models'],
    ['','4.5 分類方法比較','/statistics/04_classification_methods_comparison'],
    ['','4.6 廣義線性模型','/statistics/4_6_generalized_linear_models'],
    ['','4.7 Lab：分類方法','/statistics/04_7_lab_classification_methods'],
    ['第 5 章｜重抽樣','5.1 交叉驗證','/statistics/05_cross_validation'],
    ['','5.2 Bootstrap','/statistics/05_the_bootstrap'],
    ['','5.3 Lab：CV 與 Bootstrap','/statistics/05_lab_cross_validation_bootstrap'],
    ['第 6 章｜模型選擇','6.1 子集選擇','/statistics/6.1_subset_selection'],
    ['','6.2 收縮方法（Ridge/Lasso）','/statistics/6.2_shrinkage_methods'],
    ['','6.3 PCR 與 PLS','/statistics/6.3_pcr_pls'],
    ['','6.4 高維度資料','/statistics/6.4_high_dimensions'],
    ['','6.5 Lab：正則化','/statistics/6.5_lab_regularization'],
    ['第 7 章｜非線性','7.1 多項式迴歸','/statistics/7.1_polynomial_regression'],
    ['','7.2 階梯函數','/statistics/7.2_step_functions'],
    ['','7.3 基底函數','/statistics/7.3_basis_functions'],
    ['','7.4 迴歸樣條','/statistics/7.4_regression_splines'],
    ['','7.5 平滑樣條','/statistics/7.5_smoothing_splines'],
    ['','7.6 局部迴歸','/statistics/7.6_local_regression'],
    ['','7.7 廣義加法模型','/statistics/7.7_generalized_additive_models'],
    ['','7.8 Lab：非線性建模','/statistics/7.8_lab_nonlinear_modeling'],
    ['第 8 章｜樹狀方法','8.1 決策樹基礎','/statistics/8.1_decision_trees'],
    ['','8.2 隨機森林與 Boosting','/statistics/8.2_bagging_random_forests_boosting'],
    ['','8.3 Lab：決策樹','/statistics/8.3_lab_tree_methods'],
    ['第 9 章｜SVM','9.1 最大邊界分類器','/statistics/9.1_maximal_margin_classifier'],
    ['','9.2 支援向量分類器','/statistics/9.2_support_vector_classifiers'],
    ['','9.3 支援向量機','/statistics/9.3_support_vector_machines'],
    ['','9.4 多類別 SVM','/statistics/9.4_svm_multiclass'],
    ['','9.5 SVM 與邏輯回歸','/statistics/9.5_relationship_to_logistic_regression'],
    ['','9.6 Lab：SVM','/statistics/9.6_lab_svm'],
    ['第 10 章｜深度學習','10.1 單層神經網路','/statistics/10.1_single_layer_neural_networks'],
    ['','10.2 多層神經網路','/statistics/10.2_multilayer_neural_networks'],
    ['','10.3 卷積神經網路','/statistics/10.3_convolutional_neural_networks'],
    ['','10.4 文件分類','/statistics/10.4_document_classification'],
    ['AI Agents 入門（15 課）','1. 什麼是 AI Agent？','/ai-agents/ai-agents-01-intro'],
    ['','2. 探索 Agentic 框架','/ai-agents/ai-agents-02-frameworks'],
    ['','3. Agentic 設計原則','/ai-agents/ai-agents-03-patterns/'],
    ['','4. 工具使用設計模式','/ai-agents/ai-agents-04-tool-use/'],
    ['','5. Agentic RAG','/ai-agents/ai-agents-05-rag/'],
    ['','6. 可信賴的 AI Agent','/ai-agents/ai-agents-06-trustworthy/'],
    ['','7. 規劃設計模式','/ai-agents/ai-agents-07-planning/'],
    ['','8. 多 Agent 設計模式','/ai-agents/ai-agents-08-multi-agent/'],
    ['','9. 元認知設計模式','/ai-agents/ai-agents-09-metacognition/'],
    ['','10. 上線實戰：可觀測性與評估','/ai-agents/ai-agents-10-production'],
    ['','11. 通訊協定 MCP/A2A/NLWeb','/ai-agents/ai-agents-11-protocols'],
    ['','12. Context Engineering','/ai-agents/ai-agents-12-context/'],
    ['','13. 記憶管理','/ai-agents/ai-agents-13-memory/'],
    ['','14. Microsoft Agent Framework','/ai-agents/ai-agents-14-maf/'],
    ['','15. Computer Use Agent','/ai-agents/ai-agents-15-cua/']
  ];

  const normalize = p => (p.replace(/index\.html$/, '').replace(/\/$/, '') || '/');
  const current = normalize(location.pathname);
  const nav = lessons.map(([section, label, href]) =>
    `${section ? `<div class="study-sidebar__section">${section}</div>` : ''}<a class="study-nav-link" href="${href}" ${normalize(href) === current ? 'aria-current="page"' : ''}>${label}</a>`
  ).join('');

  document.body.classList.add('has-study-sidebar');
  document.body.insertAdjacentHTML('afterbegin', `<nav id="study-sidebar" class="study-sidebar" aria-label="學習索引地圖"><a class="study-sidebar__brand" href="/"><span>學習中心</span><small>統計學習 · AI 技術 · 自由探索</small></a><div class="study-sidebar__scroll"><a class="study-nav-link" href="/">🏠 首頁</a><a class="study-nav-link" href="/statistics/">📊 統計學習路徑</a><a class="study-nav-link" href="/research/">📖 延伸閱讀（67 篇）</a><div class="study-sidebar__section">課程目錄</div>${nav}<div class="study-sidebar__section">延伸閱讀</div><a class="study-nav-link" href="/research/">研究與工具資源</a></div><div class="study-sidebar__footer"><a href="https://tools.dky.tw">工具箱</a><a href="https://www.statlearning.com/">ISLP 原書</a></div></nav><button class="study-menu-toggle" type="button" aria-expanded="false" aria-controls="study-sidebar">☰ 目錄</button><button class="study-shortcuts-toggle" type="button" aria-expanded="false" aria-label="快捷鍵說明">⌨️</button><section class="study-shortcuts" hidden aria-label="快捷鍵說明"><h2>快捷鍵</h2><p><kbd>/</kbd> 搜尋　<kbd>?</kbd> 說明　<kbd>m</kbd> 目錄</p><p><kbd>←</kbd> <kbd>→</kbd> 或 <kbd>[</kbd> <kbd>]</kbd> 切換前後課</p><p><kbd>Home</kbd> 回首頁　<kbd>Esc</kbd> 關閉面板</p><p><kbd>Alt</kbd>+<kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> 首／統計／資源</p></section><div class="study-search" hidden><section class="study-search__box" role="dialog" aria-modal="true" aria-label="搜尋學習內容"><input type="search" autocomplete="off" placeholder="搜尋課名、主題或資源…" aria-label="搜尋學習內容"><div class="study-search__results"></div></section></div>`);

  const sidebar = document.querySelector('.study-sidebar');
  const menu = document.querySelector('.study-menu-toggle');
  menu.addEventListener('click', () => { const open = sidebar.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });

  // 目前位置：在側欄目前課程前後插入「上一課 / 下一課 / 章節位置」提示
  const courseLinks = lessons.map(x => x[2]);
  const pos = courseLinks.findIndex(x => normalize(x) === current);
  if (pos >= 0) {
    const bar = document.createElement('nav');
    bar.className = 'lesson-pager';
    bar.setAttribute('aria-label', '課程位置');
    const sectionNow = lessons[pos][0] || [...lessons.slice(0, pos + 1)].reverse().find(l => l[0])[0];
    const prev = pos > 0 ? `<a href="${courseLinks[pos - 1]}" rel="prev">← ${lessons[pos - 1][1]}</a>` : '<span></span>';
    const next = pos < courseLinks.length - 1 ? `<a href="${courseLinks[pos + 1]}" rel="next">${lessons[pos + 1][1]} →</a>` : '<span></span>';
    bar.innerHTML = `${prev}<span class="lesson-pager__pos">${sectionNow} · 第 ${pos + 1} / ${courseLinks.length} 課</span>${next}`;
    const anchor = document.querySelector('header') || document.querySelector('h1');
    if (anchor && !document.querySelector('.lesson-pager')) anchor.insertAdjacentElement('afterend', bar);
  }

  // 快捷鍵說明面板
  const shortcuts = document.querySelector('.study-shortcuts');
  const scToggle = document.querySelector('.study-shortcuts-toggle');
  function toggleShortcuts(force) { const open = force !== undefined ? force : shortcuts.hidden; shortcuts.hidden = !open; scToggle.setAttribute('aria-expanded', String(open)); }
  scToggle.addEventListener('click', () => toggleShortcuts());

  // 搜尋（索引來自側欄課程地圖 + 本頁連結）
  const search = document.querySelector('.study-search');
  const searchInput = search.querySelector('input');
  const results = search.querySelector('.study-results, .study-search__results');
  const catalog = lessons.map(([sec, label, href]) => ({ href: location.origin + href, label: (sec ? sec + '｜' : '') + label }));
  const contentLinks = [...document.querySelectorAll('a[href]')]
    .filter(a => a.href.startsWith(location.origin) && a.textContent.trim().length > 2)
    .map(a => ({ href: a.href, label: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 120) }));
  const pool = catalog.concat(contentLinks);
  function find(q) {
    const words = q.toLocaleLowerCase('zh-TW').trim().split(/\s+/).filter(Boolean);
    const seen = new Set();
    const matched = pool.filter(x => {
      const key = x.href;
      if (seen.has(key)) return false;
      if (words.every(w => x.label.toLocaleLowerCase('zh-TW').includes(w))) { seen.add(key); return true; }
      return false;
    }).slice(0, 14);
    results.innerHTML = matched.length
      ? matched.map(x => `<a href="${x.href}">${x.label}</a>`).join('')
      : '<p>找不到相符內容，請換個關鍵字。</p>';
  }
  function openSearch() { search.hidden = false; searchInput.value = ''; find(''); setTimeout(() => searchInput.focus(), 0); }
  searchInput.addEventListener('input', () => find(searchInput.value));
  search.addEventListener('click', e => { if (e.target === search) search.hidden = true; });

  function courseGo(offset) { if (pos >= 0 && courseLinks[pos + offset]) location.href = courseLinks[pos + offset]; }
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.key === 'Escape') { if (!search.hidden) search.hidden = true; else if (!shortcuts.hidden) toggleShortcuts(false); else { sidebar.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); } return; }
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); openSearch(); }
    else if (e.key === '?') { e.preventDefault(); toggleShortcuts(); }
    else if (e.key.toLowerCase() === 'm') { sidebar.classList.toggle('is-open'); menu.setAttribute('aria-expanded', sidebar.classList.contains('is-open')); }
    else if (e.key === 'Home') { e.preventDefault(); location.href = '/'; }
    else if (e.key === '[' || (e.key === 'ArrowLeft' && e.altKey)) courseGo(-1);
    else if (e.key === ']' || (e.key === 'ArrowRight' && e.altKey)) courseGo(1);
    else if (e.altKey && ['1', '2', '3'].includes(e.key)) location.href = e.key === '1' ? '/' : e.key === '2' ? '/statistics/' : '/research/';
  });

  // 本頁目錄（TOC）
  const headings = [...document.querySelectorAll('main h2, main h3, article h2, article h3, body > h2, body > h3')]
    .filter(h => h.offsetParent !== null).slice(0, 24);
  if (headings.length >= 2 && window.matchMedia('(min-width:1241px)').matches) {
    const toc = document.createElement('nav');
    toc.className = 'study-toc';
    toc.setAttribute('aria-label', '本頁目錄');
    toc.innerHTML = '<h2>本頁目錄</h2>';
    headings.forEach((h, i) => {
      if (!h.id) h.id = `section-${i + 1}`;
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      a.className = h.tagName === 'H3' ? 'level-3' : '';
      toc.appendChild(a);
    });
    document.body.appendChild(toc);
  }

  // 學習完成狀態 + 閱讀進度
  const pageKey = 'dky-learn-complete:' + current;
  const utility = document.createElement('section');
  utility.className = 'study-utility';
  utility.setAttribute('aria-label', '學習工具');
  utility.innerHTML = `<label><input type="checkbox" ${localStorage.getItem(pageKey) === '1' ? 'checked' : ''}> 本頁已完成</label><span class="study-reading-progress" aria-hidden="true"><span></span></span><button type="button">回到頂端</button>`;
  const anchor2 = document.querySelector('header,h1');
  if (anchor2) anchor2.insertAdjacentElement('afterend', utility);
  const checkbox = utility.querySelector('input');
  checkbox.addEventListener('change', () => localStorage.setItem(pageKey, checkbox.checked ? '1' : '0'));
  utility.querySelector('button').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  const barEl = utility.querySelector('.study-reading-progress span');
  const updateBar = () => { const max = document.documentElement.scrollHeight - innerHeight; barEl.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%'; };
  addEventListener('scroll', updateBar, { passive: true }); updateBar();
})();
