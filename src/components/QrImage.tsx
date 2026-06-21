import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrImage({ text, size = 180 }: { text: string; size?: number }) {
  const [url, setUrl] = useState<string>('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(text, {
      width: size * 2,
      margin: 1,
      color: { dark: '#2C2C28', light: '#FFFFFF' },
    })
      .then((u) => {
        if (alive) setUrl(u)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [text, size])

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      {url ? (
        <img src={url} width={size} height={size} alt="Código QR de invitación" style={{ display: 'block' }} />
      ) : null}
    </div>
  )
}
