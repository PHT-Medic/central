/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

import BaseStorage from '~/modules/storage';
import AuthStorage from '~/modules/auth/storage';
import AppStorage from '~/modules/app/storage';
import { NavigationProvider } from '../config/layout/module';

declare module '@nuxt/types' {
    // nuxtContext.app.$myInjectedFunction inside asyncData, fetch, plugins, middleware, nuxtServerInit
    interface NuxtAppOptions {
        $warehouse: BaseStorage,
        $authWarehouse: BaseStorage
    }
    // nuxtContext.$myInjectedFunction
    interface Context {
        $warehouse: BaseStorage,
        $authWarehouse: BaseStorage
    }
}

declare module 'vuex/types/index' {
    // this.$myInjectedFunction inside Vuex stores

    interface Store<S> {
        $warehouse: BaseStorage,
        $authWarehouse: BaseStorage,
        $layoutNavigationProvider: NavigationProvider
    }
}

export default (ctx : Context, inject : Inject) => {
    const appWarehouse = new AppStorage(ctx);
    inject('warehouse', appWarehouse);

    //--------------------------------------------------------------------

    const authWarehouse = new AuthStorage(ctx);
    inject('authWarehouse', authWarehouse);

    //--------------------------------------------------------------------

    const navigationProvider = new NavigationProvider(ctx);
    inject('layoutNavigationProvider', navigationProvider);
};
