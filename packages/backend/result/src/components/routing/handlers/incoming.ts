/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    RegistryProject,
    TrainManagerRoutingPayload,
} from '@personalhealthtrain/central-common';
import { useLogger } from '../../../modules/log';
import { transferInternal } from '../helpers/transfer-internal';
import { StationExtended } from '../type';
import { transferEcosystemOut } from '../helpers/transfer-ecosystem-out';

type MoveOperationContext = {
    routingPayload: TrainManagerRoutingPayload,
    project: RegistryProject,
    items: StationExtended[],
};

export async function handleIncomingMoveOperation(context: MoveOperationContext) : Promise<void> {
    // move to station repo with index 0.
    const nextIndex = context.items.findIndex((station) => station.index === 0);
    if (nextIndex === -1) {
        useLogger().debug('Route has no first project index', {
            component: 'routing',
        });

        return;
    }

    const nextStation = context.items[nextIndex];

    if (nextStation.ecosystem === Ecosystem.DEFAULT) {
        await transferInternal(
            {
                project: context.project,
                repositoryName: context.routingPayload.repositoryName,
                artifactTag: context.routingPayload.artifactTag,
            },
            {
                project: nextStation.registry_project,
                repositoryName: context.routingPayload.repositoryName,
            },
        );
    } else {
        await transferEcosystemOut(
            {
                project: context.project,
                repositoryName: context.routingPayload.repositoryName,
                artifactTag: context.routingPayload.artifactTag,
            },
            {
                project: nextStation.registry_project,
                repositoryName: context.routingPayload.repositoryName,
            },
        );
    }
}
