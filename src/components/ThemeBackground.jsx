/**
 * ThemeBackground
 *
 * Renders large, heavily-blurred ambient blobs fixed behind all content.
 * Visual style matches reference image 4 — soft, low-contrast, organic blobs
 * hugging corners and edges, clean center, no hard edges, no patterns.
 *
 * Blobs are pure CSS divs with radial-gradient fills and filter:blur.
 * Colors are hardcoded per theme so they work reliably (CSS vars don't
 * compose well inside filter:blur on all browsers).
 *
 * Reads themeId from ThemeContext and swaps blob configs automatically
 * when the user switches themes.
 */

import { useTheme } from '../context/ThemeContext'

/* ── Blob configs per theme ──────────────────────────────────────────
   Each blob: { x, y, w, h, color, opacity }
   x/y: position as CSS strings (can be negative to sit off-edge)
   w/h: size in px
   color: radial-gradient center color (edge is always transparent)
   opacity: overall blob opacity — keep very low (0.30–0.55)
────────────────────────────────────────────────────────────────────── */
const BLOBS = {
  // Daylight — soft periwinkle/blue/lavender, reference-accurate
  daylight: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#C7D7F5', opacity: 0.45 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#D5CCF5', opacity: 0.38 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#E8C9F0', opacity: 0.30 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#C5D8F8', opacity: 0.35 },
  ],

  // Midnight — deep navy/violet/indigo glow
  midnight: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#2A1B6E', opacity: 0.55 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#1A2A5E', opacity: 0.50 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#3D1870', opacity: 0.42 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#162050', opacity: 0.45 },
  ],

  // Plum Night (blushBloom) — soft blush/rose/mauve
  plumNight: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#F2AABB', opacity: 0.38 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#D88FAA', opacity: 0.32 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#EEB8D0', opacity: 0.28 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#C878A0', opacity: 0.30 },
  ],

  // Midnight Blue (sageBreeze) — sage/muted teal/soft warm cream
  midnightBlue: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#A8C4A8', opacity: 0.38 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#B8D4C0', opacity: 0.32 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#C8D8B8', opacity: 0.28 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#A0B8A8', opacity: 0.30 },
  ],

  // Ocean — soft aqua/cyan/sky
  ocean: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#7DD8E8', opacity: 0.35 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#A8E0F0', opacity: 0.30 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#60C8E0', opacity: 0.28 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#90D8F0', opacity: 0.32 },
  ],

  // Sunset — warm peach/apricot/amber
  sunset: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#F8C090', opacity: 0.40 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#F0A878', opacity: 0.35 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#F8D0A0', opacity: 0.30 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#ECA870', opacity: 0.32 },
  ],

  // Dark — deep charcoal/purple
  dark: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#3A1060', opacity: 0.50 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#200840', opacity: 0.45 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#4A1878', opacity: 0.40 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#180630', opacity: 0.42 },
  ],

  // Light — neutral soft blue/lilac (same feel as reference image 4)
  light: [
    { x: '-8%',  y: '-6%',  w: 600, h: 500, color: '#C8D8F8', opacity: 0.40 },
    { x: '55%',  y: '-4%',  w: 520, h: 440, color: '#D8CCF8', opacity: 0.35 },
    { x: '-5%',  y: '55%',  w: 480, h: 460, color: '#F0C8F0', opacity: 0.28 },
    { x: '60%',  y: '60%',  w: 560, h: 480, color: '#C8D8F8', opacity: 0.32 },
  ],
}

// Fallback to 'daylight' blob set if themeId isn't mapped
function getBlobsForTheme(themeId) {
  return BLOBS[themeId] ?? BLOBS.daylight
}

export default function ThemeBackground() {
  const { themeId } = useTheme()
  const blobs = getBlobsForTheme(themeId)

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {blobs.map((blob, i) => (
        <div
          key={`${themeId}-${i}`}
          style={{
            position: 'absolute',
            left: blob.x,
            top: blob.y,
            width: blob.w,
            height: blob.h,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${blob.color} 0%, transparent 70%)`,
            opacity: blob.opacity,
            filter: 'blur(80px)',
            // Smooth color transition when switching themes
            transition: 'opacity 0.8s ease, background 0.8s ease',
            willChange: 'opacity',
          }}
        />
      ))}
    </div>
  )
}
