module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées Banque Ega
        primary: {
          50: '#f0f4ff',
          100: '#e6ecff',
          200: '#c7d9ff',
          300: '#a8c6ff',
          400: '#7fa3ff',
          500: '#1a237e', // Couleur primaire
          600: '#1520a0',
          700: '#101d7e',
          800: '#0a1560',
          900: '#050d42',
        },
        secondary: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4', // Turquoise
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        },
        accent: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff6b35', // Orange vif
          600: '#fb5607',
          700: '#e65100',
          800: '#d84315',
          900: '#bf360c',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.08)',
        md: '0 4px 12px 0 rgb(0 0 0 / 0.12)',
        lg: '0 8px 16px 0 rgb(0 0 0 / 0.15)',
        xl: '0 12px 24px 0 rgb(0 0 0 / 0.2)',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      gradientColorStops: (theme) => ({
        ...theme('colors'),
      }),
    },
  },
  plugins: [],
}
