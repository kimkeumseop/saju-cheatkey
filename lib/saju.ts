import { Solar, Lunar } from 'lunar-javascript';

// 🔥 인스타 감성의 직관적인 자연물 및 상징 매핑
export const SAJU_MEANING: Record<string, { sound: string, color: string, desc: string, icon: string, element: string, emoji: string, elementLabel: string }> = {
  // 천간 (하늘의 기운)
  '甲': { sound: '갑', color: '#166534', desc: '하늘을 향해 뻗은 큰 나무', icon: '🌲', element: '목', emoji: '🌲', elementLabel: '나무' },
  '乙': { sound: '을', color: '#166534', desc: '바람을 이겨내는 작은 풀꽃', icon: '🌱', element: '목', emoji: '🌲', elementLabel: '나무' },
  '丙': { sound: '병', color: '#991b1b', desc: '세상을 비추는 뜨거운 태양', icon: '☀️', element: '화', emoji: '🔥', elementLabel: '불' },
  '丁': { sound: '정', color: '#991b1b', desc: '어둠을 밝히는 따뜻한 촛불', icon: '🕯️', element: '화', emoji: '🔥', elementLabel: '불' },
  '戊': { sound: '무', color: '#92400e', desc: '모든 것을 품는 넓은 큰 산', icon: '⛰️', element: '토', emoji: '🪨', elementLabel: '흙' },
  '己': { sound: '기', color: '#92400e', desc: '곡식을 길러내는 비옥한 평야', icon: '🌾', element: '토', emoji: '🪨', elementLabel: '흙' },
  '庚': { sound: '경', color: '#334155', desc: '단단하고 강직한 바위/원석', icon: '🪨', element: '금', emoji: '⚔️', elementLabel: '쇠' },
  '辛': { sound: '신', color: '#334155', desc: '빛나고 정교한 보석/칼', icon: '💎', element: '금', emoji: '⚔️', elementLabel: '쇠' },
  '壬': { sound: '임', color: '#1e40af', desc: '끝없이 펼쳐진 깊은 바다', icon: '🌊', element: '수', emoji: '💧', elementLabel: '물' },
  '癸': { sound: '계', color: '#1e40af', desc: '만물을 촉촉히 적시는 비', icon: '💧', element: '수', emoji: '💧', elementLabel: '물' },
  // 지지 (땅의 기운)
  '子': { sound: '자', color: '#1e40af', desc: '한겨울의 차가운 물 (쥐)', icon: '🐭', element: '수', emoji: '💧', elementLabel: '물' },
  '丑': { sound: '축', color: '#92400e', desc: '얼어붙은 겨울의 땅 (소)', icon: '🐮', element: '토', emoji: '🪨', elementLabel: '흙' },
  '寅': { sound: '인', color: '#166534', desc: '봄을 알리는 큰 나무 (호랑이)', icon: '🐯', element: '목', emoji: '🌲', elementLabel: '나무' },
  '卯': { sound: '묘', color: '#166534', desc: '봄바람에 흔들리는 풀꽃 (토끼)', icon: '🐰', element: '목', emoji: '🌲', elementLabel: '나무' },
  '辰': { sound: '진', color: '#92400e', desc: '촉촉하고 활기찬 봄의 땅 (용)', icon: '🐲', element: '토', emoji: '🪨', elementLabel: '흙' },
  '巳': { sound: '사', color: '#991b1b', desc: '초여름의 뜨거운 불 (뱀)', icon: '🐍', element: '화', emoji: '🔥', elementLabel: '불' },
  '午': { sound: '오', color: '#991b1b', desc: '한여름의 강렬한 태양 (말)', icon: '🐴', element: '화', emoji: '🔥', elementLabel: '불' },
  '未': { sound: '미', color: '#92400e', desc: '뜨겁게 마른 한여름의 땅 (양)', icon: '🐏', element: '토', emoji: '🪨', elementLabel: '흙' },
  '申': { sound: '신', color: '#334155', desc: '단단하게 익은 가을의 바위 (원숭이)', icon: '🐵', element: '금', emoji: '⚔️', elementLabel: '쇠' },
  '酉': { sound: '유', color: '#334155', desc: '가을의 보석 같은 결실 (닭)', icon: '🐔', element: '금', emoji: '⚔️', elementLabel: '쇠' },
  '戌': { sound: '술', color: '#92400e', desc: '가을의 마른 땅 (개)', icon: '🐶', element: '토', emoji: '🪨', elementLabel: '흙' },
  '亥': { sound: '해', color: '#1e40af', desc: '초여름의 깊은 바다 (돼지)', icon: '🐷', element: '수', emoji: '💧', elementLabel: '물' }
};

export const ELEMENT_STYLE: Record<string, { bg: string, text: string }> = {
  '목': { bg: 'bg-green-100', text: 'text-green-800' },
  '화': { bg: 'bg-red-100', text: 'text-red-800' },
  '토': { bg: 'bg-amber-100', text: 'text-amber-800' },
  '금': { bg: 'bg-slate-100', text: 'text-slate-700' },
  '수': { bg: 'bg-blue-100', text: 'text-blue-800' }
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
    { 
      title: '년주', 
      items: rawSaju.year.map((char) => ({ 
        char, 
        ...SAJU_MEANING[char]
      })) 
    },
    { 
      title: '월주', 
      items: rawSaju.month.map((char) => ({ 
        char, 
        ...SAJU_MEANING[char]
      })) 
    },
    { 
      title: '일주', 
      items: rawSaju.day.map((char) => ({ 
        char, 
        ...SAJU_MEANING[char]
      })) 
    },
    { 
      title: '시주', 
      items: rawSaju.hour.map((char) => ({ 
        char, 
        ...SAJU_MEANING[char]
      })) 
    },
  ];

  return { sajuBreakdown, ohaengCount, rawSaju };
}
