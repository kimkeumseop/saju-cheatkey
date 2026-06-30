'use client'

import { useEffect, useState, type CSSProperties } from 'react'

type TarotCardImageProps = {
  imageUrl?: string | null
  name: string
  emoji: string
  className?: string
  style?: CSSProperties
  fallbackClassName?: string
  showName?: boolean
}

export default function TarotCardImage({
  imageUrl,
  name,
  emoji,
  className = 'w-full h-full object-contain',
  style,
  fallbackClassName = 'text-3xl',
  showName = false,
}: TarotCardImageProps) {
  const [failed, setFailed] = useState(false)
  const safeUrl = typeof imageUrl === 'string' ? imageUrl.trim() : ''

  useEffect(() => {
    setFailed(false)
  }, [safeUrl])

  if (safeUrl && !failed) {
    return (
      <img
        src={safeUrl}
        alt={name}
        className={className}
        style={style}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[inherit] text-center"
      style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(124,111,214,0.22), rgba(83,74,183,0.14) 42%, rgba(255,255,255,0.10) 100%)',
        color: '#7c6fd6',
      }}
    >
      <span className={fallbackClassName}>{emoji}</span>
      {showName && <span className="px-2 text-[10px] font-black leading-tight text-[#453DA0]">{name}</span>}
    </div>
  )
}
