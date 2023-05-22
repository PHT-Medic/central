/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SocketModule } from '../core';

declare module '#app' {
    interface NuxtApp {
        $socket: SocketModule;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $socket: SocketModule;
    }
}

export default defineNuxtPlugin((ctx) => {
    const url = ctx.$config.public.realtimeUrl ??
        'http://localhost:3001/';

    let transports : string[] = [];

    const rawTransports = ctx.$config.public.realtimeTransports;

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

    const adapter = new SocketModule({
        url,
        options: {
            transports,
        },
    });

    ctx.provide('socket', adapter);
});
