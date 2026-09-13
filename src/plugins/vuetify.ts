import 'vuetify/dist/vuetify.css'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#7c3aed',
          secondary: '#0f172a',
          accent: '#f59e0b',
          success: '#10b981',
          background: '#f4f7fb',
        },
      },
    },
  },
})

export default vuetify
