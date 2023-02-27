/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { StationRegistryCommand } from './consants';
import { syncStationRegistry } from './handlers';
import type { StationRegistryCommandContext } from './type';

export async function executeStationRegistryCommand(context: StationRegistryCommandContext) {
    switch (context.command) {
        case StationRegistryCommand.SYNC: {
            await syncStationRegistry();
            break;
        }
    }
}
