/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useClient } from 'redis-extension';
import { Emitter } from '@socket.io/redis-emitter';
import { SocketServerToClientEvents } from '@personalhealthtrain/ui-common';

let instance : undefined | Emitter<SocketServerToClientEvents>;

export function useSocketEmitter() : Emitter<SocketServerToClientEvents> {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = new Emitter<SocketServerToClientEvents>(useClient('default'));

    return instance;
}
