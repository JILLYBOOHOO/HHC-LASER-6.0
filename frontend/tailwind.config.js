/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a96e',
          50:  '#fdf9f0',
          100: '#f9f0da',
          200: '#f2dda8',
          300: '#e8c76e',
          400: '#ddb04a',
          500: '#c9a96e',  // Primary brand gold
          600: '#b8924f',
          700: '#9a7640',
          800: '#7d5f35',
          900: '#664d2c',
        },
        charcoal: {
          DEFAULT: '#1a1a1a',
          50:  '#f8f8f8',
          100: '#f0f0f0',
          200: '#e4e4e4',
          300: '#d0d0d0',
          400: '#a8a8a8',
          500: '#6e6e6e',
          600: '#4a4a4a',
          700: '#2c2c2c',
          800: '#1a1a1a',  // Primary dark
          900: '#111111',
        },
        cream: {
          DEFAULT: '#f8f5f0',
          50:  '#fdfcfa',
          100: '#faf8f5',
          200: '#f5f0eb',
          300: '#ede6dc',
          400: '#e0d4c4',
          500: '#f8f5f0',  // Primary cream/white
        }
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        accent:  ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        // Slightly larger scale for body/UI readability (still rem-based)
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],   // ~13px at 16 root, ~14.6 at 18
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],    // ~15px / ~16.9
        base: ['1.0625rem', { lineHeight: '1.75rem' }], // ~17px / ~19.1
        lg: ['1.1875rem', { lineHeight: '1.85rem' }],
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #c9a96e 0%, #ddb04a 50%, #c9a96e 100%)',
        'dark-gradient':   'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
        'luxury-hero':     'linear-gradient(160deg, #111111 0%, #1a1a1a 40%, #2c2c2c 100%)',
        'glass-light':     'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      boxShadow: {
        'gold':     '0 4px 24px rgba(201, 169, 110, 0.25)',
        'gold-lg':  '0 8px 48px rgba(201, 169, 110, 0.35)',
        'dark':     '0 4px 24px rgba(0, 0, 0, 0.4)',
        'glass':    '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card':     '0 2px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in':       'fadeIn 0.6s ease-out forwards',
        'fade-up':       'fadeUp 0.7s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'shimmer':       'shimmer 1.5s infinite',
        'pulse-gold':    'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 169, 110, 0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(201, 169, 110, 0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
