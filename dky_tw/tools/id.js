// 身分證字號產生與驗證工具 (Taiwan ROC ID) — 全功能版
// 僅供測試與開發使用，切勿用於非法註冊或冒用

const title = 'TW 身份證產生器';
const desc = '開發測試專用：自動計算校驗碼產生符合內政部數學邏輯的身分證字號，或驗證現有字號是否合法。請勿用於非法註冊！';
const icon = '🪪';

// --- 縣市代碼對照表 (含合併後新名) ---
const CITY_MAP = {
  A: { code: 10, name: '臺北市' },
  B: { code: 11, name: '臺中市' },
  C: { code: 12, name: '基隆市' },
  D: { code: 13, name: '臺南市' },
  E: { code: 14, name: '高雄市' },
  F: { code: 15, name: '新北市' },
  G: { code: 16, name: '宜蘭縣' },
  H: { code: 17, name: '桃園市' },
  I: { code: 34, name: '嘉義市' },
  J: { code: 18, name: '新竹縣' },
  K: { code: 19, name: '苗栗縣' },
  L: { code: 20, name: '臺中縣 (已併入臺中市)' },
  M: { code: 21, name: '南投縣' },
  N: { code: 22, name: '彰化縣' },
  O: { code: 35, name: '新竹市' },
  P: { code: 23, name: '雲林縣' },
  Q: { code: 24, name: '嘉義縣' },
  R: { code: 25, name: '臺南縣 (已併入臺南市)' },
  S: { code: 26, name: '高雄縣 (已併入高雄市)' },
  T: { code: 27, name: '屏東縣' },
  U: { code: 28, name: '花蓮縣' },
  V: { code: 29, name: '臺東縣' },
  W: { code: 32, name: '金門縣' },
  X: { code: 30, name: '澎湖縣' },
  Y: { code: 31, name: '陽明山管理局 (已併入臺北市)' },
  Z: { code: 33, name: '連江縣' }
};

const GENDER_MAP = {
  '1': '男性 (本國籍)',
  '2': '女性 (本國籍)',
  '8': '男性 (外國籍)',
  '9': '女性 (外國籍)'
};

// --- 取得所有城市清單 (供 UI 使用) ---
export const getCities = () => {
  return Object.entries(CITY_MAP).map(([letter, info]) => ({
    letter,
    name: info.name,
    label: `${letter} — ${info.name}`
  }));
};

// --- 取得性別選項清單 (供 UI 使用) ---
export const getGenders = () => {
  return Object.entries(GENDER_MAP).map(([code, label]) => ({
    code,
    label: `${code} — ${label}`
  }));
};

// --- 內部計算函數 ---
const calcCheckDigit = (letter, digits8) => {
  const cityCode = CITY_MAP[letter]?.code;
  if (cityCode === undefined) return null;

  const d0 = Math.floor(cityCode / 10);
  const d1 = cityCode % 10;

  let sum = d0 * 1 + d1 * 9;
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits8[i], 10) * weights[i];
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
};

// --- 產生身分證字號 ---
export const generate = (options = {}) => {
  const { city, gender, serial } = options;

  // 縣市
  let letter;
  if (city && CITY_MAP[city.toUpperCase()]) {
    letter = city.toUpperCase();
  } else {
    const keys = Object.keys(CITY_MAP);
    letter = keys[Math.floor(Math.random() * keys.length)];
  }

  // 性別
  let genderDigit;
  if (gender && ['1', '2', '8', '9'].includes(String(gender))) {
    genderDigit = String(gender);
  } else {
    genderDigit = Math.random() > 0.5 ? '1' : '2';
  }

  // 流水號 (7 碼)
  let serialDigits;
  if (serial && /^\d{7}$/.test(serial)) {
    serialDigits = serial;
  } else {
    serialDigits = '';
    for (let i = 0; i < 7; i++) {
      serialDigits += Math.floor(Math.random() * 10).toString();
    }
  }

  const digits8 = genderDigit + serialDigits;
  const check = calcCheckDigit(letter, digits8);
  return letter + digits8 + check;
};

// --- 驗證身分證字號 (含詳細分析) ---
export const validate = (id) => {
  const cleanId = (id || '').toUpperCase().trim();

  const result = {
    valid: false,
    input: cleanId,
    letter: '',
    cityName: '',
    genderCode: '',
    genderName: '',
    serial: '',
    checkDigit: '',
    expectedCheckDigit: '',
    errors: [],
    msg: ''
  };

  // 長度檢核
  if (cleanId.length !== 10) {
    result.errors.push('長度不正確：必須為 10 碼');
    result.msg = '長度不正確：必須為 10 碼';
    return result;
  }

  // 首字母檢核
  result.letter = cleanId[0];
  const cityInfo = CITY_MAP[result.letter];
  if (!cityInfo) {
    result.errors.push(`首字母「${result.letter}」不是有效的縣市代碼`);
    result.msg = `首字母「${result.letter}」不是有效的縣市代碼`;
    return result;
  }
  result.cityName = cityInfo.name;

  // 性別檢核
  result.genderCode = cleanId[1];
  if (!['1', '2', '8', '9'].includes(result.genderCode)) {
    result.errors.push(`第二碼「${result.genderCode}」不是有效的性別碼 (應為 1/2/8/9)`);
    result.msg = `第二碼「${result.genderCode}」不是有效的性別碼`;
    return result;
  }
  result.genderName = GENDER_MAP[result.genderCode];

  // 流水號檢核
  result.serial = cleanId.substring(2, 9);
  if (!/^\d{7}$/.test(result.serial)) {
    result.errors.push(`流水號「${result.serial}」含有非數字字元`);
    result.msg = '流水號含有非數字字元';
    return result;
  }

  // 檢查碼檢核
  result.checkDigit = cleanId[9];
  if (!/^\d$/.test(result.checkDigit)) {
    result.errors.push(`檢查碼「${result.checkDigit}」不是數字`);
    result.msg = '檢查碼不是數字';
    return result;
  }

  const digits8 = cleanId.substring(1, 9);
  const expected = calcCheckDigit(result.letter, digits8);
  result.expectedCheckDigit = String(expected);

  if (String(expected) !== result.checkDigit) {
    result.errors.push(`檢查碼不正確：尾數應為 ${expected}，但實際為 ${result.checkDigit}`);
    result.msg = `檢查碼不正確：尾數應為 ${expected}`;
    return result;
  }

  // 全部通過
  result.valid = true;
  result.msg = '驗證成功！符合數學邏輯';
  return result;
};

// --- 批量產生 ---
export const generateBatch = (count = 5, options = {}) => {
  const results = [];
  const n = Math.min(Math.max(1, count), 100);
  for (let i = 0; i < n; i++) {
    results.push(generate(options));
  }
  return results;
};

export default { title, desc, icon, generate, validate, generateBatch, getCities, getGenders };
