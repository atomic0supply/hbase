import { SYS } from './styles'

/** Member avatar: Google photo if available, else a colored dot with the initial. */
export function Avatar({
  name,
  color,
  photo,
  size = 28,
  ring,
}: {
  name: string
  color: string
  photo?: string | null
  size?: number
  ring?: boolean
}) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flex: 'none' as const,
    boxShadow: ring ? `0 0 0 2px var(--card), 0 0 0 3.5px ${color}` : undefined,
  }
  if (photo) {
    return <img src={photo} alt={name} width={size} height={size} referrerPolicy="no-referrer" style={{ ...style, objectFit: 'cover' }} />
  }
  return (
    <span
      style={{
        ...style,
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: `600 ${Math.round(size * 0.44)}px ${SYS}`,
      }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  )
}
