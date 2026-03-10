import { Solar, Lunar, EightChar } from 'lunar-javascript';

// 한자 -> 한글 매핑
const HANJA_TO_KO: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

// 오행별 색상 매핑 (Tailwind Class)
export const ELEMENT_STYLE: Record<string, { bg: string, text: string, border: string, color: string }> = {
  '木': { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#A5D6A7]', color: '#2E7D32' },
  '火': { bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]', border: 'border-[#EF9A9A]', color: '#C62828' },
  '土': { bg: 'bg-[#FFF8E1]', text: 'text-[#F9A825]', border: 'border-[#FFE082]', color: '#F9A825' },
  '金': { bg: 'bg-[#FAFAFA]', text: 'text-[#616161]', border: 'border-[#EEEEEE]', color: '#616161' },
  '水': { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#90CAF9]', color: '#1565C0' },
};

// 십신 한글 매핑
const TEN_GOD_KO: Record<string, string> = {
  '비견': '비견', '겁재': '겁재', '식신': '식신', '상관': '상관',
  '편재': '편재', '정재': '정재', '편관': '편관', '정관': '정관',
  '편인': '편인', '정인': '정인'
};

// 일간(Day Gan) 기준으로 MBTI 성향 매핑
const MBTI_MAP: Record<string, string> = {
  '甲': 'ENTJ/ENFP', '乙': 'ENFJ/INFP',
  '丙': 'ESFP/ENTP', '丁': 'ISFP/INTP',
  '戊': 'ISTJ/ISFJ', '己': 'ISFJ/ESFJ',
  '庚': 'ENTJ/INTJ', '辛': 'INTJ/ISTP',
  '壬': 'INTP/ENTP', '癸': 'INFP/INFJ',
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
  // 한국 경도 보정 (-30분)
  adjustedDate.setMinutes(adjustedDate.getMinutes() - 30);

  const solar = calendarType === 'lunar' 
    ? Lunar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0).getSolar()
    : Solar.fromYmdHms(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, adjustedDate.getDate(), adjustedDate.getHours(), adjustedDate.getMinutes(), 0);

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2); // 야자시/조자시 처리

  const dayGan = eightChar.getDayGan();

  // 1. 8자 기둥 및 십신/십이운성 구성
  const pillarsData = [
    { label: '시주', gan: eightChar.getTimeGan(), zhi: eightChar.getTimeZhi(), tenGodGan: eightChar.getTimeTenStarGan(), tenGodZhi: eightChar.getTimeTenStarZhi(), unSeong: eightChar.getTimeShiErYunXing() },
    { label: '일주', gan: eightChar.getDayGan(), zhi: eightChar.getDayZhi(), tenGodGan: '일간', tenGodZhi: eightChar.getDayTenStarZhi(), unSeong: eightChar.getDayShiErYunXing() },
    { label: '월주', gan: eightChar.getMonthGan(), zhi: eightChar.getMonthZhi(), tenGodGan: eightChar.getMonthTenStarGan(), tenGodZhi: eightChar.getMonthTenStarZhi(), unSeong: eightChar.getMonthShiErYunXing() },
    { label: '연주', gan: eightChar.getYearGan(), zhi: eightChar.getYearZhi(), tenGodGan: eightChar.getYearTenStarGan(), tenGodZhi: eightChar.getYearTenStarZhi(), unSeong: eightChar.getYearShiErYunXing() },
  ];

  const pillars = pillarsData.map(p => ({
    ...p,
    ganKo: HANJA_TO_KO[p.gan],
    zhiKo: HANJA_TO_KO[p.zhi],
    ganElement: getElement(p.gan),
    zhiElement: getElement(p.zhi),
    ganColor: ELEMENT_STYLE[getElement(p.gan)],
    zhiColor: ELEMENT_STYLE[getElement(p.zhi)],
    // 시주의 경우 시간 모르면 가림 처리 가능
    isUnknown: p.label === '시주' && isUnknownTime
  }));

  // 2. 오행 분포 계산
  const elementsCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  pillars.forEach(p => {
    if (p.isUnknown) return;
    elementsCount[p.ganElement]++;
    elementsCount[p.zhiElement]++;
  });

  // 3. 주요 신살 계산 (천을귀인 등)
  const allShinsal = [...eightChar.getYearHideGan(), ...eightChar.getMonthHideGan(), ...eightChar.getDayHideGan(), ...eightChar.getTimeHideGan()];
  // 간단한 로직으로 핵심 귀인 추출 (실제로는 EightChar.getShinsal 등 라이브러리 지원 확인 필요)
  // 여기서는 예시로 몇 가지 주요 신살 리스트업
  const keyShinsal = [];
  const shinsalFull = lunar.getBaZiShenSha(); // [ '연주 천을귀인', ... ] 형태
  if (shinsalFull.some(s => s.includes('天乙'))) keyShinsal.push('천을귀인');
  if (shinsalFull.some(s => s.includes('文昌'))) keyShinsal.push('문창귀인');
  if (shinsalFull.some(s => s.includes('羊刃'))) keyShinsal.push('양인살');
  if (shinsalFull.some(s => s.includes('白虎'))) keyShinsal.push('백호살');
  if (shinsalFull.some(s => s.includes('驛馬'))) keyShinsal.push('역마살');
  if (shinsalFull.some(s => s.includes('桃花'))) keyShinsal.push('도화살');

  // 4. 대운 계산
  const daYunObj = eightChar.getLuck(gender === 'male' ? 1 : 0);
  const daYunList = daYunObj.getDaYun().slice(1, 9).map(dy => {
    const gan = dy.getGanZhi().substring(0, 1);
    const zhi = dy.getGanZhi().substring(1, 2);
    return {
      age: dy.getStartAge(),
      ganKo: HANJA_TO_KO[gan],
      zhiKo: HANJA_TO_KO[zhi],
      ganElement: getElement(gan),
      zhiElement: getElement(zhi),
      ganColor: ELEMENT_STYLE[getElement(gan)],
      zhiColor: ELEMENT_STYLE[getElement(zhi)],
    };
  });

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
