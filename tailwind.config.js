/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        souply: {
          // Mirrors basket-app/constants/theme.ts:palette so the web identity
          // stays in lockstep with the mobile app — same swatches, same names.
          cream: '#FBF3E6',
          blush: '#F8D4DE',
          beet: '#EB6784',
          beetMuted: '#FDE7ED',
          beetDeep: '#D44B6C',
          ink: '#1F1B1D',
          slate: '#5B5358',
          mist: '#F3F4F6',
          border: '#E6DEDD',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter Tight"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Multi-layer shadow that gives the white band that "carved out of
        // the screen" 3D feel without using filters (which kill perf on
        // animated panels).
        band: '0 1px 0 rgba(255,255,255,.7) inset, 0 30px 60px -20px rgba(31,27,29,.35), 0 14px 28px -12px rgba(31,27,29,.25), 0 4px 10px -4px rgba(31,27,29,.18)',
        card: '0 1px 0 rgba(255,255,255,.6) inset, 0 12px 30px -16px rgba(31,27,29,.22), 0 4px 12px -6px rgba(31,27,29,.14)',
        pop: '0 18px 40px -16px rgba(31,27,29,.28)',
      },
      borderRadius: {
        '4xl': '32px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
