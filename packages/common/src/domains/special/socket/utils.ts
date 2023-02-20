/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketClientToServerEventContext } from './type';

export function extendSocketClientToServerEventContext<T>(context?: SocketClientToServerEventContext<T>) {
    context ??= {};
    context.data ??= {};
    context.meta ??= {};

    return context;
}

export function extendSocketClientToServerEventCallback(
    cb: (error?: Error) => void,
) : (error?: Error) => void {
    if (
        typeof cb !== 'function' ||
        cb.length !== 1
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cb = (error?) => {};
    }

    return cb;
}
