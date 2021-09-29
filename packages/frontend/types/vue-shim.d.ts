/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue from 'vue'

declare module "*.vue" {
    export default Vue
}

import {Store} from "vuex";

declare module 'vue/types/vue' {
    // this.$myInjectedFunction inside Vue components
    interface Vue {
        $store: Store<any>
    }
}

declare module '@nuxt/types' {
    // nuxtContext.app.$myInjectedFunction inside asyncData, fetch, plugins, middleware, nuxtServerInit
    interface NuxtAppOptions {
        $store: Store<any>,
    }
    // nuxtContext.$myInjectedFunction
    interface Context {
        $store: Store<any>,
    }
}
