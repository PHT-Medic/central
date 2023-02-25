/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RouterEventContext } from '@personalhealthtrain/train-manager';
import {
    RouterCommand,
} from '@personalhealthtrain/train-manager';
import { handleTrainManagerRouterRouteEvent } from './route';
import { handleTrainManagerRouterStartEvent } from './start';

export async function handleTrainManagerRouterEvent(context: RouterEventContext) {
    switch (context.command) {
        case RouterCommand.CHECK: {
            // ...
            break;
        }
        case RouterCommand.ROUTE: {
            await handleTrainManagerRouterRouteEvent(context);
            break;
        }
        case RouterCommand.START: {
            await handleTrainManagerRouterStartEvent(context);
            break;
        }
    }
}
