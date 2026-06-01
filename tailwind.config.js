/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Disable Tailwind's built-in `dark:` variant — we don't use the
  // OS-only `prefers-color-scheme` swap because we expose a manual
  // override via the in-app theme toggle. Theming flows entirely
  // through CSS variables under [data-theme="dark"] declared in
  // index.css; Tailwind classes never need to know which mode is on.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Brand palette — same in every theme ────────────────
        // These are the brand colours from basket-app/constants/theme.ts
        // `palette`. Page background uses `souply-beet` directly and
        // never flips, so brand identity stays loud across themes.
        souply: {
          beet:     '#EB6784',
          beetDeep: '#D44B6C',
          blush:    '#F8D4DE',
          cream:    '#FBF3E6',
        },

        // ─── Semantic tokens — theme-aware via CSS vars ─────────
        // Each token is `rgb(var(--…) / <alpha-value>)` so you can
        // still write `bg-surface/70` and Tailwind expands it
        // properly. The CSS vars live in index.css under `:root`
        // (light) and `[data-theme="dark"]` (dark).
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted:   'rgb(var(--surface-muted) / <alpha-value>)',
          subtle:  'rgb(var(--surface-subtle) / <alpha-value>)',
          inset:   'rgb(var(--surface-inset) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft:    'rgb(var(--ink-soft) / <alpha-value>)',
          faint:   'rgb(var(--ink-faint) / <alpha-value>)',
        },
        edge: {
          DEFAULT: 'rgb(var(--edge) / <alpha-value>)',
          subtle:  'rgb(var(--edge-subtle) / <alpha-value>)',
        },
        beetTint: {
          DEFAULT: 'rgb(var(--beet-tint) / <alpha-value>)',
          strong:  'rgb(var(--beet-strong) / <alpha-value>)',
        },
        accent: {
          // softAccent + softAccentWash from the mobile theme — used
          // for highlighting the expanded category in the browser.
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          wash:    'rgb(var(--accent-wash) / <alpha-value>)',
        },
        // "Create" wash — used on the Kurti šabloną card AND as the
        // animated target colour for the page when the create flow
        // opens, so the card visually "paints" the page on expansion.
        createWash: 'rgb(var(--create-wash) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter Tight"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        band: '0 1px 0 rgba(255,255,255,.7) inset, 0 30px 60px -20px rgba(31,27,29,.35), 0 14px 28px -12px rgba(31,27,29,.25), 0 4px 10px -4px rgba(31,27,29,.18)',
        card: '0 1px 0 rgba(255,255,255,.6) inset, 0 12px 30px -16px rgba(31,27,29,.22), 0 4px 12px -6px rgba(31,27,29,.14)',
        // `tile` = the dashboard-card elevation. Heftier, more layered
        // than `card` (a contact shadow + mid + wide ambient) so the
        // grid reads as floating tiles. Kept separate from `card` so the
        // many small surfaces using `card` (pills, avatars) don't get
        // over-shadowed.
        tile: '0 1px 0 rgba(255,255,255,.6) inset, 0 22px 48px -24px rgba(31,27,29,.32), 0 10px 22px -12px rgba(31,27,29,.20), 0 2px 6px -3px rgba(31,27,29,.13)',
        pop:  '0 22px 48px -16px rgba(31,27,29,.30), 0 10px 22px -10px rgba(31,27,29,.20)',
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
