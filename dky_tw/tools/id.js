// 台灣身分證字號驗證與產生
const CITY_MAP = {
  A:10, B:11, C:12, D:13, E:14, F:15, G:16, H:17, I:34, J:18, K:19, L:20,
  M:21, N:22, O:35, P:23, Q:24, R:25, S:26, T:27, U:28, V:29, W:32, X:30, Y:31, Z:33
};

const CITY_NAMES = {
  A:'台北市', B:'台中市', C:'基隆市', D:'台南市', E:'高雄市', F:'新北市',
  G:'宜蘭縣', H:'桃園市', I:'嘉義市', J:'新竹縣', K:'苗栗縣', L:'台中縣',
  M:'南投縣', N:'彰化縣', O:'新竹市', P:'雲林縣', Q:'嘉義縣', R:'台南縣',
  S:'高雄縣', T:'屏東縣', U:'花蓮縣', V:'台東縣', W:'金門縣', X:'澎湖縣',
  Y:'陽明山', Z:'連江縣'
};

export function validate(id) {
  const clean = id.trim().toUpperCase();
  if (!/^[A-Z][12]\d{8}$/.test(clean)) return { valid: false, reason: '格式不符：應為 1 英文字 + 1(男)/2(女) + 8 位數字' };

  const letter = clean[0];
  const cityCode = CITY_MAP[letter];
  if (cityCode === undefined) return { valid: false, reason: '無效的縣市代碼' };

  const n1 = Math.floor(cityCode / 10);
  const n2 = cityCode % 10;
  const digits = (n1.toString() + n2.toString() + clean.substring(1)).split('').map(Number);

  const weights = [1,9,8,7,6,5,4,3,2,1,1];
  let sum = 0;
  for (let i = 0; i < 11; i++) sum += digits[i] * weights[i];

  const valid = sum % 10 === 0;
  return {
    valid,
    reason: valid ? '合法身分證字號' : '檢查碼不符',
    city: CITY_NAMES[letter] || '未知',
    gender: clean[1] === '1' ? '男' : '女'
  };
}

export function generate(cityCode, gender) {
  const letter = cityCode || Object.keys(CITY_MAP)[Math.floor(Math.random() * 26)];
  const g = gender || (Math.random() > 0.5 ? '1' : '2');
  const cityVal = CITY_MAP[letter];
  const n1 = Math.floor(cityVal / 10);
  const n2 = cityVal % 10;

  let id;
  do {
    const rand = Array.from({length:7}, () => Math.floor(Math.random() * 10)).join('');
    const prefix = n1.toString() + n2.toString() + g + rand;
    const digits = prefix.split('').map(Number);
    const weights = [1,9,8,7,6,5,4,3,2,1];
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += digits[i] * weights[i];
    const check = (10 - (sum % 10)) % 10;
    id = letter + g + rand + check;
  } while (!validate(id).valid);

  return id;
}
