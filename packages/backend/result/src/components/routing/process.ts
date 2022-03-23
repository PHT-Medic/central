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
    RegistryProjectType,
    TrainManagerRoutingPayload,
    TrainStation,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { mergeStationsWithTrainStations } from './helpers/merge';
import { useLogger } from '../../modules/log';
import { handleIncomingMoveOperation } from './handlers/incoming';
import { handleStationMoveOperation } from './handlers/station';
import { handleEcosystemAggregatorMoveOperation } from './handlers/ecosystem-aggregator';

export async function processRouteCommand(message: Message) {
    const data = message.data as TrainManagerRoutingPayload;

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
        // todo: handle not found project representation, throw error
        return message;
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
        relations: {
            registry_project: true,
        },
    });

    const stationsExtended = mergeStationsWithTrainStations(stations, trainStations);

    // -------------------------------------------------------------------

    switch (registryProject.type) {
        case RegistryProjectType.INCOMING: {
            await handleIncomingMoveOperation({
                items: stationsExtended,
                project: registryProject,
                routingPayload: data,
            });
            break;
        }
        case RegistryProjectType.STATION: {
            await handleStationMoveOperation({
                items: stationsExtended,
                project: registryProject,
                routingPayload: data,
            });
            break;
        }
        case RegistryProjectType.ECOSYSTEM_AGGREGATOR: {
            await handleEcosystemAggregatorMoveOperation({
                items: stationsExtended,
                project: registryProject,
                routingPayload: data,
            });
        }
    }

    return message;
}
