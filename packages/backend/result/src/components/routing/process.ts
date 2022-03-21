/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput } from '@trapi/query';
import { Message } from 'amqp-extension';
import {
    HTTPClient,
    HarborAPI,
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    TrainManagerRoutingPayload,
    TrainStation,
    buildRegistryStationProjectName, getRegistryStationProjectNameId, isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { mergeStationsWithTrainStations } from './helpers/merge';
import { useLogger } from '../../modules/log';

export async function processRouteCommand(message: Message) {
    const data = message.data as TrainManagerRoutingPayload;

    const client = useClient<HTTPClient>();
    const harborClient = useClient<HarborAPI>('harbor');

    // -------------------------------------------------------------------

    const query : BuildInput<TrainStation> = {
        filter: {
            train_id: data.repositoryName,
        },
        sort: {
            index: 'ASC',
        },
    };

    const { data: trainStations } = await client.trainStation.getMany(query);
    if (trainStations.length === 0) {
        useLogger().debug('Route empty', {
            component: 'routing',
        });
        return message;
    }

    const { data: stations } = await client.station.getMany({
        filter: {
            id: trainStations.map((trainStation) => trainStation.station_id),
        },
        fields: ['+secure_id'],
    });

    const stationsExtended = mergeStationsWithTrainStations(stations, trainStations);

    // -------------------------------------------------------------------

    let sourceProjectName : string | undefined;
    let destinationProjectName: string | undefined;

    if (
        data.projectName === REGISTRY_INCOMING_PROJECT_NAME &&
        data.operator === REGISTRY_SYSTEM_USER_NAME
    ) {
        // move to station repo with index 0.
        const index = stationsExtended.findIndex((station) => station.index === 0);
        if (index === -1) {
            useLogger().debug('Route has no first project index', {
                component: 'routing',
            });
            return message;
        }

        sourceProjectName = REGISTRY_INCOMING_PROJECT_NAME;
        destinationProjectName = buildRegistryStationProjectName(stationsExtended[index].secure_id);
    }

    if (
        isRegistryStationProjectName(data.projectName) &&
        data.operator !== REGISTRY_SYSTEM_USER_NAME
    ) {
        const secureId = getRegistryStationProjectNameId(data.projectName);

        const index = stationsExtended.findIndex((station) => station.secure_id === secureId);
        if (index === -1) {
            return message;
        }

        const currentStation = stationsExtended[index];

        sourceProjectName = data.projectName;

        const nextStationIndex = stationsExtended.findIndex((station) => station.index === currentStation.index + 1);
        if (nextStationIndex === -1) {
            // move to outgoing
            destinationProjectName = REGISTRY_OUTGOING_PROJECT_NAME;
        } else {
            // move to next station
            destinationProjectName = buildRegistryStationProjectName(stationsExtended[nextStationIndex].secure_id);
        }
    }

    if (
        !sourceProjectName ||
        !destinationProjectName
    ) {
        return message;
    }

    if (
        data.artifactTag === REGISTRY_ARTIFACT_TAG_BASE &&
        destinationProjectName === REGISTRY_OUTGOING_PROJECT_NAME
    ) {
        return message;
    }

    // -------------------------------------------------------------------

    useLogger().debug('Move image', {
        component: 'routing',
        projectFrom: sourceProjectName,
        projectTo: destinationProjectName,
        artifactTag: data.artifactTag,
    });

    await harborClient.projectArtifact.copy(
        destinationProjectName,
        data.repositoryName,
        `${sourceProjectName}/${data.repositoryName}:${data.artifactTag}`,
    );

    try {
        await harborClient.projectArtifact
            .delete(sourceProjectName, data.repositoryName, data.artifactTag);
    } catch (e) {
        // ...
    }

    // -------------------------------------------------------------------

    const isSourceStationProject = isRegistryStationProjectName(sourceProjectName);
    const isDestinationStationProject = isRegistryStationProjectName(destinationProjectName);

    if (
        isSourceStationProject &&
        isDestinationStationProject &&
        data.artifactTag === REGISTRY_ARTIFACT_TAG_LATEST
    ) {
        // station does not push 'base' tag on completion
        await harborClient.projectArtifact.copy(
            destinationProjectName,
            data.repositoryName,
            `${sourceProjectName}/${data.repositoryName}:${REGISTRY_ARTIFACT_TAG_BASE}`,
        );

        try {
            await harborClient.projectArtifact
                .delete(sourceProjectName, data.repositoryName, REGISTRY_ARTIFACT_TAG_BASE);
        } catch (e) {
            // ...
        }
    }

    // -------------------------------------------------------------------

    // latest is always last push, so only remove project than ;)
    if (data.artifactTag === REGISTRY_ARTIFACT_TAG_LATEST) {
        try {
            await harborClient.projectRepository
                .delete(sourceProjectName, data.repositoryName);
        } catch (e) {
            // ...
        }
    }

    return message;
}
