// 사주·궁합 API가 이전 클라이언트의 미상 표시를 캐시 키와 계산에 반영하는지 검증한다.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const saju = require('../lib/saju.ts');

function loadRoute(route) {
  const keys = [];
  const calculations = [];
  const mocks = {
    'next/server': { NextResponse: { json: (body, options) => Response.json(body, options) } },
    '@/lib/saju': { ...saju, calculateSaju: (...args) => {
      const result = saju.calculateSaju(...args);
      calculations.push(result);
      return result;
    } },
    '@google/generative-ai': {},
    '@/lib/ai': { streamPrebuilt: text => text },
    '@/lib/saju-schema': {},
    '@/lib/saju-cache': {
      buildReportCacheKey: (version, parts) => { keys.push([version, ...parts]); return 'test-key'; },
      getCachedReport: async () => 'cached-test-report',
    },
  };
  const source = readFileSync(path.join(__dirname, '..', 'app', 'api', route, 'route.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    assert.ok(Object.hasOwn(mocks, name), `모의 처리되지 않은 의존성 ${name}`);
    return mocks[name];
  }, module, module.exports);
  return { post: module.exports.POST, keys, calculations };
}

const person = { name: '가상 테스트', birthDate: '1990-05-15', birthTime: '12:00', calendarType: 'solar', gender: 'female' };

test('사주 API는 낮 12시와 시간 미상 캐시를 구분하고 미상 시주를 제외한다', async () => {
  const route = loadRoute('saju');
  for (const isTimeUnknown of [true, false]) {
    const response = await route.post({ json: async () => ({ ...person, isTimeUnknown }) });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'cached-test-report');
  }
  assert.equal(route.keys[0][2], 'unknown');
  assert.equal(route.keys[1][2], '12:00');
  assert.equal(route.calculations[0].pillars[0].isUnknown, true);
  assert.equal(route.calculations[1].pillars[0].isUnknown, false);
});

test('궁합 API는 두 사람 각각의 미상 표시를 캐시 조회 전 정규화한다', async () => {
  const route = loadRoute('gunghap');
  const response = await route.post({ json: async () => ({
    user1: { ...person, isTimeUnknown: true },
    user2: { ...person, birthTime: '' }, relationship: 'friend',
  }) });
  assert.equal(response.status, 200);
  assert.equal(route.keys[0][2], 'unknown');
  assert.equal(route.keys[0][6], 'unknown');
});
