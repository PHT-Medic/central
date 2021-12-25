/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { SocketModule } from '@/config/socket';

declare module 'vue/types/vue' {
    // this.$myInjectedFunction inside Vue components
    interface Vue {
        $socket: SocketModule
    }
}

declare module '@nuxt/types' {
    // nuxtContext.$myInjectedFunction
    interface Context {
        $socket: SocketModule
    }
}

declare module 'vuex/types/index' {
    // this.$myInjectedFunction inside Vuex stores
    interface Store<S> {
        $socket: SocketModule
    }
}

export default (ctx: Context, inject: Inject) => {
    const url = ctx.$config.realtimeUrl ??
        process.env.REALTIME_URL ??
        'http://localhost:3001/';

    const adapter = new SocketModule(ctx, {
        url,
        options: {
            transports: ['websocket'],
        },
    });

    inject('socket', adapter);
};
