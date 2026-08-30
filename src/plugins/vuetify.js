import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  blueprint: md3,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'modernFastPOS',
    themes: {
      modernFastPOS: {
        dark: false,
        colors: {
          primary: '#087E9C',
          secondary: '#112D38',
          accent: '#D9EF56',
          background: '#F4F6F3',
          surface: '#FFFFFF',
          error: '#BD3B43',
          success: '#207A55',
          info: '#087E9C',
          warning: '#A66405'
        },
      },
    },
  },
})
