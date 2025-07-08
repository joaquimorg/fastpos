import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { md3 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,
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
          primary: '#7ecdf5',
          secondary: '#FFC107',
          background: '#C5C5C5',
          surface: '#FFFFFF',
          error: '#B00020',
          success: '#4CAF50',
          info: '#2196F3',
          warning: '#FB8C00'
        },
      },
    },
  },
})
