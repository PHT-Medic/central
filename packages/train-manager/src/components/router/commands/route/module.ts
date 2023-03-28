/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuildInput } from 'rapiq';
import type {
    HTTPClient,
    TrainStation,
} from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { RouterCommand } from '../../constants';
import type { RouterRoutePayload } from '../../type';
import { useRouterLogger } from '../../utils';
import { mergeStationsWithTrainStations } from './helpers/merge';
import { routeIncomingProject } from './handlers/incoming';
import { routeStationProject } from './handlers/station';
import { routeAggregatorProject } from './handlers/aggreagtor';
import { RouterError } from '../../error';
import { routeOutgoingProject } from './handlers/outgoing';
import type { StationExtended } from './type';

export async function executeRouterRouteCommand(
    data: RouterRoutePayload,
) {
    useRouterLogger().debug('Executing command.', {
        command: RouterCommand.ROUTE,
    });

    if (
        data.artifactTag !== REGISTRY_ARTIFACT_TAG_BASE &&
        data.artifactTag !== REGISTRY_ARTIFACT_TAG_LATEST
    ) {
        useRouterLogger().debug('Registry tag could not be processed.', {
            command: RouterCommand.ROUTE,
            tag: data.artifactTag,
        });

        return data;
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

        items = mergeStationsWithTrainStations(stations, trainStations, [
            'registry_project',
        ]);
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

    return data;
}
