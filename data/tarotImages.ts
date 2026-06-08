const TAROT_IMAGE_BASE = '/tarot/rws'

function padCardNumber(value: number) {
  return String(value).padStart(2, '0')
}

export function getTarotImageUrl(cardId: number) {
  if (cardId >= 0 && cardId <= 21) {
    return `${TAROT_IMAGE_BASE}/m${padCardNumber(cardId)}.jpg`
  }

  if (cardId >= 22 && cardId <= 35) {
    return `${TAROT_IMAGE_BASE}/w${padCardNumber(cardId - 21)}.jpg`
  }

  if (cardId >= 36 && cardId <= 49) {
    return `${TAROT_IMAGE_BASE}/c${padCardNumber(cardId - 35)}.jpg`
  }

  if (cardId >= 50 && cardId <= 63) {
    return `${TAROT_IMAGE_BASE}/s${padCardNumber(cardId - 49)}.jpg`
  }

  if (cardId >= 64 && cardId <= 77) {
    return `${TAROT_IMAGE_BASE}/p${padCardNumber(cardId - 63)}.jpg`
  }

  return null
}
