import type { PlantInfo } from '../lib/logic'

export function Plant({ plant }: { plant: PlantInfo }) {
  return (
    <div style={{ display: 'inline-block', animation: 'bob 5s ease-in-out infinite' }}>
      <svg width="150" height="166" viewBox="0 0 200 220">
        <g transform={plant.droop} style={{ transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}>
          <path
            d="M100 150 C100 122 97 100 100 70"
            fill="none"
            stroke={plant.stem}
            strokeWidth="5"
            strokeLinecap="round"
            style={{ transition: 'stroke 0.6s' }}
          />
          <g transform="rotate(-30 78 120)">
            <ellipse cx="78" cy="120" rx="17" ry="7.5" fill={plant.leaf2} style={{ transition: 'fill 0.6s' }} />
          </g>
          <g transform="rotate(32 122 108)">
            <ellipse cx="122" cy="108" rx="17" ry="7.5" fill={plant.leaf} style={{ transition: 'fill 0.6s' }} />
          </g>
          <g transform="rotate(-26 82 92)">
            <ellipse cx="82" cy="92" rx="15" ry="6.5" fill={plant.leaf} style={{ transition: 'fill 0.6s' }} />
          </g>
          <g transform="rotate(28 120 82)">
            <ellipse cx="120" cy="82" rx="15" ry="6.5" fill={plant.leaf2} style={{ transition: 'fill 0.6s' }} />
          </g>
          <g transform="translate(100 64)" opacity={plant.flowerOp} style={{ transition: 'opacity 0.6s' }}>
            <circle cx="0" cy="-9" r="7" fill={plant.flower} />
            <circle cx="8.5" cy="-2.5" r="7" fill={plant.flower} />
            <circle cx="5.5" cy="7.5" r="7" fill={plant.flower} />
            <circle cx="-5.5" cy="7.5" r="7" fill={plant.flower} />
            <circle cx="-8.5" cy="-2.5" r="7" fill={plant.flower} />
            <circle cx="0" cy="0" r="6" fill="#E8C547" />
          </g>
        </g>
        <ellipse cx="100" cy="150" rx="44" ry="8" fill="#6B4F3A" />
        <rect x="52" y="142" width="96" height="13" rx="4" fill="#A6785C" />
        <path d="M56 153 L144 153 L135 206 Q135 211 130 211 L70 211 Q65 211 65 206 Z" fill="#B8896A" />
      </svg>
    </div>
  )
}
