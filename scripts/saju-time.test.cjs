// 출생시간 미상과 달력 변환이 명식·오행에 미치는 영향을 검증한다.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateSaju, normalizeBirthTime } = require('../lib/saju.ts');
const { Lunar } = require('lunar-javascript');

test('입력창과 이전 API의 미상 표시를 보존한다', () => {
  for (const input of [null, undefined, '', 'unknown']) {
    assert.equal(normalizeBirthTime(input), 'unknown');
  }
  assert.equal(normalizeBirthTime('12:00', true), 'unknown');
  assert.equal(normalizeBirthTime('00:00'), '00:00');
});

test('시간 미상은 시주와 오행 두 글자 및 정확한 대운 시작 나이를 제외한다', () => {
  const unknown = calculateSaju('1990-05-15', normalizeBirthTime('12:00', true), 'solar', 'female');
  const known = calculateSaju('1990-05-15', '12:00', 'solar', 'female');
  assert.equal(unknown.isUnknownTime, true);
  assert.equal(unknown.pillars[0].gan, '');
  assert.equal(unknown.pillars[0].zhi, '');
  assert.equal(Object.values(unknown.elementsCount).reduce((a, b) => a + b, 0), 6);
  assert.equal(Object.values(known.elementsCount).reduce((a, b) => a + b, 0), 8);
  assert.deepEqual(unknown.pillars.slice(1), known.pillars.slice(1));
  assert.deepEqual(unknown.daYun, []);
  assert.ok(known.daYun.length > 0);
});

test('음력 초하루 자정 보정은 양력 변환 후 전날로 넘어간다', () => {
  const solar = Lunar.fromYmdHms(1990, 5, 1, 0, 10, 0).getSolar();
  const ymd = [solar.getYear(), String(solar.getMonth()).padStart(2, '0'), String(solar.getDay()).padStart(2, '0')].join('-');
  const lunarResult = calculateSaju('1990-05-01', '00:10', 'lunar', 'female');
  const solarResult = calculateSaju(ymd, '00:10', 'solar', 'female');
  assert.deepEqual(lunarResult.pillars, solarResult.pillars);
  assert.equal(lunarResult.solarDate, solarResult.solarDate);
});

test('기존의 명확한 입력값은 같은 명식을 유지한다', () => {
  const result = calculateSaju('1990-05-15', '12:00', 'solar', 'female');
  assert.deepEqual(result.pillars.map(p => p.gan + p.zhi), ['壬午', '庚辰', '辛巳', '庚午']);
});
