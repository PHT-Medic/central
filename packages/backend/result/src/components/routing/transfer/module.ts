/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem } from '@personalhealthtrain/central-common';
import { TransferContext } from './type';
import { transferEcosystemOut } from './ecosystem';
import { transferInternal } from './internal';
import { transferInterRegistry } from './registry';

export async function transfer(context: TransferContext) {
    if (context.source.project.ecosystem === context.destination.project.ecosystem) {
        if (context.source.project.registry_id === context.destination.project.registry_id) {
            await transferInternal({
                ...context,
                registry: context.sourceRegistry || context.destinationRegistry,
            });
        } else {
            await transferInterRegistry(context);
        }
    } else {
        if (
            context.source.project.ecosystem !== Ecosystem.DEFAULT ||
            context.destination.project.ecosystem === Ecosystem.DEFAULT
        ) {
            // don't process this! This request is garbage.
            return;
        }

        await transferEcosystemOut(context.source, context.destination);
    }
}
