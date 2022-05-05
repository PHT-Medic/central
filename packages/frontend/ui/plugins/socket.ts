/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { SocketModule } from '../config/socket';

export default (ctx: Context, inject: Inject) => {
    const url = ctx.$config.realtimeUrl ??
        process.env.REALTIME_URL ??
        'http://localhost:3001/';

    let transports = [];

    if (
        process.env.REALTIME_TRANSPORTS &&
        typeof process.env.REALTIME_TRANSPORTS === 'string'
    ) {
        transports = process.env.REALTIME_TRANSPORTS
            .split(',')
            .filter((e) => e);
    }

    if (transports.length === 0) {
        transports = ['websocket', 'polling'];
    }

    const adapter = new SocketModule(ctx, {
        url,
        options: {
            transports,
        },
    });

    inject('socket', adapter);
};
