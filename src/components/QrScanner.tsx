import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import { SYS } from './styles'

/** Full-screen camera QR scanner. Calls onResult with the decoded text. */
export function QrScanner({ onResult, onClose }: { onResult: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserQRCodeReader()
    let controls: IScannerControls | null = null
    let done = false

    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, videoRef.current!, (result) => {
        if (result && !done) {
          done = true
          onResult(result.getText())
          controls?.stop()
        }
      })
      .then((c) => {
        controls = c
        if (done) c.stop()
      })
      .catch((e: unknown) => {
        const name = (e as { name?: string }).name
        if (name === 'NotAllowedError') setError('Permiso de cámara denegado. Usa el código manual.')
        else if (name === 'NotFoundError') setError('No se ha encontrado cámara. Usa el código manual.')
        else setError('No se pudo abrir la cámara. Usa el código manual.')
      })

    return () => {
      done = true
      controls?.stop()
    }
  }, [onResult])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: '#1A1A18', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
        <span style={{ font: `600 16px ${SYS}`, color: '#FFFFFF' }}>Escanear código</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', font: `500 16px ${SYS}`, color: '#FFFFFF', cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {!error && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 220,
              height: 220,
              border: '3px solid rgba(255,255,255,0.85)',
              borderRadius: 24,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
            }}
          />
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
            <span style={{ font: `500 15px/1.4 ${SYS}`, color: '#FFFFFF' }}>{error}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '16px 18px', textAlign: 'center', font: `400 13px ${SYS}`, color: 'rgba(255,255,255,0.7)' }}>
        Apunta al QR que muestra tu pareja
      </div>
    </div>
  )
}
