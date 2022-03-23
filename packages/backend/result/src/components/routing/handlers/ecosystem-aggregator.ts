/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProject,
    TrainManagerRoutingPayload,
    TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import { StationExtended } from '../type';
import { transferInternal } from '../helpers/transfer-internal';
import { transferEcosystemOut } from '../helpers/transfer-ecosystem-out';
import { transferOutgoing } from '../helpers/transfer-outgoing';

type MoveOperationContext = {
    routingPayload: TrainManagerRoutingPayload,
    project: RegistryProject,
    items: StationExtended[],
};

export async function handleEcosystemAggregatorMoveOperation(context: MoveOperationContext) : Promise<void> {
    // only handle push events to self ecosystem aggregator project
    if (
        context.project.ecosystem !== Ecosystem.DEFAULT ||
        context.routingPayload.artifactTag !== REGISTRY_ARTIFACT_TAG_LATEST
    ) {
        return;
    }

    let nextIndex = -1;

    for (let i = 0; i < context.items.length; i++) {
        if (context.items[i].run_status === TrainStationRunStatus.DEPARTED) {
            continue;
        }

        if (context.items[i].ecosystem !== Ecosystem.DEFAULT) {
            continue;
        }

        nextIndex = i;
        break;
    }

    if (nextIndex === -1) {
        await transferOutgoing({
            project: context.project,
            repositoryName: context.routingPayload.repositoryName,
            artifactTag: context.routingPayload.artifactTag,
        });
    } else {
        const next = context.items[nextIndex];

        // todo: we need to create base image!!
        // todo: pull source project artifact latest -> copy to base :)

        if (next.ecosystem === Ecosystem.DEFAULT) {
            await transferInternal(
                {
                    project: context.project,
                    repositoryName: context.routingPayload.repositoryName,
                    artifactTag: context.routingPayload.artifactTag,
                },
                {
                    project: next.registry_project,
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
                    project: context.project,
                    repositoryName: context.routingPayload.repositoryName,
                },
            );
        }
    }
}
