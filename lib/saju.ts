import { Solar, Lunar } from 'lunar-javascript';

// 🔥 일반인도 직관적으로 이해할 수 있는 자연물 및 상징 뜻풀이
export const SAJU_MEANING: Record<string, { sound: string, color: string, desc: string, icon: string }> = {
  // 천간 (하늘의 기운)
  '甲': { sound: '갑', color: '#22c55e', desc: '하늘을 향해 뻗은 큰 나무', icon: '🌲' },
  '乙': { sound: '을', color: '#4ade80', desc: '바람을 이겨내는 작은 풀꽃', icon: '🌱' },
  '丙': { sound: '병', color: '#ef4444', desc: '세상을 비추는 뜨거운 태양', icon: '☀️' },
  '丁': { sound: '정', color: '#f87171', desc: '어둠을 밝히는 따뜻한 촛불', icon: '🕯️' },
  '戊': { sound: '무', color: '#eab308', desc: '모든 것을 품는 넓은 큰 산', icon: '⛰️' },
  '己': { sound: '기', color: '#facc15', desc: '곡식을 길러내는 비옥한 평야', icon: '🌾' },
  '庚': { sound: '경', color: '#94a3b8', desc: '단단하고 강직한 바위/원석', icon: '🪨' },
  '辛': { sound: '신', color: '#cbd5e1', desc: '빛나고 정교한 보석/칼', icon: '💎' },
  '壬': { sound: '임', color: '#3b82f6', desc: '끝없이 펼쳐진 깊은 바다', icon: '🌊' },
  '癸': { sound: '계', color: '#60a5fa', desc: '만물을 촉촉히 적시는 비', icon: '💧' },
  // 지지 (땅의 기운)
  '子': { sound: '자', color: '#3b82f6', desc: '한겨울의 차가운 물 (쥐)', icon: '🐭' },
  '丑': { sound: '축', color: '#eab308', desc: '얼어붙은 겨울의 땅 (소)', icon: '🐮' },
  '寅': { sound: '인', color: '#22c55e', desc: '봄을 알리는 큰 나무 (호랑이)', icon: '🐯' },
  '卯': { sound: '묘', color: '#4ade80', desc: '봄바람에 흔들리는 풀꽃 (토끼)', icon: '🐰' },
  '辰': { sound: '진', color: '#eab308', desc: '촉촉하고 활기찬 봄의 땅 (용)', icon: '🐲' },
  '巳': { sound: '사', color: '#ef4444', desc: '초여름의 뜨거운 불 (뱀)', icon: '🐍' },
  '午': { sound: '오', color: '#f87171', desc: '한여름의 강렬한 태양 (말)', icon: '🐴' },
  '未': { sound: '미', color: '#eab308', desc: '뜨겁게 마른 한여름의 땅 (양)', icon: '🐏' },
  '申': { sound: '신', color: '#94a3b8', desc: '단단하게 익은 가을의 바위 (원숭이)', icon: '🐵' },
  '酉': { sound: '유', color: '#cbd5e1', desc: '가을의 보석 같은 결실 (닭)', icon: '🐔' },
  '戌': { sound: '술', color: '#eab308', desc: '가을의 마른 땅 (개)', icon: '🐶' },
  '亥': { sound: '해', color: '#3b82f6', desc: '초겨울의 깊은 바다 (돼지)', icon: '🐷' }
};

export const OHAENG_COLORS: Record<string, string> = {
  '목': '#22c55e', '화': '#ef4444', '토': '#eab308', '금': '#94a3b8', '수': '#3b82f6'
};

function calculateOhaeng(saju: any) {
  const counts: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  const ganOhaeng: Record<string, string> = { '甲':'목', '乙':'목', '丙':'화', '丁':'화', '戊':'토', '己':'토', '庚':'금', '辛':'금', '壬':'수', '癸':'수' };
  const zhiOhaeng: Record<string, string> = { '寅':'목', '卯':'목', '巳':'화', '午':'화', '辰':'토', '戌':'토', '丑':'토', '未':'토', '申':'금', '酉':'금', '亥':'수', '子':'수' };

  Object.values(saju).forEach((pair: any) => {
    if (Array.isArray(pair)) {
      if (ganOhaeng[pair[0]]) counts[ganOhaeng[pair[0]]]++;
      if (zhiOhaeng[pair[1]]) counts[zhiOhaeng[pair[1]]]++;
    }
  });
  return counts;
}

export function calculateSaju(birthDate: string, birthTime: string, calendarType: string = 'solar', gender: string = 'male') {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (birthTime || '12:00').split(':').map(Number);

  let solar;
  if (calendarType === 'lunar') {
    const lunar = Lunar.fromYmd(year, month, day);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  }

  const lunarDate = solar.getLunar();
  const eightChar = lunarDate.getEightChar();
  
  const rawSaju = {
    year: [eightChar.getYearGan(), eightChar.getYearZhi()],
    month: [eightChar.getMonthGan(), eightChar.getMonthZhi()],
    day: [eightChar.getDayGan(), eightChar.getDayZhi()],
    hour: [eightChar.getTimeGan(), eightChar.getTimeZhi()], 
  };

  const ohaengCount = calculateOhaeng(rawSaju);
  
  const sajuBreakdown = [
    { title: '년주', items: rawSaju.year.map(char => ({ char, ...SAJU_MEANING[char] })) },
    { title: '월주', items: rawSaju.month.map(char => ({ char, ...SAJU_MEANING[char] })) },
    { title: '일주', items: rawSaju.day.map(char => ({ char, ...SAJU_MEANING[char] })) },
    { title: '시주', items: rawSaju.hour.map(char => ({ char, ...SAJU_MEANING[char] })) },
  ];

  return { sajuBreakdown, ohaengCount, rawSaju };
}
