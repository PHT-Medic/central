export default {
    env: {
        authApiUrl: process.env.authApiUrl,
        resourceApiUrl: process.env.resourceApiUrl
    },
    mode: 'spa',
    /*
    ** Headers of the page
    */
    head: {
        title: process.env.npm_package_name || '',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },
    /*
    ** Customize the progress-bar color
    */
    loading: { color: '#fff' },
    /*
    ** Global CSS
    */
    css: [
        '@fortawesome/fontawesome-free/css/all.css',
        'bootstrap/dist/css/bootstrap.min.css',
        'bootstrap-vue/dist/bootstrap-vue.css',
        '@/assets/css/root.css',
        '@/assets/css/core/header.css',
        '@/assets/css/core/navbar.css',
        '@/assets/css/core/body.css',
        '@/assets/css/core/sidebar.css',
        '@/assets/css/core/footer.css',
        '@/assets/css/card.css',

        '@/assets/css/form.css',

        '@/assets/css/bootstrap-override.css'
    ],
    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        '@/plugins/app',
        '@/plugins/vuelidate',
        '@/plugins/vueScroll.js',
        '@/plugins/vueFormWizard.js',
        '@/plugins/socket.client.js',
        '@/plugins/caslAbility.js',
        '@/plugins/casl.js',
    ],
    /*
    ** Nuxt.js dev-modules
    */
    buildModules: [
        // Doc: https://github.com/nuxt-community/eslint-module
        //'@nuxtjs/eslint-module'
    ],
    /*
    ** Nuxt.js modules
    */
    modules: [
        // Doc: https://bootstrap-vue.js.org
        'bootstrap-vue/nuxt',
        // Doc: https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv'
    ],

    router: {
        base: '/',
        middleware: ['auth', 'layout']
    },
    /*
    ** Build configuration
    */
    build: {
        /*
        ** You can extend webpack config here
        */
        extend (config, ctx) {
            config.module.rules.push(
                {
                    test: /\.(png|jpe?g|gif|svg|webp)$/,
                    loader: 'url-loader',
                    query: {
                        limit: 1000, // 1kB
                        name: 'img/[name].[hash:7].[ext]'
                    }
                }
            )
        }
    }
}
