/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#070C14',
          900: '#0B1220',
          800: '#101A2C',
          700: '#182541',
        },
        signal: {
          400: '#5FEFEC',
          500: '#3DDAD7',
          600: '#22B4B1',
        },
        coral: {
          400: '#FF8A7A',
          500: '#FF6B5D',
          600: '#E5503F',
        },
        success: '#3DDC97',
        warn: '#F5B942',
        mist: '#AEC3D6',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(61, 218, 215, 0.18)',
        card: '0 8px 30px rgba(3, 8, 16, 0.45)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at 20% 20%, rgba(61,218,215,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,107,93,0.10), transparent 35%)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(0.85)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        rise: 'rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
