import * as admin from 'firebase-admin'
import * as serviceAccount from '../serviceAccount.json'
import { TAROT_CARDS } from '../data/tarotCards'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
})

const db = admin.firestore()

const WIKIMEDIA_URLS: Record<number, string> = {
  0:  'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
  1:  'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
  2:  'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
  3:  'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
  4:  'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
  5:  'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
  6:  'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg',
  7:  'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
  8:  'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
  9:  'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
  10: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
  11: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg',
  12: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
  13: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
  14: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
  15: 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg',
  16: 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
  17: 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg',
  18: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg',
  19: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
  20: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
  21: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
  22: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg',
  23: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg',
  24: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg',
  25: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg',
  26: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg',
  27: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg',
  28: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Wands07.jpg',
  29: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg',
  30: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Wands09.jpg',
  31: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wands10.jpg',
  32: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Wands11.jpg',
  33: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Wands12.jpg',
  34: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Wands13.jpg',
  35: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Wands14.jpg',
  36: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg',
  37: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg',
  38: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg',
  39: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg',
  40: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg',
  41: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg',
  42: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg',
  43: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg',
  44: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg',
  45: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Cups10.jpg',
  46: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg',
  47: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Cups12.jpg',
  48: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Cups13.jpg',
  49: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg',
  50: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg',
  51: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Swords02.jpg',
  52: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Swords03.jpg',
  53: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Swords04.jpg',
  54: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Swords05.jpg',
  55: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Swords06.jpg',
  56: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Swords07.jpg',
  57: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Swords08.jpg',
  58: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Swords09.jpg',
  59: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords10.jpg',
  60: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Swords11.jpg',
  61: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Swords12.jpg',
  62: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords13.jpg',
  63: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Swords14.jpg',
  64: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg',
  65: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Pents02.jpg',
  66: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents03.jpg',
  67: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Pents04.jpg',
  68: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Pents05.jpg',
  69: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Pents06.jpg',
  70: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents07.jpg',
  71: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pents08.jpg',
  72: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg',
  73: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg',
  74: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Pents11.jpg',
  75: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Pents12.jpg',
  76: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Pents13.jpg',
  77: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Pents14.jpg',
}

async function seed() {
  console.log(`총 ${TAROT_CARDS.length}장 업로드 시작...`)
  const batch = db.batch()

  for (const card of TAROT_CARDS) {
    const ref = db.collection('tarotCards').doc(String(card.id))
    batch.set(ref, { ...card, imageUrl: WIKIMEDIA_URLS[card.id] || null })
  }

  await batch.commit()
  console.log('✅ Firestore tarotCards 78장 + imageUrl 등록 완료!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌', err)
  process.exit(1)
})
