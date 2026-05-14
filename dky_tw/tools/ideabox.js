// IDEA Box 提案產生器 — 資料處理、HTML 渲染、Word/DOCX 產生
// 從 app.js 提取，供單一來源維護

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function escapeXml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  }[char]));
}

function stripMarkdown(value = '') {
  return String(value)
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function cleanIdeaText(value = '') {
  return stripMarkdown(value)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getChecked(value, option) {
  return value === option ? '☑' : '☐';
}

function textToParagraphs(value = '') {
  const lines = cleanIdeaText(value).split('\n').map(line => line.trim()).filter(Boolean);
  return lines.length ? lines : [''];
}

function renderPlainParagraphs(value = '') {
  return textToParagraphs(value).map(line => `<p>${escapeHTML(line)}</p>`).join('');
}

export function renderIdeaTable(rows) {
  if (!rows || rows.length < 2) return '';
  const [head, ...body] = rows;
  return `
    <table>
      <thead><tr>${head.map(cell => `<th>${escapeHTML(cell)}</th>`).join('')}</tr></thead>
      <tbody>
        ${body.map(row => `<tr>${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

export function normalizeGeneratedIdea(data, form) {
  const safe = data && typeof data === 'object' ? data : {};
  const fallbackDepartment = form.department === '未填寫'
    ? '資訊處、流程權責單位、法遵或風控單位'
    : `${form.department}、資訊處、法遵或風控單位`;

  const analysisRows = Array.isArray(safe.analysisRows) && safe.analysisRows.length > 1
    ? safe.analysisRows.map(row => Array.isArray(row) ? row.map(cleanIdeaText) : [cleanIdeaText(row)])
    : null;

  return {
    company: cleanIdeaText(form.company) || '台灣人壽',
    department: cleanIdeaText(form.department) || '未填寫',
    members: cleanIdeaText(form.members) || '未填寫',
    title: cleanIdeaText(form.title) || '未命名',
    dimension: cleanIdeaText(form.dimension) || '流程優化',
    analysisType: cleanIdeaText(form.analysisType) || '可行性分析',
    idea: cleanIdeaText(form.idea),
    analysisRows,
    purpose: cleanIdeaText(safe.purpose) || `本提案希望改善目前流程中資訊分散、人工整理耗時、回覆品質不易一致的問題。透過「${form.title}」讓團隊能更快掌握重點，降低重複作業，並提升使用者感受與長期競爭力。`,
    description: cleanIdeaText(safe.description) || `提案方向是以使用者輸入的構想為核心，建立清楚、可追蹤、可調整的作業流程。構想內容為：${form.idea}`,
    aiApplication: cleanIdeaText(safe.aiApplication) || 'AI 可擔任資料整理、初稿產生、重點摘要、風險提醒與內容一致性檢查的輔助角色，產出後仍由負責同仁確認正確性與合規性。',
    expectedBenefits: cleanIdeaText(safe.expectedBenefits) || '預期效益包含縮短初稿整理時間、降低遺漏重點的機率、讓跨部門溝通更容易對齊，並提升服務或內部作業的一致性。',
    feasibility: cleanIdeaText(safe.feasibility) || '建議採短期試辦方式推進。三個月內完成需求盤點與原型，六個月內進行小範圍測試，一年內依結果評估是否擴大導入。',
    cooperatingDepartment: cleanIdeaText(safe.cooperatingDepartment) || fallbackDepartment,
    cooperationDetails: cleanIdeaText(safe.cooperationDetails) || '提供試辦情境、確認資料權限、定義審核規則、追蹤成效指標。'
  };
}

export function buildIdeaBoxHtml(data) {
  const departmentHint = data.department === '未填寫'
    ? '客戶服務處/營運規劃處/通路一處/商品精算處/資訊處/總經理轄下/通路二處/不動產投資處/行政管理處/金融投資二處/金融投資一處/財務處'
    : data.department;

  return `
    <h3><u>IDEA Box 提案書</u></h3>
    <h4>報名資料：</h4>
    <table class="idea-entry-table">
      <tbody>
        <tr>
          <th rowspan="2">提案單位</th>
          <td>${getChecked(data.company, '台灣人壽')} 台灣人壽　　${getChecked(data.company, '中信產險')} 中信產險</td>
        </tr>
        <tr>
          <td class="idea-muted">${escapeHTML(departmentHint)}</td>
        </tr>
        <tr><th>團隊成員</th><td>${escapeHTML(data.members)}</td></tr>
        <tr><th>提案名稱</th><td>${escapeHTML(data.title)}</td></tr>
        <tr>
          <th>應用構面</th>
          <td>
            ${getChecked(data.dimension, '公平待客')} 公平待客
            ${getChecked(data.dimension, '業績提升')} 業績提升
            ${getChecked(data.dimension, '流程優化')} 流程優化
            ${getChecked(data.dimension, '專業知能')} 專業知能
          </td>
        </tr>
      </tbody>
    </table>

    ${data.analysisRows ? `
      <h4>決策分析參考</h4>
      ${renderIdeaTable(data.analysisRows)}
    ` : ''}

    <h4>請簡述點子，須包含但不限下述構面</h4>
    <table class="idea-body-table">
      <tbody>
        <tr><td><h5>1. 提案目的（why - 遇到什麼問題／想解決什麼問題？例如：從生活現況、社會環境或發現市場趨勢或觀察現有不足...等，以提升長期競爭力與差異化價值為主）</h5>${renderPlainParagraphs(data.purpose)}</td></tr>
        <tr><td><h5>2. 提案說明（請描述你的構想或方向，想像可以如何運用 AI 作為輔助？）</h5>${renderPlainParagraphs(data.description)}</td></tr>
        <tr><td><h5>3. AI 輔助應用說明（請說明本提案中，AI 預計扮演的角色。如何應用 AI 輔助工具來改善現況；AI 可以做什麼？使用情境或操作方式簡述）</h5>${renderPlainParagraphs(data.aiApplication)}</td></tr>
        <tr><td><h5>4. 預期效益、成效／商業模式或核心價值（value - 此提案可帶來的價值？滿足什麼需求？預計可帶來的新增效益之量/質化指標？）</h5>${renderPlainParagraphs(data.expectedBenefits)}</td></tr>
        <tr><td><h5>5. 可行性（when - 可落地實行度，預估執行時程：短期 1 年內、中期 1~3 年內、長期 3~5 年；建議提出合作部門，並說明配合事項）</h5>${renderPlainParagraphs(data.feasibility)}<p>配合部門：${escapeHTML(data.cooperatingDepartment)}</p><p>配合事項：${escapeHTML(data.cooperationDetails)}</p></td></tr>
      </tbody>
    </table>
    <p><strong>註: 提案內容以５頁 A4 為限</strong></p>
  `;
}

export function buildIdeaBoxPlainText(data) {
  const analysis = data.analysisRows
    ? ['決策分析參考', data.analysisRows.map(row => row.join('｜')).join('\n'), '']
    : [];

  return [
    'IDEA Box 提案書',
    `提案單位：${data.company} / ${data.department}`,
    `團隊成員：${data.members}`,
    `提案名稱：${data.title}`,
    `應用構面：${data.dimension}`,
    '',
    ...analysis,
    '請簡述點子，須包含但不限下述構面',
    `1. 提案目的\n${data.purpose}`,
    `2. 提案說明\n${data.description}`,
    `3. AI 輔助應用說明\n${data.aiApplication}`,
    `4. 預期效益、成效／商業模式或核心價值\n${data.expectedBenefits}`,
    `5. 可行性\n${data.feasibility}`,
    `配合部門：${data.cooperatingDepartment}`,
    `配合事項：${data.cooperationDetails}`,
    '',
    '註: 提案內容以５頁 A4 為限'
  ].join('\n\n');
}

// ── Word / DOCX 產生 ──

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function wordRun(text = '', options = {}) {
  const props = [
    '<w:rFonts w:ascii="Microsoft JhengHei" w:eastAsia="微軟正黑體" w:hAnsi="Microsoft JhengHei"/>',
    options.bold ? '<w:b/><w:bCs/>' : '',
    options.underline ? '<w:u w:val="single"/>' : '',
    `<w:sz w:val="${options.size || 24}"/><w:szCs w:val="${options.size || 24}"/>`
  ].join('');
  const preserve = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : '';
  return `<w:r><w:rPr>${props}</w:rPr><w:t${preserve}>${escapeXml(text)}</w:t></w:r>`;
}

function wordParagraph(text = '', options = {}) {
  const jc = options.align ? `<w:jc w:val="${options.align}"/>` : '';
  const spacing = `<w:spacing w:before="${options.before || 0}" w:after="${options.after || 80}" w:line="${options.line || 360}" w:lineRule="auto"/>`;
  const indent = options.indent ? `<w:ind w:left="${options.indent}"/>` : '';
  return `<w:p><w:pPr>${spacing}${jc}${indent}</w:pPr>${wordRun(text, options)}</w:p>`;
}

function wordCell(content, options = {}) {
  const width = options.width ? `<w:tcW w:w="${options.width}" w:type="dxa"/>` : '';
  const valign = options.valign ? `<w:vAlign w:val="${options.valign}"/>` : '<w:vAlign w:val="top"/>';
  const shade = options.shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${options.shade}"/>` : '';
  const gridSpan = options.gridSpan ? `<w:gridSpan w:val="${options.gridSpan}"/>` : '';
  const vMerge = options.vMerge ? `<w:vMerge${options.vMerge === 'continue' ? '' : ` w:val="${options.vMerge}"`}/>` : '';
  const paragraphs = Array.isArray(content) ? content.join('') : (content || '<w:p/>');
  return `<w:tc><w:tcPr>${width}${gridSpan}${vMerge}${valign}${shade}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${paragraphs}</w:tc>`;
}

function wordTable(rows, widths = []) {
  const grid = widths.length ? `<w:tblGrid>${widths.map(width => `<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid>` : '';
  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="10774" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="808080"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="808080"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="808080"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="808080"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="808080"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="808080"/>
        </w:tblBorders>
      </w:tblPr>
      ${grid}
      ${rows.map(row => `<w:tr>${row.join('')}</w:tr>`).join('')}
    </w:tbl>
  `;
}

function wordSectionCell(title, body) {
  const paragraphs = [
    wordParagraph(title, { bold: true, size: 24, after: 80 }),
    ...textToParagraphs(body).map(line => wordParagraph(line, { size: 24, after: 60 }))
  ];
  return [wordCell(paragraphs, { width: 10774 })];
}

function buildIdeaBoxDocumentXml(data) {
  const departmentHint = data.department === '未填寫'
    ? '客戶服務處/營運規劃處/通路一處/商品精算處/資訊處/總經理轄下/通路二處/不動產投資處/行政管理處/金融投資二處/金融投資一處/財務處'
    : data.department;

  const headerRows = [
    [
      wordCell(wordParagraph('提案單位', { align: 'center', after: 0 }), { width: 1560, valign: 'center', vMerge: 'restart' }),
      wordCell(wordParagraph(`${getChecked(data.company, '台灣人壽')} 台灣人壽    ${getChecked(data.company, '中信產險')} 中信產險`, { after: 0 }), { width: 9214, valign: 'center' })
    ],
    [
      wordCell('', { width: 1560, valign: 'center', vMerge: 'continue' }),
      wordCell(wordParagraph(departmentHint, { after: 0 }), { width: 9214, valign: 'center' })
    ],
    [
      wordCell(wordParagraph('團隊成員', { align: 'center', after: 0 }), { width: 1560, valign: 'center' }),
      wordCell(wordParagraph(data.members, { after: 0 }), { width: 9214, valign: 'center' })
    ],
    [
      wordCell(wordParagraph('提案名稱', { align: 'center', after: 0 }), { width: 1560, valign: 'center' }),
      wordCell(wordParagraph(data.title, { after: 0 }), { width: 9214, valign: 'center' })
    ],
    [
      wordCell(wordParagraph('應用構面', { align: 'center', after: 0 }), { width: 1560, valign: 'center' }),
      wordCell(wordParagraph(`${getChecked(data.dimension, '公平待客')} 公平待客    ${getChecked(data.dimension, '業績提升')} 業績提升    ${getChecked(data.dimension, '流程優化')} 流程優化    ${getChecked(data.dimension, '專業知能')} 專業知能`, { bold: true, after: 0 }), { width: 9214, valign: 'center' })
    ]
  ];

  const bodyRows = [
    wordSectionCell('1. 提案目的（why - 遇到什麼問題／想解決什麼問題？例如：從生活現況、社會環境或發現市場趨勢或觀察現有不足...等，以提升長期競爭力與差異化價值為主）', data.purpose),
    wordSectionCell('2. 提案說明（請描述你的構想或方向，想像可以如何運用 AI 作為輔助？）', data.description),
    wordSectionCell('3. AI 輔助應用說明（請說明本提案中，AI 預計扮演的角色。如何應用 AI 輔助工具來改善現況；AI 可以做什麼？使用情境或操作方式簡述）', data.aiApplication),
    wordSectionCell('4. 預期效益、成效／商業模式或核心價值（value - 此提案可帶來的價值？滿足什麼需求？預計可帶來的新增效益之量/質化指標？）', data.expectedBenefits),
    wordSectionCell('5. 可行性（when - 可落地實行度，預估執行時程：短期 1 年內、中期 1~3 年內、長期 3~5 年；建議提出合作部門，並說明配合事項）', `${data.feasibility}\n\n配合部門：${data.cooperatingDepartment}\n配合事項：${data.cooperationDetails}`)
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="${WORD_NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <w:body>
        ${wordParagraph('IDEA Box 提案書', { align: 'center', bold: true, underline: true, size: 32, after: 240 })}
        ${wordParagraph('報名資料：', { bold: true, size: 28, after: 120 })}
        ${wordTable(headerRows, [1560, 9214])}
        ${wordParagraph('', { after: 100 })}
        ${wordParagraph('請簡述點子，須包含但不限下述構面', { bold: true, size: 28, after: 120 })}
        ${wordTable(bodyRows, [10774])}
        ${wordParagraph('註: 提案內容以５頁 A4 為限', { bold: true, size: 20, after: 0 })}
        <w:sectPr>
          <w:pgSz w:w="11906" w:h="16838"/>
          <w:pgMar w:top="709" w:right="1274" w:bottom="932" w:left="851" w:header="720" w:footer="720" w:gutter="0"/>
        </w:sectPr>
      </w:body>
    </w:document>`;
}

function buildDocxFiles(data) {
  const now = new Date().toISOString();
  return {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
    'word/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="${WORD_NS}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Microsoft JhengHei" w:eastAsia="微軟正黑體" w:hAnsi="Microsoft JhengHei"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="zh-TW" w:eastAsia="zh-TW"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/></w:style></w:styles>`,
    'word/document.xml': buildIdeaBoxDocumentXml(data),
    'docProps/core.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(data.title)}</dc:title><dc:creator>DKY.tw IDEA Box</dc:creator><cp:lastModifiedBy>DKY.tw IDEA Box</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`,
    'docProps/app.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>DKY.tw IDEA Box</Application></Properties>`
  };
}

// ── ZIP 產生（STORE，無壓縮）──

function makeCrcTable() {
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipDateParts(date = new Date()) {
  return {
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    dosDate: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function writeUint16(view, offset, value) { view.setUint16(offset, value, true); }
function writeUint32(view, offset, value) { view.setUint32(offset, value >>> 0, true); }

function concatUint8(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  parts.forEach(part => { out.set(part, offset); offset += part.length; });
  return out;
}

function makeZipBlob(files) {
  const encoder = new TextEncoder();
  const now = zipDateParts();
  const localParts = [], centralParts = [];
  let offset = 0;

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const lv = new DataView(local.buffer);
    writeUint32(lv, 0, 0x04034b50); writeUint16(lv, 4, 20); writeUint16(lv, 6, 0);
    writeUint16(lv, 8, 0); writeUint16(lv, 10, now.dosTime); writeUint16(lv, 12, now.dosDate);
    writeUint32(lv, 14, crc); writeUint32(lv, 18, data.length); writeUint32(lv, 22, data.length);
    writeUint16(lv, 26, nameBytes.length); writeUint16(lv, 28, 0);
    local.set(nameBytes, 30); local.set(data, 30 + nameBytes.length);
    localParts.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    writeUint32(cv, 0, 0x02014b50); writeUint16(cv, 4, 20); writeUint16(cv, 6, 20);
    writeUint16(cv, 8, 0); writeUint16(cv, 10, 0); writeUint16(cv, 12, now.dosTime);
    writeUint16(cv, 14, now.dosDate); writeUint32(cv, 16, crc); writeUint32(cv, 20, data.length);
    writeUint32(cv, 24, data.length); writeUint16(cv, 28, nameBytes.length); writeUint16(cv, 30, 0);
    writeUint16(cv, 32, 0); writeUint16(cv, 34, 0); writeUint16(cv, 36, 0);
    writeUint32(cv, 38, 0); writeUint32(cv, 42, offset);
    central.set(nameBytes, 46);
    centralParts.push(central);
    offset += local.length;
  });

  const centralDirectory = concatUint8(centralParts);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  writeUint32(ev, 0, 0x06054b50); writeUint16(ev, 4, 0); writeUint16(ev, 6, 0);
  writeUint16(ev, 8, centralParts.length); writeUint16(ev, 10, centralParts.length);
  writeUint32(ev, 12, centralDirectory.length); writeUint32(ev, 16, offset);
  writeUint16(ev, 20, 0);

  return new Blob([concatUint8([...localParts, centralDirectory, end])], { type: 'application/zip' });
}

export function buildIdeaBoxDocxBlob(data) {
  return makeZipBlob(buildDocxFiles(data));
}
