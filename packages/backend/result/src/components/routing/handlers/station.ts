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
import { StationExtended } from '../type';
import { transferInternal } from '../transfer/internal';
import { transferEcosystemOut } from '../transfer/ecosystem';
import { transferOutgoing } from '../transfer/outgoing';

type MoveOperationContext = {
    routingPayload: TrainManagerRoutingPayload,
    project: RegistryProject,
    items: StationExtended[],
};
export async function handleStationMoveOperation(context: MoveOperationContext) : Promise<void> {
    const index = context.items.findIndex((station) => station.registry_project_id === context.project.id);
    if (index === -1) {
        // todo: throw error, for no project related station found...
        return;
    }

    const currentStation = context.items[index];

    if (currentStation.registry_project.account_name !== context.routingPayload.operator) {
        return;
    }

    const nextIndex = context.items.findIndex((station) => station.index === currentStation.index + 1);
    if (nextIndex === -1) {
        await transferOutgoing({
            project: currentStation.registry_project,
            repositoryName: context.routingPayload.repositoryName,
            artifactTag: context.routingPayload.artifactTag,
        });
    } else {
        const nextStation = context.items[nextIndex];

        if (nextStation.ecosystem === Ecosystem.DEFAULT) {
            await transferInternal({
                source: {
                    project: currentStation.registry_project,
                    repositoryName: context.routingPayload.repositoryName,
                    artifactTag: context.routingPayload.artifactTag,
                },
                destination: {
                    project: nextStation.registry_project,
                    repositoryName: context.routingPayload.repositoryName,
                },
            });
        } else {
            await transferEcosystemOut(
                {
                    project: currentStation.registry_project,
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
}
