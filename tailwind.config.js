/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Deep restrained slate neutrals (light & dark mode calibrated)
        surface: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          hover: 'var(--color-card-hover)',
          border: 'var(--color-border)',
          muted: 'var(--color-muted)',
        },
        primary: {
          DEFAULT: '#2563eb', // crisp cobalt accent
          hover: '#1d4ed8',
          subtle: '#eff6ff',
          darkSubtle: '#1e293b',
        },
      },
      screens: {
        'xs': '360px',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
