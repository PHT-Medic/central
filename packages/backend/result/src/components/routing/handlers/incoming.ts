/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Ecosystem, REGISTRY_ARTIFACT_TAG_BASE,
    TrainManagerRoutingQueueEvent,
} from '@personalhealthtrain/central-common';
import { publishMessage } from 'amqp-extension';
import { useLogger } from '../../../modules/log';
import { transferInternal } from '../transfer/internal';
import { transferEcosystemOut } from '../transfer/ecosystem';
import { buildAPIQueueEventMessage } from '../../../config/queue';
import { RouteContextExtended } from '../type';

export async function routeIncomingProject(context: RouteContextExtended) : Promise<void> {
    // move to station repo with index 0.
    const nextIndex = context.items.findIndex((station) => station.index === 0);
    if (nextIndex === -1) {
        useLogger().debug('Route has no first project index', {
            component: 'routing',
        });

        return;
    }

    if (context.payload.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    await publishMessage(buildAPIQueueEventMessage(
        TrainManagerRoutingQueueEvent.STARTED,
        context.payload,
    ));

    const nextStation = context.items[nextIndex];

    if (nextStation.ecosystem === Ecosystem.DEFAULT) {
        await transferInternal(
            {
                source: {
                    project: context.project,
                    repositoryName: context.payload.repositoryName,
                    artifactTag: context.payload.artifactTag,
                },
                destination: {
                    project: nextStation.registry_project,
                    repositoryName: context.payload.repositoryName,
                },
            },
        );
    } else {
        await transferEcosystemOut(
            {
                project: context.project,
                repositoryName: context.payload.repositoryName,
                artifactTag: context.payload.artifactTag,
            },
            {
                project: nextStation.registry_project,
                repositoryName: context.payload.repositoryName,
            },
        );
    }
}
