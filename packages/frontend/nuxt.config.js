/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

const {TsconfigPathsPlugin} = require("tsconfig-paths-webpack-plugin");

const config = {
    publicRuntimeConfig() {
        return {
            apiUrl: process.env.API_URL || 'https://pht-ui.personalhealthtrain.de/api/',
            resultServiceApiUrl: process.env.RESULT_SERVICE_API_URL || 'https://pht-ui.personalhealthtrain.de/vapi/'
        }
    },
    env: {
        apiUrl: process.env.API_URL || 'https://pht-ui.personalhealthtrain.de/api/',
        resultServiceApiUrl: process.env.RESULT_SERVICE_API_URL || 'https://pht-ui.personalhealthtrain.de/vapi/'
    },
    telemetry: false,
    ssr: true,
    /*
    ** Headers of the page
    */
    head: {
        title: 'PHT - Personal Health Train',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
        ],
        link: [
            //{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
            { rel: 'icon', type: 'image/x-icon', href: '/fav.png' }
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
        'vue-form-wizard/dist/vue-form-wizard.min.css',
        '@fortawesome/fontawesome-free/css/all.css',
        'bootstrap/dist/css/bootstrap.min.css',
        'bootstrap-vue/dist/bootstrap-vue.css',
        '@/assets/css/vue-layout-navigation.css',
        '@/assets/css/root.css',
        '@/assets/css/core/header.css',
        '@/assets/css/core/navbar.css',
        '@/assets/css/core/body.css',
        '@/assets/css/core/sidebar.css',
        '@/assets/css/core/footer.css',
        '@/assets/css/card.css',
        '@/assets/css/colors.css',
        '@/assets/css/form.css',

        '@/assets/css/bootstrap-override.css'
    ],
    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        '@/plugins/api',
        '@/plugins/store',
        '@/plugins/auth',
        '@/plugins/app',
        '@/plugins/layout',
        '@/plugins/vuelidate',
        '@/plugins/vueScroll',
        '@/plugins/vueFormWizard',
        '@/plugins/vueTimeAgo',
        '@/plugins/socket.client',
        '@/plugins/vue'

    ],
    /*
    ** Nuxt.js dev-modules
    */
    buildModules: [
        // Doc: https://github.com/nuxt-community/eslint-module
        //'@nuxtjs/eslint-module'
        '@nuxt/typescript-build',
        '@nuxtjs/google-fonts'
    ],
    googleFonts: {
        families: {
            'Asap': true,
            'Nunito': true
        }
    },
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
        //base: '/',
        middleware: ['auth', 'layout']
    },

    build: {
        extend(config, ctx) {
            if (!config.resolve) {
                config.resolve = {};
            }

            if(!config.resolve.alias) {
                config.resolve.alias = {};
            }

            if (!config.resolve.plugins) {
                config.resolve.plugins = [];
            }

            config.resolve.plugins.push(new TsconfigPathsPlugin({configFile: "./tsconfig.json"}));

            if(config.resolve.alias.hasOwnProperty('~')) {
                delete config.resolve.alias['~'];
            }

            if(config.resolve.alias.hasOwnProperty('@')) {
                delete config.resolve.alias['@'];
            }

            config.externals = {
                ...config.externals,
                'react-native-sqlite-storage': 'react-native-sqlite-storage'
            }
        }
    }
}

module.exports = config;
