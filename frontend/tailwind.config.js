/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — CoralSwift warm coral, magenta, purple, deep navy identity
        brand: {
          DEFAULT: '#FF5500', // primary interactive color: CTAs, links, active states (Warm Coral)
          dark: '#0B0F19',    // deep midnight navy: footers, dark hero sections, strong headings
          light: '#FF7A33',   // lighter warm coral accent
          tint: '#FFEDD5',    // muted orange tint for icon backgrounds / borders
          magenta: '#E11D48', // Coral-magenta gradient middle
          purple: '#8B5CF6',  // Violet gradient end
          coral: '#FF5500',
        },
        accent: {
          cyan: '#FF7A00',        // bright warm highlight
          coral: '#FF5500',
          magenta: '#E11D48',
          purple: '#8B5CF6',
          'cyan-pale': '#FFF7ED', // pale coral tint for chip/badge backgrounds
          red: '#EF4444',         // required-field asterisk / error emphasis
        },
        warning: '#FD5521',

        // Neutral surface scale — light mode is the spec-compliant default
        surface: {
          DEFAULT: '#F8FAFC',
          dim: '#EEF2F6',
          bright: '#FFFFFF',
          low: '#FFFFFF',
          container: '#EEF2F6',
          high: '#E2E8F0',
          highest: '#CBD5E1',
          white: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#0B0F19',   // on-surface (body text)
          muted: '#334155',     // on-surface-variant (secondary text)
          inverse: '#F8FAFC',   // text on dark accent sections
        },
        outline: {
          DEFAULT: '#FFC7A8',
          variant: '#FFE3D1',
        },
        dark: {
          surface: { DEFAULT: '#0B0F19', dim: '#05070D', bright: '#0B0F19', low: '#111827', container: '#111827', high: '#1F2937', highest: '#374151', white: '#111827' },
          ink: { DEFAULT: '#F8FAFC', muted: '#CBD5E1', inverse: '#0B0F19' },
          outline: { DEFAULT: '#FF5500', variant: '#1F2937' },
          brand: { DEFAULT: '#FF5500', dark: '#0B0F19', light: '#FF7A33', tint: '#FFEDD5' },
        },
        status: {
          success: { DEFAULT: '#16A34A', bg: '#dcfce7', text: '#166534' },
          warning: { DEFAULT: '#F59E0B', bg: '#fef3c7', text: '#92400e' },
          error: { DEFAULT: '#DC2626', bg: '#fee2e2', text: '#991b1b' },
          danger: { DEFAULT: '#DC2626', bg: '#fee2e2', text: '#991b1b' },
          info: { DEFAULT: '#0EA5E9', bg: '#dbeafe', text: '#1e40af' },
          neutral: { bg: '#f3f4f6', text: '#4b5563' },
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        stat: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        'label-caps': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-xs': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'stat-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'code-snippet': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'display-md': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md-mobile': ['22px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        base: '8px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'stack-xl': '48px',
        gutter: '24px',

        'section-padding': '80px',
      },
      maxWidth: {
        container: '1440px',
      },
      boxShadow: {
        card: '0px 4px 20px rgba(10, 37, 64, 0.05)',
        'card-hover': '0px 12px 32px rgba(10, 37, 64, 0.1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
