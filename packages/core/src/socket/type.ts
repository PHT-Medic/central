/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DomainEventBaseContext,
    DomainEventContext,
    DomainEventFullName, DomainEventSubscriptionFullName,
    DomainSubType,
    DomainType,
} from '../domains';

export type SocketServerToClientEventContext<T extends DomainEventBaseContext> = T & {
    meta: {
        roomName?: string,
        roomId?: string | number
    }
};

export type SocketServerToClientEvents = {
    [K in `${DomainType}` | `${DomainSubType}` as DomainEventFullName<K>]: (
        data: SocketServerToClientEventContext<DomainEventContext<K>>
    ) => void
};
// ------------------------------------------------------------------------------------

export type SocketClientToServerEventTarget = string | number | undefined;
export type SocketClientToServerEventCallback = () => void;
export type SocketClientToServerEventErrorCallback = (error?: Error) => void;

export type SocketClientToServerEvents = {
    [K in DomainEventSubscriptionFullName<`${DomainType}` | `${DomainSubType}`>]: (
        target?: SocketClientToServerEventTarget,
        cb?: SocketClientToServerEventCallback | SocketClientToServerEventErrorCallback
    ) => void
};

// -----------------------------------
