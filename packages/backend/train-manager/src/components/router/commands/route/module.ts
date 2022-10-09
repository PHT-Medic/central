/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuildInput } from 'rapiq';
import { Message } from 'amqp-extension';
import {
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProjectType,
    TrainManagerRouterRoutePayload,
    TrainStation,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { mergeStationsWithTrainStations } from './helpers/merge';
import { routeIncomingProject } from './handlers/incoming';
import { routeStationProject } from './handlers/station';
import { routeAggregatorProject } from './handlers/aggreagtor';
import { RouterError } from '../../error';
import { routeOutgoingProject } from './handlers/outgoing';
import { StationExtended } from './type';

export async function processRouteCommand(message: Message) {
    const data = message.data as TrainManagerRouterRoutePayload;

    if (
        data.artifactTag !== REGISTRY_ARTIFACT_TAG_BASE &&
        data.artifactTag !== REGISTRY_ARTIFACT_TAG_LATEST
    ) {
        return message;
    }

    const client = useClient<HTTPClient>();

    // -------------------------------------------------------------------

    const projectResponse = await client.registryProject.getMany({
        filter: {
            external_name: data.projectName,
        },
        page: {
            limit: 1,
        },
    });

    if (projectResponse.data.length === 0) {
        throw RouterError.registryProjectNotFound({
            message: 'The pushed registry-project is not registered.',
        });
    }

    const registryProject = projectResponse.data[0];

    // -------------------------------------------------------------------

    const query : BuildInput<TrainStation> = {
        filter: {
            train_id: data.repositoryName,
        },
        sort: {
            index: 'ASC',
        },
    };

    // -------------------------------------------------------------------

    let items : StationExtended[] = [];

    if (
        registryProject.type === RegistryProjectType.INCOMING ||
        registryProject.type === RegistryProjectType.STATION ||
        registryProject.type === RegistryProjectType.AGGREGATOR
    ) {
        const { data: trainStations } = await client.trainStation.getMany(query);
        if (trainStations.length === 0) {
            throw RouterError.routeEmpty();
        }

        const { data: stations } = await client.station.getMany({
            filter: {
                id: trainStations.map((trainStation) => trainStation.station_id),
            },
            relations: {
                registry_project: true,
            },
        });

        items = mergeStationsWithTrainStations(stations, trainStations);
    }

    // -------------------------------------------------------------------

    switch (registryProject.type) {
        case RegistryProjectType.INCOMING: {
            await routeIncomingProject({
                items,
                project: registryProject,
                payload: data,
            });
            break;
        }
        case RegistryProjectType.OUTGOING: {
            await routeOutgoingProject({
                project: registryProject,
                payload: data,
            });
            break;
        }
        case RegistryProjectType.STATION: {
            await routeStationProject({
                items,
                project: registryProject,
                payload: data,
            });
            break;
        }
        case RegistryProjectType.AGGREGATOR: {
            await routeAggregatorProject({
                items,
                project: registryProject,
                payload: data,
            });
        }
    }

    return message;
}
