/**
 * Soft pastel SVG illustrations — same visual language as reference images 3 & 4.
 * Rounded forms, pastel palette, minimal linework, friendly and calm.
 *
 * All illustrations are self-contained SVGs using inline styles so they
 * are unaffected by Tailwind's purge and work in any theme.
 *
 * Usage:
 *   import { IllustrationTasks } from '../components/Illustrations'
 *   <IllustrationTasks width={120} />
 */

/* ── Shared palette ──────────────────────────────────────────────── */
const P = {
  cream:   '#FFFCF7',
  peach:   '#FFD8B8',
  yellow:  '#FFE5A3',
  pink:    '#F4D5D5',
  sage:    '#D8E8D5',
  blue:    '#D9E8F5',
  lavender:'#E5DCF5',
  brown:   '#5C4033',
  brownMid:'#8A7560',
  accent:  '#E5985A',
  accentDk:'#C97A38',
  white:   '#FFFFFF',
  border:  '#EDE0C8',
}

/* ── Task / Checklist illustration ──────────────────────────────── */
export function IllustrationTasks({ width = 120, className = '' }) {
  const h = Math.round(width * 1.1)
  return (
    <svg width={width} height={h} viewBox="0 0 120 132" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Notebook body */}
      <rect x="18" y="12" width="84" height="100" rx="12" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      {/* Spine binding */}
      <rect x="18" y="12" width="14" height="100" rx="10" fill={P.peach}/>
      {/* Spiral binding dots */}
      {[28, 44, 60, 76, 92].map((y) => (
        <circle key={y} cx="25" cy={y} r="4" fill={P.white} stroke={P.border} strokeWidth="1"/>
      ))}
      {/* Lined rows */}
      {[36, 52, 68, 84].map((y, i) => (
        <g key={y}>
          {/* Check circle */}
          <circle cx="48" cy={y} r="7"
            fill={i === 0 ? P.accent : i === 1 ? P.sage : P.blue}
            opacity={i === 2 ? 0.6 : 1}/>
          {i < 2 && (
            <polyline points={`${44},${y} ${47},${y+3} ${52},${y-3}`}
              stroke={P.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          )}
          {/* Task line */}
          <rect x="60" y={y - 4} width={i === 2 ? 26 : 34} height="8" rx="4"
            fill={P.border} opacity={i === 2 ? 0.5 : 0.9}/>
        </g>
      ))}
      {/* Small pencil decoration */}
      <g transform="translate(78, 8) rotate(30)">
        <rect x="0" y="0" width="8" height="24" rx="2" fill={P.yellow}/>
        <rect x="0" y="0" width="8" height="5" rx="2" fill={P.pink}/>
        <polygon points="0,24 4,32 8,24" fill={P.brownMid}/>
        <rect x="1" y="20" width="6" height="4" fill={P.peach}/>
      </g>
    </svg>
  )
}

/* ── Clock / Reminder illustration ──────────────────────────────── */
export function IllustrationReminders({ width = 120, className = '' }) {
  const h = width
  return (
    <svg width={width} height={h} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Alarm clock body */}
      <circle cx="60" cy="62" r="40" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      <circle cx="60" cy="62" r="32" fill={P.white} stroke={P.border} strokeWidth="1"/>
      {/* Clock face hour markers */}
      {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2
        const r1 = i % 3 === 0 ? 25 : 27
        const r2 = 30
        return (
          <line key={i}
            x1={60 + r1 * Math.cos(a)} y1={62 + r1 * Math.sin(a)}
            x2={60 + r2 * Math.cos(a)} y2={62 + r2 * Math.sin(a)}
            stroke={P.border} strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round"/>
        )
      })}
      {/* Hour hand — pointing ~10 */}
      <line x1="60" y1="62" x2="48" y2="48"
        stroke={P.brown} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Minute hand — pointing ~2 */}
      <line x1="60" y1="62" x2="72" y2="44"
        stroke={P.accentDk} strokeWidth="2" strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx="60" cy="62" r="3.5" fill={P.accent}/>
      {/* Bell top */}
      <ellipse cx="60" cy="22" rx="14" ry="8" fill={P.peach} stroke={P.border} strokeWidth="1.2"/>
      <line x1="50" y1="25" x2="46" y2="30" stroke={P.border} strokeWidth="2" strokeLinecap="round"/>
      <line x1="70" y1="25" x2="74" y2="30" stroke={P.border} strokeWidth="2" strokeLinecap="round"/>
      {/* Bell ringer */}
      <circle cx="60" cy="96" r="5" fill={P.peach} stroke={P.border} strokeWidth="1"/>
      {/* Legs */}
      <line x1="46" y1="98" x2="40" y2="108" stroke={P.border} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="74" y1="98" x2="80" y2="108" stroke={P.border} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Stars / ringing effect */}
      <text x="12" y="50" fontSize="10" fill={P.accent} opacity="0.7">✦</text>
      <text x="96" y="44" fontSize="8" fill={P.yellow} opacity="0.8">✦</text>
    </svg>
  )
}

/* ── Calendar illustration ───────────────────────────────────────── */
export function IllustrationCalendar({ width = 120, className = '' }) {
  const h = Math.round(width * 0.95)
  return (
    <svg width={width} height={h} viewBox="0 0 120 114" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Calendar body */}
      <rect x="8" y="18" width="104" height="88" rx="12" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      {/* Header */}
      <rect x="8" y="18" width="104" height="28" rx="12" fill={P.accent}/>
      <rect x="8" y="34" width="104" height="12" fill={P.accent}/>
      {/* Binding rings */}
      <rect x="32" y="10" width="10" height="18" rx="5" fill={P.peach} stroke={P.border} strokeWidth="1"/>
      <rect x="78" y="10" width="10" height="18" rx="5" fill={P.peach} stroke={P.border} strokeWidth="1"/>
      {/* Month label */}
      <rect x="38" y="26" width="44" height="10" rx="5" fill={P.white} opacity="0.3"/>
      {/* Day grid cells */}
      {[0,1,2,3,4,5,6].map((col) =>
        [0,1,2,3].map((row) => {
          const x = 14 + col * 14
          const y = 54 + row * 14
          const isAccent = (col === 3 && row === 1) // highlighted day
          const isSage   = (col === 5 && row === 0)
          return (
            <rect key={`${col}-${row}`} x={x} y={y} width="10" height="10" rx="3"
              fill={isAccent ? P.accent : isSage ? P.sage : P.white}
              opacity={isAccent || isSage ? 1 : 0.8}/>
          )
        })
      )}
      {/* Small event indicators */}
      <rect x="16" y="78" width="10" height="3" rx="1.5" fill={P.yellow} opacity="0.9"/>
      <rect x="44" y="64" width="10" height="3" rx="1.5" fill={P.pink} opacity="0.9"/>
    </svg>
  )
}

/* ── Progress / Chart illustration ──────────────────────────────── */
export function IllustrationProgress({ width = 120, className = '' }) {
  const h = Math.round(width * 0.9)
  return (
    <svg width={width} height={h} viewBox="0 0 120 108" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Card backing */}
      <rect x="4" y="4" width="112" height="100" rx="14" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      {/* Donut ring */}
      <circle cx="60" cy="52" r="32" fill="none" stroke={P.border} strokeWidth="10"/>
      <circle cx="60" cy="52" r="32" fill="none" stroke={P.accent} strokeWidth="10"
        strokeDasharray="140 62" strokeLinecap="round"
        transform="rotate(-90 60 52)"/>
      <circle cx="60" cy="52" r="32" fill="none" stroke={P.sage} strokeWidth="10"
        strokeDasharray="40 162" strokeLinecap="round"
        transform="rotate(130 60 52)"/>
      {/* Center text area */}
      <circle cx="60" cy="52" r="20" fill={P.white}/>
      <rect x="46" y="47" width="28" height="6" rx="3" fill={P.border}/>
      <rect x="52" y="57" width="16" height="5" rx="2.5" fill={P.border} opacity="0.6"/>
      {/* Bar chart at bottom */}
      {[16, 28, 38, 22, 32].map((h2, i) => (
        <rect key={i}
          x={14 + i * 20} y={108 - h2} width="12" height={h2} rx="4"
          fill={[P.accent, P.peach, P.yellow, P.sage, P.pink][i]}
          opacity="0.85"/>
      ))}
      {/* Stars */}
      <text x="96" y="20" fontSize="12" fill={P.yellow} opacity="0.8">★</text>
    </svg>
  )
}

/* ── Settings / Gear illustration ───────────────────────────────── */
export function IllustrationSettings({ width = 100, className = '' }) {
  const h = width
  return (
    <svg width={width} height={h} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Background blob */}
      <ellipse cx="50" cy="54" rx="38" ry="34" fill={P.blue} opacity="0.35"/>
      {/* Main gear */}
      <circle cx="50" cy="50" r="22" fill={P.cream} stroke={P.border} strokeWidth="2"/>
      <circle cx="50" cy="50" r="10" fill={P.white} stroke={P.border} strokeWidth="1.5"/>
      {/* Gear teeth — 8 teeth */}
      {Array.from({length: 8}).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const x1 = 50 + 21 * Math.cos(a)
        const y1 = 50 + 21 * Math.sin(a)
        const x2 = 50 + 27 * Math.cos(a)
        const y2 = 50 + 27 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={P.brownMid} strokeWidth="5" strokeLinecap="round"/>
      })}
      <circle cx="50" cy="50" r="22" fill="none" stroke={P.border} strokeWidth="1.5"/>
      {/* Small decorative gear */}
      <circle cx="78" cy="26" r="10" fill={P.peach} stroke={P.border} strokeWidth="1.2"/>
      <circle cx="78" cy="26" r="5" fill={P.white} stroke={P.border} strokeWidth="1"/>
      {Array.from({length: 6}).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        const x1 = 78 + 9 * Math.cos(a)
        const y1 = 26 + 9 * Math.sin(a)
        const x2 = 78 + 12 * Math.cos(a)
        const y2 = 26 + 12 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={P.brownMid} strokeWidth="3" strokeLinecap="round"/>
      })}
      {/* Slider bars decoration */}
      <rect x="10" y="78" width="32" height="5" rx="2.5" fill={P.border}/>
      <circle cx="26" cy="80.5" r="5" fill={P.accent}/>
      <rect x="10" y="88" width="32" height="5" rx="2.5" fill={P.border}/>
      <circle cx="34" cy="90.5" r="5" fill={P.yellow}/>
    </svg>
  )
}

/* ── Bell / Notification illustration ───────────────────────────── */
export function IllustrationBell({ width = 80, className = '' }) {
  const h = Math.round(width * 1.1)
  return (
    <svg width={width} height={h} viewBox="0 0 80 88" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Bell shape */}
      <path d="M40 8 C24 8 16 20 16 36 L16 58 L8 66 L72 66 L64 58 L64 36 C64 20 56 8 40 8Z"
        fill={P.peach} stroke={P.border} strokeWidth="1.5"/>
      {/* Bell top */}
      <circle cx="40" cy="8" r="5" fill={P.cream} stroke={P.border} strokeWidth="1.2"/>
      {/* Bell clapper */}
      <ellipse cx="40" cy="74" rx="7" ry="5" fill={P.cream} stroke={P.border} strokeWidth="1.2"/>
      {/* Inner shading */}
      <path d="M30 36 C30 28 34 22 40 22 C46 22 50 28 50 36 L50 54 L30 54 Z"
        fill={P.white} opacity="0.3"/>
      {/* Notification dot */}
      <circle cx="60" cy="18" r="9" fill={P.accent}/>
      <text x="56.5" y="22" fontSize="10" fontWeight="bold" fill={P.white}>!</text>
      {/* Stars */}
      <text x="8" y="32" fontSize="9" fill={P.yellow} opacity="0.8">✦</text>
      <text x="66" y="44" fontSize="7" fill={P.sage} opacity="0.9">✦</text>
    </svg>
  )
}

/* ── Laptop illustration (Tasks page header) ─────────────────────── */
export function IllustrationLaptop({ width = 130, className = '' }) {
  const h = Math.round(width * 0.75)
  return (
    <svg width={width} height={h} viewBox="0 0 130 98" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Screen */}
      <rect x="15" y="4" width="100" height="66" rx="8" fill={P.brownMid} stroke={P.border} strokeWidth="1.5"/>
      <rect x="19" y="8" width="92" height="58" rx="6" fill={P.blue}/>
      {/* Screen content lines */}
      <rect x="30" y="20" width="40" height="7" rx="3.5" fill={P.white} opacity="0.8"/>
      <rect x="30" y="32" width="60" height="5" rx="2.5" fill={P.white} opacity="0.5"/>
      <rect x="30" y="42" width="50" height="5" rx="2.5" fill={P.white} opacity="0.4"/>
      <rect x="30" y="52" width="35" height="5" rx="2.5" fill={P.white} opacity="0.4"/>
      {/* Screen checklist items */}
      <circle cx="90" cy="36" r="6" fill={P.accent}/>
      <polyline points="87,36 89.5,38.5 93,33.5" stroke={P.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="90" cy="50" r="6" fill={P.sage}/>
      <polyline points="87,50 89.5,52.5 93,47.5" stroke={P.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Hinge */}
      <rect x="15" y="68" width="100" height="4" rx="2" fill={P.brownMid}/>
      {/* Base */}
      <path d="M4 72 L8 82 L122 82 L126 72 Z" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      <rect x="50" y="80" width="30" height="5" rx="2.5" fill={P.border}/>
      {/* Decoration */}
      <circle cx="118" cy="12" r="6" fill={P.pink} opacity="0.8"/>
      <circle cx="12" cy="72" r="4" fill={P.yellow} opacity="0.7"/>
    </svg>
  )
}

/* ── Empty tasks sticker ─────────────────────────────────────────── */
export function IllustrationEmptyTasks({ width = 140, className = '' }) {
  return (
    <svg width={width} height={width} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Clipboard */}
      <rect x="24" y="28" width="92" height="104" rx="10" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      <rect x="48" y="20" width="44" height="18" rx="9" fill={P.peach} stroke={P.border} strokeWidth="1.2"/>
      {/* Clip */}
      <rect x="56" y="24" width="28" height="8" rx="4" fill={P.border}/>
      {/* Empty lines */}
      {[60, 76, 92, 108].map((y) => (
        <g key={y}>
          <circle cx="44" cy={y} r="7" fill={P.border} opacity="0.5"/>
          <rect x="58" y={y-4} width="42" height="8" rx="4" fill={P.border} opacity="0.4"/>
        </g>
      ))}
      {/* Magnifying glass */}
      <circle cx="98" cy="60" r="14" fill={P.white} stroke={P.accent} strokeWidth="2.5"/>
      <line x1="108" y1="70" x2="116" y2="78" stroke={P.accent} strokeWidth="3" strokeLinecap="round"/>
      <line x1="90" y1="60" x2="98" y2="60" stroke={P.border} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* Stars */}
      <text x="18" y="38" fontSize="12" fill={P.yellow} opacity="0.7">★</text>
      <text x="112" y="32" fontSize="10" fill={P.pink} opacity="0.8">✦</text>
      <text x="22" y="118" fontSize="8" fill={P.sage} opacity="0.8">✦</text>
    </svg>
  )
}

/* ── Empty reminders sticker ─────────────────────────────────────── */
export function IllustrationEmptyReminders({ width = 140, className = '' }) {
  return (
    <svg width={width} height={width} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Large soft bell */}
      <ellipse cx="70" cy="80" rx="42" ry="36" fill={P.peach} opacity="0.3"/>
      <path d="M70 18 C50 18 38 34 38 52 L38 82 L26 94 L114 94 L102 82 L102 52 C102 34 90 18 70 18Z"
        fill={P.peach} stroke={P.border} strokeWidth="1.8"/>
      <path d="M54 52 C54 40 61 32 70 32 C79 32 86 40 86 52 L86 78 L54 78Z"
        fill={P.white} opacity="0.25"/>
      <circle cx="70" cy="18" r="7" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      <ellipse cx="70" cy="104" rx="11" ry="7" fill={P.cream} stroke={P.border} strokeWidth="1.5"/>
      {/* Zzz — nothing to remind */}
      <text x="86" y="54" fontSize="13" fill={P.brownMid} opacity="0.5" fontWeight="600">z</text>
      <text x="94" y="44" fontSize="10" fill={P.brownMid} opacity="0.35" fontWeight="600">z</text>
      <text x="100" y="36" fontSize="8" fill={P.brownMid} opacity="0.25" fontWeight="600">z</text>
      {/* Sparkles */}
      <text x="18" y="60" fontSize="14" fill={P.yellow} opacity="0.7">✦</text>
      <text x="110" y="80" fontSize="10" fill={P.sage} opacity="0.8">✦</text>
      <text x="26" y="108" fontSize="8" fill={P.pink} opacity="0.7">★</text>
    </svg>
  )
}

/* ── Empty progress sticker ──────────────────────────────────────── */
export function IllustrationEmptyProgress({ width = 140, className = '' }) {
  return (
    <svg width={width} height={width} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Podium */}
      <rect x="44" y="88" width="26" height="34" rx="5" fill={P.yellow} opacity="0.7"/>
      <rect x="18" y="100" width="26" height="22" rx="5" fill={P.peach} opacity="0.7"/>
      <rect x="70" y="104" width="26" height="18" rx="5" fill={P.sage} opacity="0.7"/>
      {/* Empty bar chart shadow */}
      {[92, 70, 80].map((h2, i) => (
        <rect key={i} x={22 + i * 34} y={h2} width="20" height={140 - h2 - 18} rx="4"
          fill={[P.peach, P.yellow, P.sage][i]} opacity="0.2"/>
      ))}
      {/* Trophy */}
      <path d="M56 18 C56 18 40 20 40 38 C40 50 50 56 56 58 L56 66 L48 70 L92 70 L84 66 L84 58 C90 56 100 50 100 38 C100 20 84 18 84 18 Z"
        fill={P.yellow} stroke={P.border} strokeWidth="1.5"/>
      <path d="M56 18 L56 46 C56 54 84 54 84 46 L84 18 Z"
        fill={P.white} opacity="0.2"/>
      <rect x="58" y="66" width="24" height="8" rx="4" fill={P.peach} stroke={P.border} strokeWidth="1"/>
      <ellipse cx="70" cy="78" rx="16" ry="4" fill={P.peach} stroke={P.border} strokeWidth="1"/>
      {/* Stars */}
      <text x="18" y="36" fontSize="12" fill={P.accent} opacity="0.7">★</text>
      <text x="110" y="28" fontSize="10" fill={P.pink} opacity="0.8">✦</text>
      <text x="112" y="96" fontSize="8" fill={P.blue} opacity="0.7">✦</text>
    </svg>
  )
}

/* ── Small decorative plant ──────────────────────────────────────── */
export function IllustrationPlant({ width = 60, className = '' }) {
  const h = Math.round(width * 1.2)
  return (
    <svg width={width} height={h} viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Pot */}
      <path d="M18 52 L22 68 L38 68 L42 52 Z" fill={P.peach} stroke={P.border} strokeWidth="1.2"/>
      <rect x="16" y="48" width="28" height="6" rx="3" fill={P.accentDk} opacity="0.6"/>
      {/* Soil */}
      <ellipse cx="30" cy="50" rx="12" ry="4" fill={P.brownMid} opacity="0.3"/>
      {/* Stem */}
      <line x1="30" y1="50" x2="30" y2="30" stroke={P.sage} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="30" y1="40" x2="20" y2="28" stroke={P.sage} strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="36" x2="40" y2="26" stroke={P.sage} strokeWidth="2" strokeLinecap="round"/>
      {/* Leaves */}
      <ellipse cx="14" cy="22" rx="10" ry="7" fill="#C8E0C0" transform="rotate(-30 14 22)"/>
      <ellipse cx="46" cy="20" rx="10" ry="7" fill="#C8E0C0" transform="rotate(30 46 20)"/>
      {/* Top leaf */}
      <ellipse cx="30" cy="18" rx="8" ry="12" fill={P.sage} transform="rotate(0 30 18)"/>
      <line x1="30" y1="30" x2="30" y2="10" stroke="#B0D0A8" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Small star cluster ──────────────────────────────────────────── */
export function IllustrationStars({ width = 56, className = '' }) {
  return (
    <svg width={width} height={width} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <text x="4" y="24" fontSize="18" fill={P.yellow} opacity="0.9">★</text>
      <text x="28" y="14" fontSize="12" fill={P.pink} opacity="0.7">★</text>
      <text x="38" y="34" fontSize="14" fill={P.accent} opacity="0.8">★</text>
      <text x="10" y="44" fontSize="10" fill={P.sage} opacity="0.8">✦</text>
      <text x="26" y="48" fontSize="8" fill={P.peach} opacity="0.7">✦</text>
    </svg>
  )
}
