const appleTouchIcons = [
  '57',
  '60',
  '72',
  '76',
  '114',
  '120',
  '144',
  '152',
  '180',
].map((size) => ({
  rel: 'apple-touch-icon',
  sizes: `${size}x${size}`,
  href: `/icons/apple-icon-${size}x${size}.png`,
}))
const pngIcons = ['16', '32', '96'].map((size) => ({
  rel: 'icon',
  type: 'image/png',
  href: `/icons/favicon-${size}x${size}.png`,
  sizes: `${size}x${size}`,
}))

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'calendar-of-your-life',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/icons/apple-icon.png' },
      ...appleTouchIcons,
      ...pngIcons,
      { rel: 'manifest', href: '/manifest.json' },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/sass/app.scss',
    'element-ui/lib/theme-chalk/index.css',
    'element-ui/lib/theme-chalk/reset.css',
  ],
  styleResources: { scss: ['@/assets/sass/element-variables.scss'] },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['@/plugins/element-ui'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    'nuxt-typed-vuex',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
  },
}
