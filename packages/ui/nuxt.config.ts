/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            apiUrl: process.env.API_URL,
            authupApiUrl: process.env.AUTHUP_API_URL,
            realtimeUrl: process.env.REALTIME_URL,
            realtimeTransports: process.env.REALTIME_TRANSPORTS,
        },
    },
    telemetry: false,
    ssr: true,
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
        './plugins/layout',
        './plugins/socket',

    ],
    /*
    ** Nuxt.js modules
    */
    modules: [
        [
            '@nuxtjs/google-fonts', {
                families: {
                    Asap: true,
                    Nunito: true,
                },
                download: true,
            },
        ],
        '@pinia/nuxt',
        '@bootstrap-vue-next/nuxt',
    ],
});
