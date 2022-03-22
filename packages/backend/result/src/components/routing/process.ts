/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput } from '@trapi/query';
import { Message } from 'amqp-extension';
import {
    Ecosystem,
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    REGISTRY_SYSTEM_USER_NAME,
    TrainManagerRoutingPayload,
    TrainStation,
    buildRegistryStationProjectName,
    getRegistryStationProjectNameId, isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { mergeStationsWithTrainStations } from './helpers/merge';
import { useLogger } from '../../modules/log';
import { transferProjectRepository } from './helpers/transfer';
import { transferProjectRepositoryToOtherEcosystem } from './helpers/transfer-external';

export async function processRouteCommand(message: Message) {
    const data = message.data as TrainManagerRoutingPayload;

    const client = useClient<HTTPClient>();

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

        await transferProjectRepository(
            { projectName: sourceProjectName, repositoryName: data.repositoryName, artifactTag: data.artifactTag },
            { projectName: destinationProjectName, repositoryName: data.repositoryName },
        );
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

        sourceProjectName = data.projectName;
        const currentStation = stationsExtended[index];

        const nextStationIndex = stationsExtended.findIndex((station) => station.index === currentStation.index + 1);
        if (nextStationIndex === -1) {
            // move to outgoing
            destinationProjectName = REGISTRY_OUTGOING_PROJECT_NAME;

            if (data.artifactTag !== REGISTRY_ARTIFACT_TAG_BASE) {
                await transferProjectRepository(
                    {
                        projectName: sourceProjectName,
                        repositoryName: data.repositoryName,
                        artifactTag: data.artifactTag,
                    },
                    { projectName: destinationProjectName, repositoryName: data.repositoryName },
                );
            }
        } else {
            const nextStation = stationsExtended[nextStationIndex];

            if (nextStation.ecosystem === Ecosystem.DEFAULT) {
                useLogger().debug('Move image', {
                    component: 'routing',
                    projectFrom: sourceProjectName,
                    projectTo: destinationProjectName,
                    artifactTag: data.artifactTag,
                });

                // move to next station
                destinationProjectName = buildRegistryStationProjectName(nextStation.secure_id);

                await transferProjectRepository(
                    {
                        projectName: sourceProjectName,
                        repositoryName: data.repositoryName,
                        artifactTag: data.artifactTag,
                    },
                    {
                        projectName: destinationProjectName,
                        repositoryName: data.repositoryName,
                    },
                );
            } else {
                await transferProjectRepositoryToOtherEcosystem(
                    {
                        projectName: sourceProjectName,
                        repositoryName: data.repositoryName,
                        artifactTag: data.artifactTag,
                    },
                    {
                        projectName: destinationProjectName,
                        repositoryName: data.repositoryName,
                        stationExtended: nextStation,
                    },
                );
            }
        }
    }

    return message;
}
