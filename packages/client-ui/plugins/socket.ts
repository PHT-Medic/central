/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SocketManager } from '@personalhealthtrain/client-vue';
import type { Pinia } from 'pinia';
import { ref } from 'vue';
import { useRuntimeConfig } from '#imports';
import { useAuthStore } from '../store/auth';

declare module '#app' {
    interface NuxtApp {
        $socket: SocketManager;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: SocketManager;
    }
}

export default defineNuxtPlugin((ctx) => {
    const runtimeConfig = useRuntimeConfig();
    const url = runtimeConfig.public.realtimeUrl ??
        'http://localhost:3001/';

    let transports : string[] = [];

    const rawTransports = runtimeConfig.public.realtimeTransports;

    if (
        rawTransports &&
        typeof rawTransports === 'string'
    ) {
        transports = rawTransports
            .split(',')
            .filter((e) => e);
    }

    if (transports.length === 0) {
        transports = ['websocket', 'polling'];
    }

    const adapter = new SocketManager({
        url,
        options: {
            transports,
        },
        store: useAuthStore(ctx.$pinia as Pinia),
    });

    ctx.provide('socket', adapter);
});
