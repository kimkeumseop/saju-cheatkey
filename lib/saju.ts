import { Solar, Lunar, EightChar } from 'lunar-javascript';

// 한자 -> 한글 매핑
const HANJA_TO_KO: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

// 오행별 색상 매핑 (Tailwind Class)
export const ELEMENT_STYLE: Record<string, { bg: string, text: string, border: string }> = {
  '木': { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#A5D6A7]' },
  '火': { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', border: 'border-[#EF9A9A]' },
  '土': { bg: 'bg-[#FFF8E1]', text: 'text-[#F9A825]', border: 'border-[#FFE082]' },
  '金': { bg: 'bg-[#FAFAFA]', text: 'text-[#616161]', border: 'border-[#EEEEEE]' },
  '水': { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#90CAF9]' },
  '목': { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#A5D6A7]' },
  '화': { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', border: 'border-[#EF9A9A]' },
  '토': { bg: 'bg-[#FFF8E1]', text: 'text-[#F9A825]', border: 'border-[#FFE082]' },
  '금': { bg: 'bg-[#FAFAFA]', text: 'text-[#616161]', border: 'border-[#EEEEEE]' },
  '수': { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#90CAF9]' },
};

// 일간(Day Gan) 기준으로 MBTI 성향 매핑
const MBTI_MAP: Record<string, string> = {
  '甲': 'ENTJ/ENFP', '乙': 'ENFJ/INFP',
  '丙': 'ESFP/ENTP', '丁': 'ISFP/INTP',
  '戊': 'ISTJ/ISFJ', '己': 'ISFJ/ESFJ',
  '庚': 'ENTJ/INTJ', '辛': 'INTJ/ISTP',
  '壬': 'INTP/ENTP', '癸': 'INFP/INFJ',
};

// 십성(Ten Gods) 계산 유틸
function getTenGod(dayGan: string, targetGan: string): string {
  return '비견'; 
}

export function calculateSaju(
  birthDate: string, 
  birthTime: string, 
  calendarType: 'solar' | 'lunar',
  gender: string = 'male'
) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (birthTime || "00:00").split(':').map(Number);

  let adjustedDate = new Date(year, month - 1, day, hour, minute);
  adjustedDate.setMinutes(adjustedDate.getMinutes() - 30);

  const solar = calendarType === 'lunar' 
    ? Lunar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0).getSolar()
    : Solar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0);

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2); 

  const dayGan = eightChar.getDayGan();

  const getElement = (char: string) => {
    if ('甲乙寅卯'.includes(char)) return '木';
    if ('丙丁巳午'.includes(char)) return '火';
    if ('戊己辰戌丑未'.includes(char)) return '土';
    if ('庚辛申酉'.includes(char)) return '金';
    if ('壬癸亥子'.includes(char)) return '水';
    return '土';
  };

  const pillars = [
    { label: '시주', gan: eightChar.getTimeGan(), zhi: eightChar.getTimeZhi() },
    { label: '일주', gan: eightChar.getDayGan(), zhi: eightChar.getDayZhi() },
    { label: '월주', gan: eightChar.getMonthGan(), zhi: eightChar.getMonthZhi() },
    { label: '연주', gan: eightChar.getYearGan(), zhi: eightChar.getYearZhi() },
  ];

  const resultPillars = pillars.map(p => ({
    ...p,
    ganKo: HANJA_TO_KO[p.gan] || p.gan,
    zhiKo: HANJA_TO_KO[p.zhi] || p.zhi,
    ganElement: getElement(p.gan),
    zhiElement: getElement(p.zhi),
    ganColor: ELEMENT_STYLE[getElement(p.gan)],
    zhiColor: ELEMENT_STYLE[getElement(p.zhi)],
    tenGod: getTenGod(dayGan, p.gan)
  }));

  return {
    dayGan,
    dayGanKo: HANJA_TO_KO[dayGan],
    dayGanElement: getElement(dayGan),
    mbti: MBTI_MAP[dayGan] || 'INTJ',
    pillars: resultPillars,
    rawSaju: resultPillars.map(p => `${p.gan}${p.zhi}`).join(' '),
    lunarDate: lunar.toString(),
    solarDate: solar.toString()
  };
}
