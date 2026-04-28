// 單位換算模組
export const CATEGORIES = {
  length: {
    name: '長度',
    units: {
      km: { name: '公里 (km)', factor: 1000 },
      m: { name: '公尺 (m)', factor: 1 },
      cm: { name: '公分 (cm)', factor: 0.01 },
      mm: { name: '毫米 (mm)', factor: 0.001 },
      mi: { name: '英里 (mi)', factor: 1609.344 },
      ft: { name: '英尺 (ft)', factor: 0.3048 },
      inch: { name: '英寸 (in)', factor: 0.0254 },
      yd: { name: '碼 (yd)', factor: 0.9144 }
    }
  },
  weight: {
    name: '重量',
    units: {
      kg: { name: '公斤 (kg)', factor: 1 },
      g: { name: '公克 (g)', factor: 0.001 },
      mg: { name: '毫克 (mg)', factor: 0.000001 },
      t: { name: '公噸 (t)', factor: 1000 },
      lb: { name: '磅 (lb)', factor: 0.453592 },
      oz: { name: '盎司 (oz)', factor: 0.0283495 },
      tael: { name: '台兩', factor: 0.0375 },
      catty: { name: '台斤', factor: 0.6 }
    }
  },
  temp: {
    name: '溫度',
    units: {
      c: { name: '攝氏 (°C)' },
      f: { name: '華氏 (°F)' },
      k: { name: '絕對溫度 (K)' }
    }
  },
  area: {
    name: '面積',
    units: {
      sqm: { name: '平方公尺 (m²)', factor: 1 },
      sqkm: { name: '平方公里 (km²)', factor: 1000000 },
      ha: { name: '公頃 (ha)', factor: 10000 },
      ping: { name: '坪', factor: 3.3058 },
      acre: { name: '英畝 (acre)', factor: 4046.86 },
      sqft: { name: '平方英尺 (ft²)', factor: 0.092903 }
    }
  },
  volume: {
    name: '體積/容量',
    units: {
      l: { name: '公升 (L)', factor: 1 },
      ml: { name: '毫升 (mL)', factor: 0.001 },
      gal: { name: '美加侖 (gal)', factor: 3.78541 },
      qt: { name: '夸脫 (qt)', factor: 0.946353 },
      cup: { name: '杯 (cup)', factor: 0.236588 }
    }
  },
  speed: {
    name: '速度',
    units: {
      kmh: { name: '公里/時 (km/h)', factor: 1 },
      ms: { name: '公尺/秒 (m/s)', factor: 3.6 },
      mph: { name: '英里/時 (mph)', factor: 1.60934 },
      knot: { name: '節 (kn)', factor: 1.852 }
    }
  },
  data: {
    name: '數位容量',
    units: {
      b: { name: '位元組 (B)', factor: 1 },
      kb: { name: 'KB', factor: 1024 },
      mb: { name: 'MB', factor: 1048576 },
      gb: { name: 'GB', factor: 1073741824 },
      tb: { name: 'TB', factor: 1099511627776 },
      pb: { name: 'PB', factor: 1125899906842624 }
    }
  }
};

export function convertTemp(value, from, to) {
  let c;
  if (from === 'c') c = value;
  else if (from === 'f') c = (value - 32) * 5 / 9;
  else if (from === 'k') c = value - 273.15;
  else return 0;

  if (to === 'c') return c;
  if (to === 'f') return c * 9 / 5 + 32;
  if (to === 'k') return c + 273.15;
  return 0;
}

export function convert(value, fromKey, toKey, category) {
  if (category === 'temp') return convertTemp(value, fromKey, toKey);
  const units = CATEGORIES[category].units;
  const si = value * units[fromKey].factor;
  return si / units[toKey].factor;
}
