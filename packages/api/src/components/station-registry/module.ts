/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { StationRegistryComponentCommand } from './consants';
import { syncStationRegistry } from './handlers';
import type { StationRegistryExecuteContext } from './type';

export async function executeStationRegistryCommand(context: StationRegistryExecuteContext) {
    switch (context.command) {
        case StationRegistryComponentCommand.SYNC: {
            await syncStationRegistry();
            break;
        }
    }
}
