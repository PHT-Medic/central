/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { StationRegistryQueueCommand } from '../../domains/special/station-registry/consants';
import { syncStationRegistry } from './handlers/sync';

export function createStationRegistryQueueComponentHandlers() : Record<StationRegistryQueueCommand, ConsumeHandler> {
    return {
        [StationRegistryQueueCommand.SYNC]: async (message: Message) => {
            await syncStationRegistry(message);
        },
    };
}
