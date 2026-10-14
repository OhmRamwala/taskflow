import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  
 light: {
  id: 'light',
  name: 'Daylight',
  description: 'Clean and modern light theme',
  preview: ['#FFFFFF', '#F6F5F9', '#7C3AED'],
  vars: {
    '--bg-base': '#F8F8FA',
    '--bg-surface': '#FFFFFF',
    '--bg-elevated': '#FFFFFF',
    '--bg-muted': '#F3F2F6',

    '--border': '#E5E3EA',
    '--border-subtle': '#EFEDF3',

    '--text-primary': '#24212B',
    '--text-secondary': '#6B6872',
    '--text-muted': '#9A97A1',

    '--accent': '#7C3AED',
    '--accent-hover': '#6D28D9',
    '--accent-light': '#F1EBFF',
    '--accent-text': '#FFFFFF',

    '--success': '#22A06B',
    '--success-light': '#EAF8F1',

    '--danger': '#DC4C4C',
    '--danger-light': '#FDECEC',

    '--warning': '#D99A24',
    '--warning-light': '#FFF6E3',

    '--info': '#6875D9',
    '--info-light': '#EEF0FF',

    '--ambient-1': '#F1EBFF',
    '--ambient-2': '#F8F5FF',
    '--ambient-3': '#F3F1F7',

    '--shadow': '0 1px 3px rgba(40,30,60,0.05)',
    '--shadow-md': '0 4px 10px rgba(40,30,60,0.07)',
    '--shadow-lg': '0 8px 24px rgba(40,30,60,0.09)',
  },
},
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Elegant dark navy and violet theme',
    preview: ['#0F1117', '#1A1D2E', '#818CF8'],
    vars: {
      '--bg-base': '#0F1117',
      '--bg-surface': '#1A1D2E',
      '--bg-elevated': '#242840',
      '--bg-muted': '#1E2235',
      '--border': '#2E3354',
      '--border-subtle': '#252945',
      '--text-primary': '#E2E8F0',
      '--text-secondary': '#94A3B8',
      '--text-muted': '#64748B',
      '--accent': '#818CF8',
      '--accent-hover': '#6366F1',
      '--accent-light': '#1E2048',
      '--accent-text': '#FFFFFF',
      '--success': '#34D399',
      '--success-light': '#064E3B',
      '--danger': '#F87171',
      '--danger-light': '#450A0A',
      '--warning': '#FBBF24',
      '--warning-light': '#451A03',
      '--info': '#60A5FA',
      '--info-light': '#1E3A5F',
      '--shadow': '0 1px 3px rgba(0,0,0,0.4)',
      '--shadow-md': '0 4px 12px rgba(0,0,0,0.4)',
      '--shadow-lg': '0 10px 30px rgba(0,0,0,0.5)',
    },
  },
  blushBloom: {
    id: 'blushBloom',
    name: 'Blush Bloom',
    description: 'Soft blush, rose and plum pastel theme',
    preview: ['#FBE4D8', '#DFB6B2', '#854F6C'],
    vars: {
      '--bg-base': '#FBE4D8',
      '--bg-surface': '#FFF8F4',
      '--bg-elevated': '#FFFFFF',
      '--bg-muted': '#F3D8D2',
      '--border': '#E8C5C2',
      '--border-subtle': '#F2DDD8',
      '--text-primary': '#3A2635',
      '--text-secondary': '#6B5363',
      '--text-muted': '#927C8C',
      '--accent': '#854F6C',
      '--accent-hover': '#75445F',
      '--accent-light': '#F3D5D8',
      '--accent-text': '#FFFFFF',
      '--success': '#A8C7A8',
      '--success-light': '#E5F0E5',
      '--danger': '#D98C9A',
      '--danger-light': '#FBE5E8',
      '--warning': '#E8B86A',
      '--warning-light': '#FFF1D6',
      '--info': '#A9C4D8',
      '--info-light': '#E5F0F7',
      '--shadow': '0 1px 3px rgba(80,40,60,0.08)',
      '--shadow-md': '0 4px 12px rgba(80,40,60,0.10)',
      '--shadow-lg': '0 10px 30px rgba(80,40,60,0.12)',
    },
  },
  oceanMist: {
    id: 'oceanMist',
    name: 'Ocean Mist',
    description: 'Fresh blue and teal theme',
    preview: ['#F0F8FF', '#FFFFFF', '#0891B2'],
    vars: {
      '--bg-base': '#F0F8FF',
      '--bg-surface': '#FFFFFF',
      '--bg-elevated': '#E0F2FE',
      '--bg-muted': '#F5FAFF',
      '--border': '#BAE6FD',
      '--border-subtle': '#E0F2FE',
      '--text-primary': '#0C1A2E',
      '--text-secondary': '#0369A1',
      '--text-muted': '#38BDF8',
      '--accent': '#0891B2',
      '--accent-hover': '#0E7490',
      '--accent-light': '#CFFAFE',
      '--accent-text': '#FFFFFF',
      '--success': '#059669',
      '--success-light': '#D1FAE5',
      '--danger': '#DC2626',
      '--danger-light': '#FEE2E2',
      '--warning': '#D97706',
      '--warning-light': '#FEF3C7',
      '--info': '#0284C7',
      '--info-light': '#E0F2FE',
      '--shadow': '0 1px 3px rgba(8,145,178,0.1)',
      '--shadow-md': '0 4px 12px rgba(8,145,178,0.12)',
      '--shadow-lg': '0 10px 30px rgba(8,145,178,0.15)',
    },
  },
sageBreeze: {
  id: 'sageBreeze',
  name: 'Sage Breeze',
  description: 'Soft sage, cream and muted blue pastel theme',
  preview: ['#F4F1DE', '#D4C4A8', '#778D7A'],
  vars: {
    '--bg-base': '#F4F1DE',
    '--bg-surface': '#FFFFFF',
    '--bg-elevated': '#FFFFFF',
    '--bg-muted': '#E8EDF0',
    '--border': '#D4D9D5',
    '--border-subtle': '#E7E9E5',
    '--text-primary': '#263342',
    '--text-secondary': '#5F6D78',
    '--text-muted': '#87929A',
    '--accent': '#778D7A',
    '--accent-hover': '#657A69',
    '--accent-light': '#E1E8E1',
    '--accent-text': '#FFFFFF',
    '--success': '#8FAF91',
    '--success-light': '#E4F0E5',
    '--danger': '#D99090',
    '--danger-light': '#FBE5E5',
    '--warning': '#DDB66E',
    '--warning-light': '#FFF1D7',
    '--info': '#8EABC2',
    '--info-light': '#E5EEF5',
    '--shadow': '0 1px 3px rgba(30,50,70,0.08)',
    '--shadow-md': '0 4px 12px rgba(30,50,70,0.10)',
    '--shadow-lg': '0 10px 30px rgba(30,50,70,0.12)',
  },
},
  sunsetPeach: {
    id: 'sunsetPeach',
    name: 'Sunset Peach',
    description: 'Warm peach and orange theme',
    preview: ['#FFF8F0', '#FFFFFF', '#EA580C'],
    vars: {
      '--bg-base': '#FFF8F0',
      '--bg-surface': '#FFFFFF',
      '--bg-elevated': '#FFF1E6',
      '--bg-muted': '#FFFAF5',
      '--border': '#FED7AA',
      '--border-subtle': '#FFEDD5',
      '--text-primary': '#1C0A00',
      '--text-secondary': '#9A3412',
      '--text-muted': '#C2773A',
      '--accent': '#EA580C',
      '--accent-hover': '#C2410C',
      '--accent-light': '#FFEDD5',
      '--accent-text': '#FFFFFF',
      '--success': '#059669',
      '--success-light': '#D1FAE5',
      '--danger': '#DC2626',
      '--danger-light': '#FEE2E2',
      '--warning': '#D97706',
      '--warning-light': '#FEF3C7',
      '--info': '#0369A1',
      '--info-light': '#DBEAFE',
      '--shadow': '0 1px 3px rgba(234,88,12,0.1)',
      '--shadow-md': '0 4px 12px rgba(234,88,12,0.12)',
      '--shadow-lg': '0 10px 30px rgba(234,88,12,0.15)',
    },
  },
 


};


const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const stored = localStorage.getItem('taskflow-theme') || 'light'
    // fall back to 'light' if stored theme no longer exists or has no vars
    return (THEMES[stored] && THEMES[stored].vars) ? stored : 'light'
  })

  const theme = (THEMES[themeId] && THEMES[themeId].vars) ? THEMES[themeId] : THEMES.light

  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    localStorage.setItem('taskflow-theme', themeId)
    // set dark class for midnight theme
    if (themeId === 'midnight') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [themeId, theme])

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
