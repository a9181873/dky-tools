// 單位換算器 (Unit Converter)
// 支援：長度、重量、溫度、面積、速度
// 全部純前端數學運算，不需任何外部 API

const title = '單位換算器';
const desc = '長度、重量、溫度、面積、速度等 5 大類即時換算，一秒從公里換英里、攝氏換華氏，不再需要 Google！';
const icon = '📐';

// 定義各類別的所有單位與換算基準
// 採用「轉為 SI 基準值」的標準化策略
// 溫度例外，用 toBase / fromBase 特殊函式

const CATEGORIES = {
  length: {
    name: '長度 (Length)',
    units: {
      'm':   { label: '公尺 (m)',       toBase: v => v,           fromBase: v => v },
      'km':  { label: '公里 (km)',      toBase: v => v * 1000,    fromBase: v => v / 1000 },
      'cm':  { label: '公分 (cm)',      toBase: v => v / 100,     fromBase: v => v * 100 },
      'mm':  { label: '公厘 (mm)',      toBase: v => v / 1000,    fromBase: v => v * 1000 },
      'mi':  { label: '英里 (mi)',      toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
      'yd':  { label: '碼 (yd)',        toBase: v => v * 0.9144,  fromBase: v => v / 0.9144 },
      'ft':  { label: '英尺 (ft)',      toBase: v => v * 0.3048,  fromBase: v => v / 0.3048 },
      'in':  { label: '英吋 (in)',      toBase: v => v * 0.0254,  fromBase: v => v / 0.0254 },
      'nm':  { label: '海里 (nmi)',     toBase: v => v * 1852,    fromBase: v => v / 1852 },
    }
  },
  weight: {
    name: '重量 (Weight)',
    units: {
      'kg':  { label: '公斤 (kg)',      toBase: v => v,            fromBase: v => v },
      'g':   { label: '公克 (g)',       toBase: v => v / 1000,     fromBase: v => v * 1000 },
      'mg':  { label: '毫克 (mg)',      toBase: v => v / 1e6,      fromBase: v => v * 1e6 },
      't':   { label: '公噸 (t)',       toBase: v => v * 1000,     fromBase: v => v / 1000 },
      'lb':  { label: '磅 (lb)',        toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
      'oz':  { label: '盎司 (oz)',      toBase: v => v * 0.028349, fromBase: v => v / 0.028349 },
      'jin': { label: '台斤 (600g)',    toBase: v => v * 0.6,      fromBase: v => v / 0.6 },
      'liang':{ label: '兩 (37.5g)',   toBase: v => v * 0.0375,   fromBase: v => v / 0.0375 },
    }
  },
  temperature: {
    name: '溫度 (Temperature)',
    units: {
      'C':  { label: '攝氏 (°C)', toBase: v => v,                      fromBase: v => v },
      'F':  { label: '華氏 (°F)', toBase: v => (v - 32) * 5 / 9,       fromBase: v => v * 9 / 5 + 32 },
      'K':  { label: '克氏 (K)',  toBase: v => v - 273.15,              fromBase: v => v + 273.15 },
    }
  },
  area: {
    name: '面積 (Area)',
    units: {
      'm2':    { label: '平方公尺 (m²)',   toBase: v => v,             fromBase: v => v },
      'km2':   { label: '平方公里 (km²)',  toBase: v => v * 1e6,       fromBase: v => v / 1e6 },
      'cm2':   { label: '平方公分 (cm²)',  toBase: v => v / 1e4,       fromBase: v => v * 1e4 },
      'ha':    { label: '公頃 (ha)',        toBase: v => v * 1e4,       fromBase: v => v / 1e4 },
      'ac':    { label: '英畝 (acre)',      toBase: v => v * 4046.86,   fromBase: v => v / 4046.86 },
      'ft2':   { label: '平方英尺 (ft²)',  toBase: v => v * 0.0929,    fromBase: v => v / 0.0929 },
      'ping':  { label: '坪 (台灣)',        toBase: v => v * 3.30579,   fromBase: v => v / 3.30579 },
    }
  },
  speed: {
    name: '速度 (Speed)',
    units: {
      'ms':   { label: '公尺/秒 (m/s)',    toBase: v => v,             fromBase: v => v },
      'kmh':  { label: '公里/小時 (km/h)', toBase: v => v / 3.6,       fromBase: v => v * 3.6 },
      'mph':  { label: '英里/小時 (mph)',   toBase: v => v * 0.44704,   fromBase: v => v / 0.44704 },
      'knot': { label: '節 (knot)',         toBase: v => v * 0.514444,  fromBase: v => v / 0.514444 },
      'mach': { label: '馬赫 (Mach)',       toBase: v => v * 343,       fromBase: v => v / 343 },
    }
  },
  data: {
    name: '數位容量 (Data)',
    units: {
      'B':  { label: '位元組 (B)', toBase: v => v,             fromBase: v => v },
      'KB': { label: 'KB',         toBase: v => v * 1024,      fromBase: v => v / 1024 },
      'MB': { label: 'MB',         toBase: v => v * 1048576,   fromBase: v => v / 1048576 },
      'GB': { label: 'GB',         toBase: v => v * 1073741824,fromBase: v => v / 1073741824 },
      'TB': { label: 'TB',         toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 }
    }
  }
};

export const convert = (category, fromUnit, toUnit, value) => {
  const cat = CATEGORIES[category];
  if (!cat) return null;
  const from = cat.units[fromUnit];
  const to   = cat.units[toUnit];
  if (!from || !to) return null;
  const baseVal = from.toBase(value);
  return to.fromBase(baseVal);
};

export const getCategories = () =>
  Object.entries(CATEGORIES).map(([key, cat]) => ({
    key,
    name: cat.name,
    units: Object.entries(cat.units).map(([k, u]) => ({ key: k, label: u.label }))
  }));

export default { title, desc, icon, convert, getCategories };
