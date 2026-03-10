import { Solar, Lunar, EightChar } from 'lunar-javascript';

// 한자 -> 한글 매핑
const HANJA_TO_KO: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

// 지지 -> 동물 아이콘 매핑
const ZODIAC_ICONS: Record<string, string> = {
  '子': '🐭', '丑': '🐮', '寅': '🐯', '卯': '🐰', '辰': '🐲', '巳': '🐍', '午': '🐴', '未': '🐑', '申': '🐵', '酉': '🐔', '戌': '🐶', '亥': '🐷'
};

// 오행별 색상 매핑 (Tailwind Class)
export const ELEMENT_STYLE: Record<string, { bg: string, text: string, border: string, color: string }> = {
  '木': { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#A5D6A7]', color: '#2E7D32' },
  '火': { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', border: 'border-[#EF9A9A]', color: '#C62828' },
  '土': { bg: 'bg-[#FFF8E1]', text: 'text-[#F9A825]', border: 'border-[#FFE082]', color: '#F9A825' },
  '金': { bg: 'bg-[#FAFAFA]', text: 'text-[#616161]', border: 'border-[#EEEEEE]', color: '#616161' },
  '水': { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#90CAF9]', color: '#1565C0' },
};

const MBTI_MAP: Record<string, string> = {
  '甲': 'ENTJ', '乙': 'ENFJ', '丙': 'ESFP', '丁': 'ISFP',
  '戊': 'ISTJ', '己': 'ISFJ', '庚': 'ESTJ', '辛': 'ISTP',
  '壬': 'INTP', '癸': 'INFP',
};

const getElement = (char: string) => {
  if ('甲乙寅卯'.includes(char)) return '木';
  if ('丙丁巳午'.includes(char)) return '火';
  if ('戊己辰戌丑未'.includes(char)) return '土';
  if ('庚辛申酉'.includes(char)) return '金';
  if ('壬癸亥子'.includes(char)) return '水';
  return '土';
};

export function calculateSaju(
  birthDate: string, 
  birthTime: string, 
  calendarType: 'solar' | 'lunar',
  gender: string = 'male'
) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const isUnknownTime = birthTime === 'unknown';
  const [hour, minute] = (isUnknownTime ? "12:00" : (birthTime || "00:00")).split(':').map(Number);

  let adjustedDate = new Date(year, month - 1, day, hour, minute);
  adjustedDate.setMinutes(adjustedDate.getMinutes() - 30);

  const solar = calendarType === 'lunar' 
    ? Lunar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0).getSolar()
    : Solar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0);

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2);

  const dayGan = eightChar.getDayGan();

  // 안전하게 십신 및 십이운성을 가져오는 헬퍼 함수
  const getSafeTenGodGan = (pillar: string) => {
    try {
      if (pillar === 'year') return eightChar.getYearShiShenGan();
      if (pillar === 'month') return eightChar.getMonthShiShenGan();
      if (pillar === 'day') return '일간';
      if (pillar === 'time') return eightChar.getTimeShiShenGan();
      return '';
    } catch { return ''; }
  };

  const getSafeTenGodZhi = (pillar: string) => {
    try {
      if (pillar === 'year') return eightChar.getYearShiShenZhi()[0];
      if (pillar === 'month') return eightChar.getMonthShiShenZhi()[0];
      if (pillar === 'day') return eightChar.getDayShiShenZhi()[0];
      if (pillar === 'time') return eightChar.getTimeShiShenZhi()[0];
      return '';
    } catch { return ''; }
  };

  const getSafeUnSeong = (pillar: string) => {
    try {
      if (pillar === 'year') return eightChar.getYearShiErYunXing();
      if (pillar === 'month') return eightChar.getMonthShiErYunXing();
      if (pillar === 'day') return eightChar.getDayShiErYunXing();
      if (pillar === 'time') return eightChar.getTimeShiErYunXing();
      return '';
    } catch { return ''; }
  };

  const pillarsData = [
    { label: '시주', gan: eightChar.getTimeGan(), zhi: eightChar.getTimeZhi(), tenGodGan: getSafeTenGodGan('time'), tenGodZhi: getSafeTenGodZhi('time'), unSeong: getSafeUnSeong('time') },
    { label: '일주', gan: eightChar.getDayGan(), zhi: eightChar.getDayZhi(), tenGodGan: '일간', tenGodZhi: getSafeTenGodZhi('day'), unSeong: getSafeUnSeong('day') },
    { label: '월주', gan: eightChar.getMonthGan(), zhi: eightChar.getMonthZhi(), tenGodGan: getSafeTenGodGan('month'), tenGodZhi: getSafeTenGodZhi('month'), unSeong: getSafeUnSeong('month') },
    { label: '연주', gan: eightChar.getYearGan(), zhi: eightChar.getYearZhi(), tenGodGan: getSafeTenGodGan('year'), tenGodZhi: getSafeTenGodZhi('year'), unSeong: getSafeUnSeong('year') },
  ];

  const pillars = pillarsData.map(p => ({
    ...p,
    ganKo: HANJA_TO_KO[p.gan],
    zhiKo: HANJA_TO_KO[p.zhi],
    zodiacIcon: ZODIAC_ICONS[p.zhi],
    ganElement: getElement(p.gan),
    zhiElement: getElement(p.zhi),
    ganColor: ELEMENT_STYLE[getElement(p.gan)],
    zhiColor: ELEMENT_STYLE[getElement(p.zhi)],
    isUnknown: p.label === '시주' && isUnknownTime
  }));

  const elementsCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  pillars.forEach(p => {
    if (p.isUnknown) return;
    elementsCount[p.ganElement]++;
    elementsCount[p.zhiElement]++;
  });

  const keyShinsal: string[] = [];
  try {
    const shinsalFull = lunar.getBaZiShenSha();
    if (shinsalFull.some(s => s.includes('天乙'))) keyShinsal.push('천을귀인');
    if (shinsalFull.some(s => s.includes('文昌'))) keyShinsal.push('문창귀인');
    if (shinsalFull.some(s => s.includes('羊刃'))) keyShinsal.push('양인살');
    if (shinsalFull.some(s => s.includes('白虎'))) keyShinsal.push('백호살');
    if (shinsalFull.some(s => s.includes('驛馬'))) keyShinsal.push('역마살');
    if (shinsalFull.some(s => s.includes('桃花'))) keyShinsal.push('도화살');
    if (shinsalFull.some(s => s.includes('華蓋'))) keyShinsal.push('화개살');
  } catch (e) {}

  const daYunList: any[] = [];
  try {
    const daYunObj = eightChar.getLuck(gender === 'male' ? 1 : 0);
    const dys = daYunObj.getDaYun().slice(1, 9);
    dys.forEach(dy => {
      const gz = dy.getGanZhi();
      const gan = gz.substring(0, 1);
      const zhi = gz.substring(1, 2);
      daYunList.push({
        age: dy.getStartAge(),
        ganKo: HANJA_TO_KO[gan],
        zhiKo: HANJA_TO_KO[zhi],
        ganElement: getElement(gan),
        zhiElement: getElement(zhi),
        ganColor: ELEMENT_STYLE[getElement(gan)],
        zhiColor: ELEMENT_STYLE[getElement(zhi)],
      });
    });
  } catch (e) {}

  return {
    dayGan,
    dayGanKo: HANJA_TO_KO[dayGan],
    dayGanElement: getElement(dayGan),
    mbti: MBTI_MAP[dayGan] || 'INTJ',
    pillars,
    elementsCount,
    keyShinsal: keyShinsal.slice(0, 4),
    daYun: daYunList,
    lunarDate: lunar.toString(),
    solarDate: solar.toString(),
    isUnknownTime
  };
}
