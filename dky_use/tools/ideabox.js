// IDEA Box 提案產生器 — 資料處理、HTML 渲染、Word/DOCX 產生

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function stripMarkdown(value = '') {
  return String(value).replace(/#{1,6}\s*/g, '').replace(/\*\*/g, '').replace(/__/g, '').replace(/`{1,3}/g, '').replace(/^\s*[-*]\s+/gm, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}

function cleanIdeaText(value = '') {
  return stripMarkdown(value).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function getChecked(value, option) { return value === option ? '☑' : '☐'; }

function textToParagraphs(value = '') {
  const lines = cleanIdeaText(value).split('\n').map(l => l.trim()).filter(Boolean);
  return lines.length ? lines : [''];
}

function renderPlainParagraphs(value = '') {
  return textToParagraphs(value).map(line => `<p>${escapeHTML(line)}</p>`).join('');
}

export function renderIdeaTable(rows) {
  if (!rows || rows.length < 2) return '';
  const [header, ...body] = rows;
  return `<table><thead><tr>${header.map(h => `<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${escapeHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
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
    purpose: cleanIdeaText(safe.purpose) || cleanIdeaText(safe.主體說明) || `本提案希望改善目前流程中資訊分散、人工整理耗時的問題。透過「${form.title}」讓團隊能更快掌握重點，降低重複作業，並提升使用者感受與長期競爭力。`,
    description: cleanIdeaText(safe.description) || cleanIdeaText(safe.說明) || `提案方向是以使用者輸入的構想為核心，建立清楚、可追蹤、可調整的作業流程。構想內容為：${form.idea}`,
    aiApplication: cleanIdeaText(safe.aiApplication) || cleanIdeaText(safe.application) || 'AI 可擔任資料整理、初稿產生、重點摘要、風險提醒與內容一致性檢查的輔助角色，產出後仍由負責同仁確認正確性與合規性。',
    expectedBenefits: cleanIdeaText(safe.expectedBenefits) || cleanIdeaText(safe.benefits) || '預期效益包含縮短初稿整理時間、降低遺漏重點的機率、讓跨部門溝通更容易對齊，並提升服務或內部作業的一致性。',
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
        <tr><th rowspan="2">提案單位</th><td>${getChecked(data.company, '台灣人壽')} 台灣人壽　　${getChecked(data.company, '中信產險')} 中信產險</td></tr>
        <tr><td class="idea-muted">${escapeHTML(departmentHint)}</td></tr>
        <tr><th>團隊成員</th><td>${escapeHTML(data.members)}</td></tr>
        <tr><th>提案名稱</th><td>${escapeHTML(data.title)}</td></tr>
        <tr><th>應用構面</th><td>${getChecked(data.dimension, '公平待客')} 公平待客　　${getChecked(data.dimension, '業績提升')} 業績提升　　${getChecked(data.dimension, '流程優化')} 流程優化　　${getChecked(data.dimension, '專業知能')} 專業知能</td></tr>
      </tbody>
    </table>
    ${data.analysisRows ? `<h4>決策分析參考</h4>${renderIdeaTable(data.analysisRows)}` : ''}
    <h4>請簡述點子</h4>
    <table class="idea-body-table"><tbody>
      <tr><td><h5>1. 提案目的</h5>${renderPlainParagraphs(data.purpose)}</td></tr>
      <tr><td><h5>2. 提案說明</h5>${renderPlainParagraphs(data.description)}</td></tr>
      <tr><td><h5>3. AI 輔助應用說明</h5>${renderPlainParagraphs(data.aiApplication)}</td></tr>
      <tr><td><h5>4. 預期效益</h5>${renderPlainParagraphs(data.expectedBenefits)}</td></tr>
      <tr><td><h5>5. 可行性</h5>${renderPlainParagraphs(data.feasibility)}<p>配合部門：${escapeHTML(data.cooperatingDepartment)}</p><p>配合事項：${escapeHTML(data.cooperationDetails)}</p></td></tr>
    </tbody></table>
    <p><strong>註: 提案內容以５頁 A4 為限</strong></p>
  `;
}

export function buildIdeaBoxPlainText(data) {
  const analysis = data.analysisRows ? ['決策分析參考', data.analysisRows.map(row => row.join('｜')).join('\n'), ''] : [];
  return [
    'IDEA Box 提案書', `提案單位：${data.company} / ${data.department}`, `團隊成員：${data.members}`, `提案名稱：${data.title}`, `應用構面：${data.dimension}`, '',
    ...analysis, '請簡述點子', `1. 提案目的\n${data.purpose}`, `2. 提案說明\n${data.description}`, `3. AI 輔助應用說明\n${data.aiApplication}`,
    `4. 預期效益\n${data.expectedBenefits}`, `5. 可行性\n${data.feasibility}`, `配合部門：${data.cooperatingDepartment}`, `配合事項：${data.cooperationDetails}`, '', '註: 提案內容以５頁 A4 為限'
  ].join('\n\n');
}

// ── Word 輸出 ──
function escapeXml(v) { return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c])); }
const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function wordRun(text, opts = {}) {
  const p = [`<w:rFonts w:ascii="Microsoft JhengHei" w:eastAsia="微軟正黑體" w:hAnsi="Microsoft JhengHei"/>`,
    opts.bold ? '<w:b/><w:bCs/>' : '', opts.underline ? '<w:u w:val="single"/>' : '',
    `<w:sz w:val="${opts.size||24}"/><w:szCs w:val="${opts.size||24}"/>`].join('');
  const sp = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : '';
  return `<w:r><w:rPr>${p}</w:rPr><w:t${sp}>${escapeXml(text)}</w:t></w:r>`;
}

function wordParagraph(text, opts = {}) {
  const jc = opts.align ? `<w:jc w:val="${opts.align}"/>` : '';
  const sp = `<w:spacing w:before="${opts.before||0}" w:after="${opts.after||80}" w:line="${opts.line||360}" w:lineRule="auto"/>`;
  const ind = opts.indent ? `<w:ind w:left="${opts.indent}"/>` : '';
  return `<w:p><w:pPr>${sp}${jc}${ind}</w:pPr>${wordRun(text, opts)}</w:p>`;
}

function wordCell(content, opts = {}) {
  const w = opts.width ? `<w:tcW w:w="${opts.width}" w:type="dxa"/>` : '';
  const va = opts.valign ? `<w:vAlign w:val="${opts.valign}"/>` : '<w:vAlign w:val="top"/>';
  const sh = opts.shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${opts.shade}"/>` : '';
  const gs = opts.gridSpan ? `<w:gridSpan w:val="${opts.gridSpan}"/>` : '';
  const vm = opts.vMerge ? `<w:vMerge${opts.vMerge==='continue'?'':` w:val="${opts.vMerge}"`}/>` : '';
  const ps = Array.isArray(content) ? content.join('') : (content || '<w:p/>');
  return `<w:tc><w:tcPr>${w}${gs}${vm}${va}${sh}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${ps}</w:tc>`;
}

function wordSectionCell(title, body) {
  return [wordCell([wordParagraph(title,{bold:true,size:24,after:80}), ...textToParagraphs(body).map(l=>wordParagraph(l,{size:24,after:60}))], {width:10774})];
}

function buildIdeaBoxDocumentXml(data) {
  const dh = data.department === '未填寫' ? '客戶服務處/營運規劃處/通路一處/商品精算處/資訊處/總經理轄下/通路二處/不動產投資處/行政管理處/金融投資二處/金融投資一處/財務處' : data.department;
  const hr = [
    [wordCell(wordParagraph('提案單位',{align:'center',after:0}),{width:1560,valign:'center',vMerge:'restart'}), wordCell(wordParagraph(`${getChecked(data.company,'台灣人壽')} 台灣人壽    ${getChecked(data.company,'中信產險')} 中信產險`,{after:0}),{width:9214,valign:'center'})],
    [wordCell('',{width:1560,valign:'center',vMerge:'continue'}), wordCell(wordParagraph(dh,{after:0}),{width:9214,valign:'center'})],
    [wordCell(wordParagraph('團隊成員',{align:'center',after:0}),{width:1560,valign:'center'}), wordCell(wordParagraph(data.members,{after:0}),{width:9214,valign:'center'})],
    [wordCell(wordParagraph('提案名稱',{align:'center',after:0}),{width:1560,valign:'center'}), wordCell(wordParagraph(data.title,{after:0}),{width:9214,valign:'center'})],
    [wordCell(wordParagraph('應用構面',{align:'center',after:0}),{width:1560,valign:'center'}), wordCell(wordParagraph(`${getChecked(data.dimension,'公平待客')} 公平待客    ${getChecked(data.dimension,'業績提升')} 業績提升    ${getChecked(data.dimension,'流程優化')} 流程優化    ${getChecked(data.dimension,'專業知能')} 專業知能`,{bold:true,after:0}),{width:9214,valign:'center'})]
  ];
  const br = [
    wordSectionCell('1. 提案目的', data.purpose), wordSectionCell('2. 提案說明', data.description),
    wordSectionCell('3. AI 輔助應用說明', data.aiApplication), wordSectionCell('4. 預期效益', data.expectedBenefits),
    wordSectionCell('5. 可行性', `${data.feasibility}\n\n配合部門：${data.cooperatingDepartment}\n配合事項：${data.cooperationDetails}`)
  ];
  const tblBorders = `<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:left w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:right w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="808080"/></w:tblBorders>`;
  const wt = (rows, widths) => `<w:tbl><w:tblPr><w:tblW w:w="10774" w:type="dxa"/>${tblBorders}</w:tblPr>${widths?`<w:tblGrid>${widths.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`:''}<w:tblGrid><w:gridCol w:w="1560"/><w:gridCol w:w="9214"/></w:tblGrid>${rows.map(r=>`<w:tr>${r.join('')}</w:tr>`).join('')}</w:tbl>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${WORD_NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>
    ${wordParagraph('IDEA Box 提案書',{align:'center',bold:true,underline:true,size:32,after:240})}
    ${wordParagraph('報名資料：',{bold:true,size:28,after:120})}${wt(hr)}
    ${wordParagraph('',{after:100})}${wordParagraph('請簡述點子',{bold:true,size:28,after:120})}${wt(br,[10774])}
    ${wordParagraph('註: 提案內容以５頁 A4 為限',{bold:true,size:20,after:0})}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="709" w:right="1274" w:bottom="932" w:left="851" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
  </w:body></w:document>`;
}

function makeCrcTable() { const t=[]; for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);t[n]=c>>>0} return t; }
const CRC_TABLE = makeCrcTable();
function crc32(bytes) { let c=0xffffffff; for(let i=0;i<bytes.length;i++)c=CRC_TABLE[(c^bytes[i])&0xff]^(c>>>8); return (c^0xffffffff)>>>0; }
function zipDateParts(d=new Date()) { return {dosTime:(d.getHours()<<11)|(d.getMinutes()<<5)|Math.floor(d.getSeconds()/2),dosDate:((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()}; }

function makeZipBlob(files) {
  const encoder = new TextEncoder(), now = zipDateParts(), localParts=[], centralParts=[];
  let offset=0;
  Object.entries(files).forEach(([name,content])=>{
    const nb=encoder.encode(name), data=encoder.encode(content), crcVal=crc32(data);
    const local=new Uint8Array(30+nb.length+data.length), lv=new DataView(local.buffer);
    lv.setUint32(0,0x04034b50,true); lv.setUint16(4,20,true); lv.setUint16(8,0,true); lv.setUint16(10,now.dosTime,true); lv.setUint16(12,now.dosDate,true);
    lv.setUint32(14,crcVal,true); lv.setUint32(18,data.length,true); lv.setUint32(22,data.length,true); lv.setUint16(26,nb.length,true); lv.setUint16(28,0,true);
    local.set(nb,30); local.set(data,30+nb.length); localParts.push(local);
    const central=new Uint8Array(46+nb.length), cv=new DataView(central.buffer);
    cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true); cv.setUint16(8,0,true); cv.setUint16(10,0,true);
    cv.setUint16(12,now.dosTime,true); cv.setUint16(14,now.dosDate,true); cv.setUint32(16,crcVal,true); cv.setUint32(20,data.length,true); cv.setUint32(24,data.length,true);
    cv.setUint16(28,nb.length,true); cv.setUint16(30,0,true); cv.setUint16(32,0,true); cv.setUint16(34,0,true); cv.setUint16(36,0,true); cv.setUint32(38,0,true); cv.setUint32(42,offset,true);
    central.set(nb,46); centralParts.push(central); offset+=local.length;
  });
  const cdSize=centralParts.reduce((s,p)=>s+p.length,0), cdStart=offset, total=cdStart+cdSize+22;
  const eocd=new Uint8Array(22), ev=new DataView(eocd.buffer);
  ev.setUint32(0,0x06054b50,true); ev.setUint16(8,localParts.length,true); ev.setUint16(10,centralParts.length,true);
  ev.setUint32(12,cdSize,true); ev.setUint32(16,cdStart,true);
  const result=new Uint8Array(total); let pos=0;
  localParts.forEach(p=>{result.set(p,pos);pos+=p.length});
  centralParts.forEach(p=>{result.set(p,pos);pos+=p.length});
  result.set(eocd,pos); return new Blob([result],{type:'application/zip'});
}

function buildDocxFiles(data) {
  const now = new Date().toISOString();
  return {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/_rels/document.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
    'word/document.xml': buildIdeaBoxDocumentXml(data)
  };
}

export function buildIdeaBoxDocxBlob(data) { return makeZipBlob(buildDocxFiles(data)); }
