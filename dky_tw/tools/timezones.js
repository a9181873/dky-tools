const REGION_LABELS = {
  Africa: '非洲 (Africa)',
  America: '美洲 (America)',
  Antarctica: '南極洲 (Antarctica)',
  Arctic: '北極 (Arctic)',
  Asia: '亞洲 (Asia)',
  Atlantic: '大西洋 (Atlantic)',
  Australia: '大洋洲 (Australia)',
  Europe: '歐洲 (Europe)',
  Indian: '印度洋 (Indian)',
  Pacific: '太平洋 (Pacific)',
  Etc: 'UTC / 其他'
};

const COUNTRY_ZONE_GROUPS = [
  { region: '亞洲 (Asia)', country: '台灣 (Taiwan)', zones: [{ tz: 'Asia/Taipei', cities: ['台北 (Taipei)', '新北 (New Taipei)', '桃園 (Taoyuan)', '台中 (Taichung)', '台南 (Tainan)', '高雄 (Kaohsiung)', '新竹 (Hsinchu)', '嘉義 (Chiayi)', '花蓮 (Hualien)'] }] },
  { region: '亞洲 (Asia)', country: '中國 (China)', zones: [{ tz: 'Asia/Shanghai', cities: ['北京 (Beijing)', '上海 (Shanghai)', '廣州 (Guangzhou)', '深圳 (Shenzhen)', '杭州 (Hangzhou)', '南京 (Nanjing)', '成都 (Chengdu)', '武漢 (Wuhan)', '西安 (Xian)', '天津 (Tianjin)', '蘇州 (Suzhou)', '青島 (Qingdao)', '廈門 (Xiamen)', '寧波 (Ningbo)'] }, { tz: 'Asia/Urumqi', cities: ['烏魯木齊 (Urumqi)', '喀什 (Kashgar)'] }] },
  { region: '亞洲 (Asia)', country: '香港 (Hong Kong)', zones: [{ tz: 'Asia/Hong_Kong', cities: ['香港 (Hong Kong)', '九龍 (Kowloon)'] }] },
  { region: '亞洲 (Asia)', country: '澳門 (Macau)', zones: [{ tz: 'Asia/Macau', cities: ['澳門 (Macau)'] }] },
  { region: '亞洲 (Asia)', country: '日本 (Japan)', zones: [{ tz: 'Asia/Tokyo', cities: ['東京 (Tokyo)', '大阪 (Osaka)', '京都 (Kyoto)', '橫濱 (Yokohama)', '名古屋 (Nagoya)', '福岡 (Fukuoka)', '札幌 (Sapporo)', '神戶 (Kobe)', '廣島 (Hiroshima)', '仙台 (Sendai)', '沖繩那霸 (Naha)'] }] },
  { region: '亞洲 (Asia)', country: '韓國 (South Korea)', zones: [{ tz: 'Asia/Seoul', cities: ['首爾 (Seoul)', '釜山 (Busan)', '仁川 (Incheon)', '大邱 (Daegu)', '大田 (Daejeon)', '光州 (Gwangju)', '濟州 (Jeju)'] }] },
  { region: '亞洲 (Asia)', country: '新加坡 (Singapore)', zones: [{ tz: 'Asia/Singapore', cities: ['新加坡 (Singapore)'] }] },
  { region: '亞洲 (Asia)', country: '馬來西亞 (Malaysia)', zones: [{ tz: 'Asia/Kuala_Lumpur', cities: ['吉隆坡 (Kuala Lumpur)', '檳城 (Penang)', '柔佛新山 (Johor Bahru)', '怡保 (Ipoh)', '馬六甲 (Malacca)'] }, { tz: 'Asia/Kuching', cities: ['古晉 (Kuching)', '亞庇 (Kota Kinabalu)', '美里 (Miri)'] }] },
  { region: '亞洲 (Asia)', country: '泰國 (Thailand)', zones: [{ tz: 'Asia/Bangkok', cities: ['曼谷 (Bangkok)', '清邁 (Chiang Mai)', '普吉 (Phuket)', '芭達雅 (Pattaya)', '孔敬 (Khon Kaen)'] }] },
  { region: '亞洲 (Asia)', country: '越南 (Vietnam)', zones: [{ tz: 'Asia/Ho_Chi_Minh', cities: ['胡志明市 (Ho Chi Minh City)', '河內 (Hanoi)', '峴港 (Da Nang)', '海防 (Hai Phong)', '芽莊 (Nha Trang)'] }] },
  { region: '亞洲 (Asia)', country: '菲律賓 (Philippines)', zones: [{ tz: 'Asia/Manila', cities: ['馬尼拉 (Manila)', '宿霧 (Cebu)', '達沃 (Davao)', '奎松市 (Quezon City)', '碧瑤 (Baguio)'] }] },
  { region: '亞洲 (Asia)', country: '印尼 (Indonesia)', zones: [{ tz: 'Asia/Jakarta', cities: ['雅加達 (Jakarta)', '萬隆 (Bandung)', '泗水 (Surabaya)', '棉蘭 (Medan)', '日惹 (Yogyakarta)'] }, { tz: 'Asia/Makassar', cities: ['望加錫 (Makassar)', '峇里島登巴薩 (Denpasar)', '馬納多 (Manado)'] }, { tz: 'Asia/Jayapura', cities: ['查亞普拉 (Jayapura)'] }] },
  { region: '亞洲 (Asia)', country: '印度 (India)', zones: [{ tz: 'Asia/Kolkata', cities: ['新德里 (New Delhi)', '孟買 (Mumbai)', '班加羅爾 (Bengaluru)', '清奈 (Chennai)', '海德拉巴 (Hyderabad)', '加爾各答 (Kolkata)', '浦那 (Pune)', '艾哈邁達巴德 (Ahmedabad)', '齋浦爾 (Jaipur)'] }] },
  { region: '亞洲 (Asia)', country: '阿聯酋 (United Arab Emirates)', zones: [{ tz: 'Asia/Dubai', cities: ['杜拜 (Dubai)', '阿布達比 (Abu Dhabi)', '沙迦 (Sharjah)'] }] },
  { region: '亞洲 (Asia)', country: '沙烏地阿拉伯 (Saudi Arabia)', zones: [{ tz: 'Asia/Riyadh', cities: ['利雅德 (Riyadh)', '吉達 (Jeddah)', '麥加 (Mecca)', '麥地那 (Medina)', '達曼 (Dammam)'] }] },
  { region: '亞洲 (Asia)', country: '土耳其 (Turkey)', zones: [{ tz: 'Europe/Istanbul', cities: ['伊斯坦堡 (Istanbul)', '安卡拉 (Ankara)', '伊茲密爾 (Izmir)', '安塔利亞 (Antalya)'] }] },
  { region: '亞洲 (Asia)', country: '以色列 (Israel)', zones: [{ tz: 'Asia/Jerusalem', cities: ['耶路撒冷 (Jerusalem)', '特拉維夫 (Tel Aviv)', '海法 (Haifa)'] }] },
  { region: '亞洲 (Asia)', country: '巴基斯坦 (Pakistan)', zones: [{ tz: 'Asia/Karachi', cities: ['喀拉蚩 (Karachi)', '拉合爾 (Lahore)', '伊斯蘭馬巴德 (Islamabad)'] }] },
  { region: '亞洲 (Asia)', country: '孟加拉 (Bangladesh)', zones: [{ tz: 'Asia/Dhaka', cities: ['達卡 (Dhaka)', '吉大港 (Chittagong)'] }] },
  { region: '亞洲 (Asia)', country: '斯里蘭卡 (Sri Lanka)', zones: [{ tz: 'Asia/Colombo', cities: ['可倫坡 (Colombo)', '康提 (Kandy)'] }] },
  { region: '亞洲 (Asia)', country: '伊朗 (Iran)', zones: [{ tz: 'Asia/Tehran', cities: ['德黑蘭 (Tehran)', '馬什哈德 (Mashhad)', '伊斯法罕 (Isfahan)'] }] },
  { region: '歐洲 (Europe)', country: '英國 (United Kingdom)', zones: [{ tz: 'Europe/London', cities: ['倫敦 (London)', '曼徹斯特 (Manchester)', '伯明罕 (Birmingham)', '利物浦 (Liverpool)', '愛丁堡 (Edinburgh)', '格拉斯哥 (Glasgow)', '布里斯托 (Bristol)', '里茲 (Leeds)'] }] },
  { region: '歐洲 (Europe)', country: '愛爾蘭 (Ireland)', zones: [{ tz: 'Europe/Dublin', cities: ['都柏林 (Dublin)', '科克 (Cork)', '高威 (Galway)'] }] },
  { region: '歐洲 (Europe)', country: '法國 (France)', zones: [{ tz: 'Europe/Paris', cities: ['巴黎 (Paris)', '里昂 (Lyon)', '馬賽 (Marseille)', '土魯斯 (Toulouse)', '尼斯 (Nice)', '波爾多 (Bordeaux)', '史特拉斯堡 (Strasbourg)'] }] },
  { region: '歐洲 (Europe)', country: '德國 (Germany)', zones: [{ tz: 'Europe/Berlin', cities: ['柏林 (Berlin)', '法蘭克福 (Frankfurt)', '慕尼黑 (Munich)', '漢堡 (Hamburg)', '科隆 (Cologne)', '杜塞道夫 (Dusseldorf)', '斯圖加特 (Stuttgart)', '萊比錫 (Leipzig)'] }] },
  { region: '歐洲 (Europe)', country: '義大利 (Italy)', zones: [{ tz: 'Europe/Rome', cities: ['羅馬 (Rome)', '米蘭 (Milan)', '威尼斯 (Venice)', '佛羅倫斯 (Florence)', '都靈 (Turin)', '拿坡里 (Naples)', '波隆那 (Bologna)'] }] },
  { region: '歐洲 (Europe)', country: '西班牙 (Spain)', zones: [{ tz: 'Europe/Madrid', cities: ['馬德里 (Madrid)', '巴塞隆納 (Barcelona)', '瓦倫西亞 (Valencia)', '塞維亞 (Seville)', '畢爾包 (Bilbao)'] }, { tz: 'Atlantic/Canary', cities: ['拉斯帕爾馬斯 (Las Palmas)', '聖克魯斯-德特內里費 (Santa Cruz de Tenerife)'] }] },
  { region: '歐洲 (Europe)', country: '葡萄牙 (Portugal)', zones: [{ tz: 'Europe/Lisbon', cities: ['里斯本 (Lisbon)', '波多 (Porto)', '科英布拉 (Coimbra)'] }, { tz: 'Atlantic/Azores', cities: ['亞速爾 (Azores)'] }, { tz: 'Atlantic/Madeira', cities: ['馬德拉 (Madeira)'] }] },
  { region: '歐洲 (Europe)', country: '荷蘭 (Netherlands)', zones: [{ tz: 'Europe/Amsterdam', cities: ['阿姆斯特丹 (Amsterdam)', '鹿特丹 (Rotterdam)', '海牙 (The Hague)', '烏特勒支 (Utrecht)', '恩荷芬 (Eindhoven)'] }] },
  { region: '歐洲 (Europe)', country: '比利時 (Belgium)', zones: [{ tz: 'Europe/Brussels', cities: ['布魯塞爾 (Brussels)', '安特衛普 (Antwerp)', '根特 (Ghent)'] }] },
  { region: '歐洲 (Europe)', country: '瑞士 (Switzerland)', zones: [{ tz: 'Europe/Zurich', cities: ['蘇黎世 (Zurich)', '日內瓦 (Geneva)', '巴塞爾 (Basel)', '洛桑 (Lausanne)', '伯恩 (Bern)'] }] },
  { region: '歐洲 (Europe)', country: '奧地利 (Austria)', zones: [{ tz: 'Europe/Vienna', cities: ['維也納 (Vienna)', '薩爾斯堡 (Salzburg)', '格拉茲 (Graz)'] }] },
  { region: '歐洲 (Europe)', country: '瑞典 (Sweden)', zones: [{ tz: 'Europe/Stockholm', cities: ['斯德哥爾摩 (Stockholm)', '哥德堡 (Gothenburg)', '馬爾默 (Malmo)'] }] },
  { region: '歐洲 (Europe)', country: '挪威 (Norway)', zones: [{ tz: 'Europe/Oslo', cities: ['奧斯陸 (Oslo)', '卑爾根 (Bergen)', '特隆赫姆 (Trondheim)'] }] },
  { region: '歐洲 (Europe)', country: '丹麥 (Denmark)', zones: [{ tz: 'Europe/Copenhagen', cities: ['哥本哈根 (Copenhagen)', '奧胡斯 (Aarhus)', '歐登塞 (Odense)'] }] },
  { region: '歐洲 (Europe)', country: '芬蘭 (Finland)', zones: [{ tz: 'Europe/Helsinki', cities: ['赫爾辛基 (Helsinki)', '坦佩雷 (Tampere)', '圖爾庫 (Turku)'] }] },
  { region: '歐洲 (Europe)', country: '波蘭 (Poland)', zones: [{ tz: 'Europe/Warsaw', cities: ['華沙 (Warsaw)', '克拉科夫 (Krakow)', '格但斯克 (Gdansk)', '弗羅茨瓦夫 (Wroclaw)'] }] },
  { region: '歐洲 (Europe)', country: '捷克 (Czechia)', zones: [{ tz: 'Europe/Prague', cities: ['布拉格 (Prague)', '布爾諾 (Brno)'] }] },
  { region: '歐洲 (Europe)', country: '希臘 (Greece)', zones: [{ tz: 'Europe/Athens', cities: ['雅典 (Athens)', '塞薩洛尼基 (Thessaloniki)'] }] },
  { region: '歐洲 (Europe)', country: '俄羅斯 (Russia)', zones: [{ tz: 'Europe/Moscow', cities: ['莫斯科 (Moscow)', '聖彼得堡 (Saint Petersburg)', '下諾夫哥羅德 (Nizhny Novgorod)'] }, { tz: 'Asia/Yekaterinburg', cities: ['葉卡捷琳堡 (Yekaterinburg)'] }, { tz: 'Asia/Novosibirsk', cities: ['新西伯利亞 (Novosibirsk)'] }, { tz: 'Asia/Vladivostok', cities: ['海參崴 (Vladivostok)'] }] },
  { region: '美洲 (America)', country: '美國 (United States)', zones: [{ tz: 'America/New_York', cities: ['紐約 (New York)', '華盛頓 DC (Washington DC)', '波士頓 (Boston)', '費城 (Philadelphia)', '亞特蘭大 (Atlanta)', '邁阿密 (Miami)', '奧蘭多 (Orlando)', '底特律 (Detroit)', '夏洛特 (Charlotte)'] }, { tz: 'America/Chicago', cities: ['芝加哥 (Chicago)', '休士頓 (Houston)', '達拉斯 (Dallas)', '奧斯汀 (Austin)', '紐奧良 (New Orleans)', '納許維爾 (Nashville)', '明尼亞波利斯 (Minneapolis)', '聖路易 (St. Louis)'] }, { tz: 'America/Denver', cities: ['丹佛 (Denver)', '鹽湖城 (Salt Lake City)', '阿布奎基 (Albuquerque)', '波伊西 (Boise)'] }, { tz: 'America/Phoenix', cities: ['鳳凰城 (Phoenix)', '土桑 (Tucson)'] }, { tz: 'America/Los_Angeles', cities: ['洛杉磯 (Los Angeles)', '舊金山 (San Francisco)', '西雅圖 (Seattle)', '拉斯維加斯 (Las Vegas)', '聖地牙哥 (San Diego)', '聖荷西 (San Jose)', '波特蘭 (Portland)', '沙加緬度 (Sacramento)'] }, { tz: 'America/Anchorage', cities: ['安克拉治 (Anchorage)'] }, { tz: 'Pacific/Honolulu', cities: ['檀香山 (Honolulu)'] }] },
  { region: '美洲 (America)', country: '加拿大 (Canada)', zones: [{ tz: 'America/Toronto', cities: ['多倫多 (Toronto)', '渥太華 (Ottawa)', '蒙特婁 (Montreal)', '魁北克市 (Quebec City)'] }, { tz: 'America/Winnipeg', cities: ['溫尼伯 (Winnipeg)'] }, { tz: 'America/Edmonton', cities: ['艾德蒙頓 (Edmonton)', '卡加利 (Calgary)'] }, { tz: 'America/Vancouver', cities: ['溫哥華 (Vancouver)', '維多利亞 (Victoria)'] }, { tz: 'America/Halifax', cities: ['哈利法克斯 (Halifax)'] }, { tz: 'America/St_Johns', cities: ['聖約翰斯 (St. Johns)'] }] },
  { region: '美洲 (America)', country: '墨西哥 (Mexico)', zones: [{ tz: 'America/Mexico_City', cities: ['墨西哥城 (Mexico City)', '瓜達拉哈拉 (Guadalajara)', '普埃布拉 (Puebla)'] }, { tz: 'America/Monterrey', cities: ['蒙特雷 (Monterrey)'] }, { tz: 'America/Tijuana', cities: ['蒂華納 (Tijuana)'] }, { tz: 'America/Cancun', cities: ['坎昆 (Cancun)'] }] },
  { region: '美洲 (America)', country: '巴西 (Brazil)', zones: [{ tz: 'America/Sao_Paulo', cities: ['聖保羅 (Sao Paulo)', '里約熱內盧 (Rio de Janeiro)', '巴西利亞 (Brasilia)', '庫里奇巴 (Curitiba)', '阿雷格里港 (Porto Alegre)'] }, { tz: 'America/Manaus', cities: ['馬瑙斯 (Manaus)'] }, { tz: 'America/Recife', cities: ['累西腓 (Recife)', '薩爾瓦多 (Salvador)', '福塔雷薩 (Fortaleza)'] }] },
  { region: '美洲 (America)', country: '阿根廷 (Argentina)', zones: [{ tz: 'America/Argentina/Buenos_Aires', cities: ['布宜諾斯艾利斯 (Buenos Aires)', '羅薩里奧 (Rosario)', '拉普拉塔 (La Plata)'] }, { tz: 'America/Argentina/Cordoba', cities: ['科爾多瓦 (Cordoba)'] }, { tz: 'America/Argentina/Mendoza', cities: ['門多薩 (Mendoza)'] }] },
  { region: '美洲 (America)', country: '智利 (Chile)', zones: [{ tz: 'America/Santiago', cities: ['聖地牙哥 (Santiago)', '瓦爾帕萊索 (Valparaiso)'] }, { tz: 'Pacific/Easter', cities: ['復活節島 (Easter Island)'] }] },
  { region: '美洲 (America)', country: '哥倫比亞 (Colombia)', zones: [{ tz: 'America/Bogota', cities: ['波哥大 (Bogota)', '麥德林 (Medellin)', '卡利 (Cali)'] }] },
  { region: '美洲 (America)', country: '秘魯 (Peru)', zones: [{ tz: 'America/Lima', cities: ['利馬 (Lima)', '庫斯科 (Cusco)', '阿雷基帕 (Arequipa)'] }] },
  { region: '美洲 (America)', country: '委內瑞拉 (Venezuela)', zones: [{ tz: 'America/Caracas', cities: ['卡拉卡斯 (Caracas)', '馬拉開波 (Maracaibo)'] }] },
  { region: '美洲 (America)', country: '古巴 (Cuba)', zones: [{ tz: 'America/Havana', cities: ['哈瓦那 (Havana)'] }] },
  { region: '美洲 (America)', country: '巴拿馬 (Panama)', zones: [{ tz: 'America/Panama', cities: ['巴拿馬市 (Panama City)'] }] },
  { region: '美洲 (America)', country: '牙買加 (Jamaica)', zones: [{ tz: 'America/Jamaica', cities: ['金斯敦 (Kingston)'] }] },
  { region: '大洋洲 (Australia / Pacific)', country: '澳洲 (Australia)', zones: [{ tz: 'Australia/Sydney', cities: ['雪梨 (Sydney)', '坎培拉 (Canberra)', '紐卡斯爾 (Newcastle)'] }, { tz: 'Australia/Melbourne', cities: ['墨爾本 (Melbourne)', '吉朗 (Geelong)'] }, { tz: 'Australia/Brisbane', cities: ['布里斯本 (Brisbane)', '黃金海岸 (Gold Coast)', '凱恩斯 (Cairns)'] }, { tz: 'Australia/Adelaide', cities: ['阿德雷德 (Adelaide)'] }, { tz: 'Australia/Perth', cities: ['伯斯 (Perth)', '費利曼圖 (Fremantle)'] }, { tz: 'Australia/Darwin', cities: ['達爾文 (Darwin)'] }, { tz: 'Australia/Hobart', cities: ['荷巴特 (Hobart)'] }] },
  { region: '大洋洲 (Australia / Pacific)', country: '紐西蘭 (New Zealand)', zones: [{ tz: 'Pacific/Auckland', cities: ['奧克蘭 (Auckland)', '威靈頓 (Wellington)', '基督城 (Christchurch)', '皇后鎮 (Queenstown)'] }, { tz: 'Pacific/Chatham', cities: ['查塔姆群島 (Chatham Islands)'] }] },
  { region: '大洋洲 (Australia / Pacific)', country: '斐濟 (Fiji)', zones: [{ tz: 'Pacific/Fiji', cities: ['蘇瓦 (Suva)', '楠迪 (Nadi)'] }] },
  { region: '大洋洲 (Australia / Pacific)', country: '關島 (Guam)', zones: [{ tz: 'Pacific/Guam', cities: ['關島 (Guam)'] }] },
  { region: '非洲 (Africa)', country: '埃及 (Egypt)', zones: [{ tz: 'Africa/Cairo', cities: ['開羅 (Cairo)', '亞歷山卓 (Alexandria)', '吉薩 (Giza)'] }] },
  { region: '非洲 (Africa)', country: '南非 (South Africa)', zones: [{ tz: 'Africa/Johannesburg', cities: ['約翰尼斯堡 (Johannesburg)', '開普敦 (Cape Town)', '德班 (Durban)', '普勒托利亞 (Pretoria)'] }] },
  { region: '非洲 (Africa)', country: '肯亞 (Kenya)', zones: [{ tz: 'Africa/Nairobi', cities: ['奈洛比 (Nairobi)', '蒙巴薩 (Mombasa)'] }] },
  { region: '非洲 (Africa)', country: '奈及利亞 (Nigeria)', zones: [{ tz: 'Africa/Lagos', cities: ['拉哥斯 (Lagos)', '阿布加 (Abuja)', '卡諾 (Kano)'] }] },
  { region: '非洲 (Africa)', country: '摩洛哥 (Morocco)', zones: [{ tz: 'Africa/Casablanca', cities: ['卡薩布蘭卡 (Casablanca)', '拉巴特 (Rabat)', '馬拉喀什 (Marrakesh)'] }] },
  { region: '非洲 (Africa)', country: '迦納 (Ghana)', zones: [{ tz: 'Africa/Accra', cities: ['阿克拉 (Accra)', '庫馬西 (Kumasi)'] }] }
];

const COUNTRY_HINTS = [
  ['America/Argentina/', '阿根廷 (Argentina)'],
  ['America/Indiana/', '美國 (United States)'],
  ['America/Kentucky/', '美國 (United States)'],
  ['America/North_Dakota/', '美國 (United States)'],
  ['America/', '美洲其他國家 (Other Americas)'],
  ['Asia/', '亞洲其他國家 (Other Asia)'],
  ['Europe/', '歐洲其他國家 (Other Europe)'],
  ['Africa/', '非洲其他國家 (Other Africa)'],
  ['Australia/', '澳洲 (Australia)'],
  ['Pacific/', '太平洋島國 (Pacific Islands)'],
  ['Atlantic/', '大西洋島嶼 (Atlantic Islands)'],
  ['Indian/', '印度洋島嶼 (Indian Ocean)'],
  ['Antarctica/', '南極洲 (Antarctica)'],
  ['Arctic/', '北極 (Arctic)']
];

function cityFromTimeZone(tz) {
  const parts = tz.split('/');
  return (parts[parts.length - 1] || tz).replace(/_/g, ' ');
}

function regionFromTimeZone(tz) {
  const region = tz.split('/')[0] || 'Etc';
  return REGION_LABELS[region] || `${region}`;
}

function countryFromTimeZone(tz) {
  const hint = COUNTRY_HINTS.find(([prefix]) => tz.startsWith(prefix));
  return hint ? hint[1] : '其他 (Other)';
}

function baseRows() {
  return COUNTRY_ZONE_GROUPS.flatMap(group =>
    group.zones.flatMap(zone =>
      zone.cities.map(city => ({
        region: group.region,
        country: group.country,
        city,
        tz: zone.tz
      }))
    )
  );
}

function browserRows() {
  if (typeof Intl === 'undefined' || typeof Intl.supportedValuesOf !== 'function') return [];
  try {
    return Intl.supportedValuesOf('timeZone')
      .filter(tz => !tz.startsWith('Etc/'))
      .map(tz => ({
        region: regionFromTimeZone(tz),
        country: countryFromTimeZone(tz),
        city: cityFromTimeZone(tz),
        tz
      }));
  } catch {
    return [];
  }
}

export function getTimeZoneOptions() {
  const seen = new Set();
  return [...baseRows(), ...browserRows()]
    .filter(item => {
      const key = `${item.region}|${item.country}|${item.city}|${item.tz}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => `${a.region}${a.country}${a.city}`.localeCompare(`${b.region}${b.country}${b.city}`, 'zh-Hant'));
}
