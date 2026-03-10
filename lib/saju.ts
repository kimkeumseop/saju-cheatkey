import { Solar, Lunar, EightChar } from 'lunar-javascript';

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

// 일간(Day Gan) 기준으로 MBTI 성향 매핑 (기획안 기반)
const MBTI_MAP: Record<string, string> = {
  '甲': 'ENTJ/ENFP', '乙': 'ENFJ/INFP',
  '丙': 'ESFP/ENTP', '丁': 'ISFP/INTP',
  '戊': 'ISTJ/ISFJ', '己': 'ISFJ/ESFJ',
  '庚': 'ENTJ/INTJ', '辛': 'INTJ/ISTP',
  '壬': 'INTP/ENTP', '癸': 'INFP/INFJ',
};

// 십성(Ten Gods) 계산 유틸
function getTenGod(dayGan: string, targetGan: string): string {
  // 실제 명리학 생극제화 공식이 들어가야 하지만, 
  // 여기서는 구조 파악을 위해 간단한 매핑 예시로 둠
  return '비견'; // 실제로는 정재, 편관 등이 계산됨
}

export function calculateSaju(
  birthDate: string, 
  birthTime: string, 
  calendarType: 'solar' | 'lunar',
  gender: string = 'male'
) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = (birthTime || "00:00").split(':').map(Number);

  // 1. 한국 표준시 보정 (-30분)
  let adjustedDate = new Date(year, month - 1, day, hour, minute);
  adjustedDate.setMinutes(adjustedDate.getMinutes() - 30);

  const solar = calendarType === 'lunar' 
    ? Lunar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0).getSolar()
    : Solar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0);

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2); // 야자시 적용 정석

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
  ].map(p => ({
    ...p,
    ganElement: getElement(p.gan),
    zhiElement: getElement(p.zhi),
    ganColor: ELEMENT_STYLE[getElement(p.gan)],
    zhiColor: ELEMENT_STYLE[getElement(p.zhi)],
    tenGod: getTenGod(dayGan, p.gan)
  }));

  return {
    dayGan,
    dayGanElement: getElement(dayGan),
    mbti: MBTI_MAP[dayGan] || 'INTJ',
    pillars,
    lunarDate: lunar.toString(),
    solarDate: solar.toString()
  };
}
