const names = ['王小明', '陳美麗', '林大華', '張志豪', '李佳穎', '黃建國', '吳曉娟', '劉冠宇', '蔡依林', '周杰倫'];
const domains = ['gmail.com', 'yahoo.com.tw', 'icloud.com', 'dky.tw'];
const lorem = '日常生活中，我們常常需要面對各種挑戰。這段文字是隨機產生的假文，主要的用途是讓前端設計師或是排版人員在尚未取得真實資料時，能夠先有一段看起來充滿知性與份量的文字來填補畫面的空缺。不論是網頁開發還是 UI 設計，這一段看似有意義卻又毫無重點的字句，正是你現在最需要的排版好幫手！我們透過這段文字展現了中文字體的優美與間距的平衡。';
export const getFake = () => {
  const name = names[Math.floor(Math.random() * names.length)];
  const email = name.replace(' ', '') + Math.floor(Math.random() * 100) + '@' + domains[Math.floor(Math.random() * domains.length)];
  return { name, email, lorem };
};
