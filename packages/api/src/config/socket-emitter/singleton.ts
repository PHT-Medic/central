/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Emitter } from '@socket.io/redis-emitter';
import type { SocketServerToClientEvents } from '@personalhealthtrain/central-common';
import { useClient } from 'redis-extension';

let instance : undefined | Emitter<SocketServerToClientEvents>;

export function useSocketEmitter() : Emitter<SocketServerToClientEvents> {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = new Emitter<SocketServerToClientEvents>(useClient('default'));

    return instance;
}
