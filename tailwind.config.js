/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'profesional-sm': {
          primary: '#534AB7',
          light: '#EEEDFE',
        },
        'administrativo': {
          primary: '#0F6E56',
          light: '#E1F5EE',
        },
        'medico-aps': {
          primary: '#7C3AAB',
          light: '#F3E8FF',
        },
        'urgente': '#E24B4A',
        'urgente-bg': '#FCEBEB',
        'prioritario': '#EF9F27',
        'prioritario-bg': '#FAEEDA',
        'programado': '#1D9E75',
        'programado-bg': '#E1F5EE',
        'protocolo': '#993C1D',
        'protocolo-bg': '#FAECE7',
        'text-primary': '#2C2C2A',
        'text-secondary': '#888780',
        'page-bg': '#F1EFE8',
        'surface': '#FFFFFF',
        'border': '#D3D1C7',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
