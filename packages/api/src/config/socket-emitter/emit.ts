/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SocketServerToClientEventName } from '@personalhealthtrain/central-common';
import { useSocketEmitter } from './singleton';
import { SocketServerToClientEventContext } from './type';

export function emitSocketServerToClientEvent<
    EventName extends SocketServerToClientEventName,
>(context: SocketServerToClientEventContext<EventName>) {
    const keys = Object.keys(context.item);
    for (let i = 0; i < keys.length; i++) {
        const value = context.item[keys[i]];
        if (value instanceof Date) {
            context.item[keys[i]] = value.toISOString();
        }
    }

    for (let i = 0; i < context.configuration.length; i++) {
        let emitter = useSocketEmitter();
        if (context.configuration[i].namespace) {
            emitter = emitter.of(context.configuration[i].namespace);
        }

        let roomName = context.configuration[i].roomNameFn();

        emitter
            .in(roomName)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .emit(context.operation, {
                meta: {
                    roomName,
                },
                data: context.item,
            });

        roomName = context.configuration[i].roomNameFn(context.item.id);
        emitter
            .in(roomName)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .emit(context.operation, {
                data: context.item,
                meta: {
                    roomName,
                    roomId: context.item.id,
                },
            });
    }
}
