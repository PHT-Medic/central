/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem, HTTPClient, REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProject,
    TrainManagerRoutingPayload,
    TrainStationRunStatus,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { StationExtended } from '../type';
import { transferInternal } from '../transfer/internal';
import { transferEcosystemOut } from '../transfer/ecosystem';
import { transferOutgoing } from '../transfer/outgoing';
import { buildDockerAuthConfig } from '../../../config/services/registry';
import { moveDockerImage } from '../../../modules/docker/image-move';

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

        if (next.ecosystem === Ecosystem.DEFAULT) {
            const client = useClient<HTTPClient>();
            const registry = await client.registry.getOne(context.project.registry_id, {
                fields: ['+account_secret'],
            });

            const authConfig = buildDockerAuthConfig({
                host: registry.host,
                user: registry.account_name,
                password: registry.account_secret,
            });

            // create base tag from latest ;)
            await moveDockerImage({
                sourceAuthConfig: authConfig,
                sourceRepositoryName: context.routingPayload.repositoryName,
                sourceProjectName: context.project.external_name,
                sourceTag: context.routingPayload.artifactTag,

                destinationTag: REGISTRY_ARTIFACT_TAG_BASE,
            });

            const tags = [
                REGISTRY_ARTIFACT_TAG_BASE,
                REGISTRY_ARTIFACT_TAG_LATEST,
            ];

            for (let i = 0; i < tags.length; i++) {
                await transferInternal({
                    source: {
                        project: context.project,
                        repositoryName: context.routingPayload.repositoryName,
                        artifactTag: tags[i],
                    },
                    destination: {
                        project: next.registry_project,
                        repositoryName: context.routingPayload.repositoryName,
                    },
                });
            }
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
