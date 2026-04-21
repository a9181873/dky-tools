// 身分證字號產生與驗證工具 (Taiwan ROC ID)
// 僅供測試與開發使用

const title = 'TW 身份證產生器';
const desc = '開發測試專用：自動計算校驗碼產生符合內政部數學邏輯的身分證字號，或驗證現有字號是否合法。請勿用於非法註冊！';
const icon = '🪪';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';

const LETTER_MAPPING = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, J: 18, K: 19, L: 20, M: 21,
  N: 22, P: 23, Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, X: 30, Y: 31, W: 32, Z: 33, I: 34, O: 35
};

const getChecksum = (id) => {
  const firstLetter = id[0];
  const numPair = LETTER_MAPPING[firstLetter].toString();
  const d0 = parseInt(numPair[0], 10);
  const d1 = parseInt(numPair[1], 10);
  
  let sum = d0 * 1 + d1 * 9;
  
  const weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(id[i], 10) * weights[i - 1];
  }
  return sum % 10 === 0;
};

export const generate = (gender = null) => {
  const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  let genDigit = gender;
  if (!genDigit) {
     genDigit = Math.random() > 0.5 ? '1' : '2';
  }
  
  let idBase = letter + genDigit;
  for (let i = 0; i < 7; i++) {
    idBase += Math.floor(Math.random() * 10).toString();
  }
  
  const numPair = LETTER_MAPPING[letter].toString();
  let tempSum = parseInt(numPair[0], 10) * 1 + parseInt(numPair[1], 10) * 9;
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  
  tempSum += parseInt(idBase[1], 10) * weights[0];
  for(let i = 2; i <= 8; i++){
      tempSum += parseInt(idBase[i], 10) * weights[i-1];
  }
  
  const remainder = tempSum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;
  
  return idBase + checkDigit;
};

export const validate = (id) => {
  const cleanId = (id || '').toUpperCase().trim();
  if (cleanId.length !== 10) return { valid: false, msg: '長度必須為10碼' };
  const re = /^[A-Z][1289]\d{8}$/;
  if (!re.test(cleanId)) return { valid: false, msg: '格式錯誤，首字應為大寫字母，第二碼為1, 2, 8, 或 9' };
  const isValid = getChecksum(cleanId);
  return { valid: isValid, msg: isValid ? '驗證成功！符合數學邏輯' : '驗證失敗！檢查碼錯誤 (尾數不符)' };
};

export default { title, desc, icon, generate, validate };
