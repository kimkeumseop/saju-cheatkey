import { Solar, Lunar, EightChar } from 'lunar-javascript';

// 한자 -> 한글 매핑
const HANJA_TO_KO: Record<string, string> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
};

// 십신 한글 매핑 (중국어 간체 대응)
const TEN_GOD_KO: Record<string, string> = {
  '比肩': '비견', '劫财': '겁재', '食神': '식신', '伤官': '상관',
  '偏财': '편재', '正财': '정재', '七杀': '편관', '正官': '정관',
  '偏印': '편인', '正印': '정인'
};

// 십이운성 한글 매핑
const UNSEONG_KO: Record<string, string> = {
  '长生': '장생', '沐浴': '목욕', '冠带': '관대', '临官': '건록',
  '帝旺': '제왕', '衰': '쇠', '病': '병', '死': '사',
  '墓': '묘', '绝': '절', '胎': '태', '养': '양'
};

// 지지 -> 동물 아이콘 매핑
const ZODIAC_ICONS: Record<string, string> = {
  '子': '🐭', '丑': '🐮', '寅': '🐯', '卯': '🐰', '辰': '🐲', '巳': '🐍', '午': '🐴', '未': '🐑', '申': '🐵', '酉': '🐔', '戌': '🐶', '亥': '🐷'
};

// 오행별 색상 매핑
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

// 신살 수동 계산 함수
function calculateKeyShinsal(dayGan: string, pillars: any[]) {
  const shinsal = new Set<string>();
  const zhis = pillars.map(p => p.zhi);
  const gzs = pillars.map(p => p.gan + p.zhi);

  // 1. 천을귀인 (Day Gan 기준)
  const cheonEul: Record<string, string[]> = {
    '甲': ['未', '丑'], '戊': ['未', '丑'], '庚': ['未', '丑'],
    '乙': ['申', '子'], '己': ['申', '子'],
    '丙': ['酉', '亥'], '丁': ['酉', '亥'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['午', '寅']
  };
  if (cheonEul[dayGan]?.some(z => zhis.includes(z))) shinsal.add('천을귀인');

  // 2. 문창귀인 (Day Gan 기준)
  const moonChang: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
  };
  if (zhis.includes(moonChang[dayGan])) shinsal.add('문창귀인');

  // 3. 백호살 (Pillar 기준)
  const baekHo = ['甲辰', '乙未', '丙戌', '丁丑', '戊辰', '壬戌', '癸丑'];
  if (gzs.some(gz => baekHo.includes(gz))) shinsal.add('백호살');

  // 4. 역마살 (월지/일지 기준 - 단순화)
  const yeokMaMap: Record<string, string> = {
    '申': '寅', '子': '寅', '辰': '寅',
    '寅': '申', '午': '申', '戌': '申',
    '巳': '亥', '酉': '亥', '丑': '亥',
    '亥': '巳', '卯': '巳', '未': '巳'
  };
  if (zhis.includes(yeokMaMap[zhis[1]]) || zhis.includes(yeokMaMap[zhis[2]])) shinsal.add('역마살');

  // 5. 도화살 (월지/일지 기준 - 단순화)
  const doHwaMap: Record<string, string> = {
    '申': '酉', '子': '酉', '辰': '酉',
    '寅': '卯', '午': '卯', '戌': '卯',
    '巳': '午', '酉': '午', '丑': '午',
    '亥': '子', '卯': '子', '未': '子'
  };
  if (zhis.includes(doHwaMap[zhis[1]]) || zhis.includes(doHwaMap[zhis[2]])) shinsal.add('도화살');

  // 6. 괴강살
  const goeGang = ['戊戌', '庚戌', '庚辰', '壬辰', '壬戌'];
  if (gzs.some(gz => goeGang.includes(gz))) shinsal.add('괴강살');

  return Array.from(shinsal);
}

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

  const getSafeTenGodGan = (pillar: string) => {
    try {
      let hanja = '';
      if (pillar === 'year') hanja = eightChar.getYearShiShenGan();
      else if (pillar === 'month') hanja = eightChar.getMonthShiShenGan();
      else if (pillar === 'day') return '일간';
      else if (pillar === 'time') hanja = eightChar.getTimeShiShenGan();
      return TEN_GOD_KO[hanja] || hanja || '';
    } catch { return ''; }
  };

  const getSafeTenGodZhi = (pillar: string) => {
    try {
      let hanja = '';
      if (pillar === 'year') hanja = eightChar.getYearShiShenZhi()[0];
      else if (pillar === 'month') hanja = eightChar.getMonthShiShenZhi()[0];
      else if (pillar === 'day') hanja = eightChar.getDayShiShenZhi()[0];
      else if (pillar === 'time') hanja = eightChar.getTimeShiShenZhi()[0];
      return TEN_GOD_KO[hanja] || hanja || '';
    } catch { return ''; }
  };

  const getSafeUnSeong = (pillar: string) => {
    try {
      let hanja = '';
      if (pillar === 'year') hanja = eightChar.getYearDiShi();
      else if (pillar === 'month') hanja = eightChar.getMonthDiShi();
      else if (pillar === 'day') hanja = eightChar.getDayDiShi();
      else if (pillar === 'time') hanja = eightChar.getTimeDiShi();
      return UNSEONG_KO[hanja] || hanja || '';
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

  const elementsCount: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  const ELE_MAP: Record<string, string> = { '木': '목', '火': '화', '土': '토', '金': '금', '水': '수' };
  pillars.forEach(p => {
    if (p.isUnknown) return;
    elementsCount[ELE_MAP[p.ganElement]]++;
    elementsCount[ELE_MAP[p.zhiElement]]++;
  });

  const keyShinsal = calculateKeyShinsal(dayGan, pillarsData);

  const daYunList: any[] = [];
  try {
    const yun = eightChar.getYun(gender === 'male' ? 1 : 0);
    const dys = yun.getDaYun();
    dys.slice(1, 9).forEach(dy => {
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
  } catch (e) {
    console.error('DaYun Error:', e);
  }

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
