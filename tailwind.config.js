/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wa: {
          green: {
            DEFAULT: '#00a884',
            dark: '#008069',
            light: '#25D366',
            hover: '#019474',
            badge: '#25D366'
          },
          teal: '#128c7e',
          bg: {
            light: '#efeae2',
            dark: '#0c1317',
            panel: '#111b21',
            panelLight: '#ffffff',
            subtle: '#202c33',
            subtleLight: '#f0f2f5',
            inputDark: '#2a3942',
            inputLight: '#f0f2f5'
          },
          bubble: {
            outgoingLight: '#d9fdd3',
            outgoingDark: '#005c4b',
            incomingLight: '#ffffff',
            incomingDark: '#202c33',
            systemLight: '#ffffff',
            systemDark: '#182229'
          },
          border: {
            light: '#e9edef',
            dark: '#222d34'
          },
          text: {
            primaryLight: '#111b21',
            primaryDark: '#e9edef',
            secondaryLight: '#667781',
            secondaryDark: '#8696a0',
            link: '#53bdeb'
          }
        }
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Helvetica Neue',
          'Helvetica',
          'Lucida Grande',
          'Arial',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}

