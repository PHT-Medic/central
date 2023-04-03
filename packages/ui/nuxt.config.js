/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('node:path');

const config = {
    publicRuntimeConfig() {
        return {
            apiUrl: process.env.API_URL,
            authupApiUrl: process.env.AUTHUP_API_URL,
            realtimeUrl: process.env.REALTIME_URL,
            realtimeTransports: process.env.REALTIME_TRANSPORTS,
        };
    },
    env: {
        apiUrl: process.env.API_URL,
        authupApiUrl: process.env.AUTHUP_API_URL,
        realtimeUrl: process.env.REALTIME_URL,
        realtimeTransports: process.env.REALTIME_TRANSPORTS,
    },
    telemetry: false,
    ssr: true,
    /*
    ** Headers of the page
    */
    head: {
        title: 'PHT - User Interface (UI)',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
        ],
        link: [
            // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
            { rel: 'icon', type: 'image/x-icon', href: '/fav.png' },
        ],
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
        './assets/css/vue-layout-navigation.css',
        './assets/css/root.css',
        './assets/css/domain.css',
        './assets/css/core/header.css',
        './assets/css/core/navbar.css',
        './assets/css/core/body.css',
        './assets/css/core/sidebar.css',
        './assets/css/core/footer.css',
        './assets/css/card.css',
        './assets/css/colors.css',
        './assets/css/form.css',

        './assets/css/bootstrap-override.css',
    ],
    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        './plugins/ilingo',
        './plugins/api',
        './plugins/store',
        './plugins/auth',
        './plugins/layout',
        './plugins/socket',
        './plugins/vuelidate',
        './plugins/vueFormWizard',
        './plugins/vueTimeAgo',
        './plugins/vue',

    ],
    /*
    ** Nuxt.js dev-modules
    */
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/google-fonts',
    ],
    googleFonts: {
        families: {
            Asap: true,
            Nunito: true,
        },
    },
    bootstrapVue: {
        icons: false,
    },
    /*
    ** Nuxt.js modules
    */
    modules: [
        // Doc: https://bootstrap-vue.js.org
        'bootstrap-vue/nuxt',
        // Doc: https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv',
    ],

    router: {
        // base: '/',
        middleware: ['auth', 'layout'],
    },

    build: {
        extend(config) {
            if (!config.resolve) {
                config.resolve = {};
            }

            if (!config.resolve.alias) {
                config.resolve.alias = {};
            }

            if (!config.resolve.plugins) {
                config.resolve.plugins = [];
            }

            config.resolve.plugins.push(new TsconfigPathsPlugin({ configFile: './tsconfig.json' }));

            if (Object.prototype.hasOwnProperty.call(config.resolve.alias, '~')) {
                delete config.resolve.alias['~'];
            }

            if (Object.prototype.hasOwnProperty.call(config.resolve.alias, '@')) {
                delete config.resolve.alias['@'];
            }

            config.resolve.alias.axios = path.join(__dirname, '..', '..', 'node_modules', 'axios', 'dist', 'browser', 'axios.cjs');
            config.resolve.alias.hapic = path.join(__dirname, '..', '..', 'node_modules', 'hapic', 'dist', 'index.cjs');
            config.resolve.alias['@hapic/oauth2'] = path.join(__dirname, '..', '..', 'node_modules', '@hapic', 'oauth2', 'dist', 'index.cjs');
            config.resolve.alias['@authup/core'] = path.join(__dirname, '..', '..', 'node_modules', '@authup', 'core', 'dist', 'index.cjs');
            config.resolve.alias['@authup/vue2'] = path.join(__dirname, '..', '..', 'node_modules', '@authup', 'vue2', 'dist', 'index.cjs');

            config.module.rules.push({
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
            });
        },
    },
};

module.exports = config;
