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

export async function processMessage(message: Message) {
    const data = message.data as TrainManagerRoutingPayload;

    const client = useClient<HTTPClient>();
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

    let sourceProjectName : string | undefined;
    let destinationProjectName: string | undefined;

    if (data.projectName === REGISTRY_INCOMING_PROJECT_NAME) {
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

    useLogger().debug('Move image', {
        component: 'routing',
        projectFrom: sourceProjectName,
        projectTo: destinationProjectName,
    });

    const harborClient = useClient<HarborAPI>('harbor');
    await harborClient.projectArtifact.copy(
        destinationProjectName,
        data.repositoryName,
        `${sourceProjectName}/${data.repositoryName}:latest`,
    );

    if (destinationProjectName !== REGISTRY_OUTGOING_PROJECT_NAME) {
        await harborClient.projectArtifact.copy(
            destinationProjectName,
            data.repositoryName,
            `${sourceProjectName}/${data.repositoryName}:base`,
        );
    }

    await harborClient.projectRepository.delete(sourceProjectName, data.repositoryName);

    return message;
}
