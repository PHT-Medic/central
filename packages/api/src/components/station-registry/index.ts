/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { StationRegistryQueueCommand } from '../../domains/special/station-registry/consants';
import { syncStationRegistry } from './handlers/sync';

export async function executeStationRegistryCommand(
    command: string,
    _payload: Record<string, any>,
) {
    switch (command) {
        case StationRegistryQueueCommand.SYNC: {
            await syncStationRegistry();
            break;
        }
    }
}
