/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HTTPClient,
    Registry,
} from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from 'hapic';
import type { Client as HarborClient } from '@hapic/harbor';
import { RouterCommand } from '../../../constants';
import { useRouterLogger } from '../../../utils';
import type { TransferItem } from './type';
import { useLogger } from '../../../../../core/logger';
import { transferInterRegistry } from './registry';
import { createBasicHarborAPIConfig } from '../../../../../core/harbor';

type TransferContext = {
    registry?: Registry,
    source: TransferItem,
    destination: TransferItem,
};

export async function transferInternal(context: TransferContext) {
    // --------------------------------------------------------------

    if (context.source.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    if (context.source.project.registry_id !== context.destination.project.registry_id) {
        await transferInterRegistry(context);
        return;
    }

    useRouterLogger()
        .debug(`Move repository ${context.source.repositoryName} internal from ${context.source.project.name} project to ${context.destination.project.name} project`, {
            command: RouterCommand.ROUTE,
        });

    if (!context.registry) {
        const client = useClient<HTTPClient>();
        context.registry = await client.registry.getOne(context.source.project.registry_id, {
            fields: ['+account_secret'],
        });
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(context.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborClient>(httpClientConfig);

    // --------------------------------------------------------------

    if (context.destination.project.type === RegistryProjectType.STATION) {
        await httpClient.projectArtifact.copy(
            context.destination.project.external_name,
            context.destination.repositoryName,
            `${context.source.project.external_name}/${context.source.repositoryName}:${REGISTRY_ARTIFACT_TAG_BASE}`,
        );

        try {
            await httpClient.projectArtifact
                .delete(context.source.project.external_name, context.source.repositoryName, REGISTRY_ARTIFACT_TAG_BASE);
        } catch (e) {
            // ...
        }
    }

    // --------------------------------------------------------------

    await httpClient.projectArtifact.copy(

        context.destination.project.external_name,
        context.destination.repositoryName,
        `${context.source.project.external_name}/${context.source.repositoryName}:${context.source.artifactTag}`,
    );

    try {
        await httpClient.projectArtifact
            .delete(context.source.project.external_name, context.source.repositoryName, context.source.artifactTag);
    } catch (e) {
        // ...
    }

    // -------------------------------------------------------------------

    try {
        await httpClient.projectRepository
            .delete(context.source.project.external_name, context.source.repositoryName);
    } catch (e) {
        // ...
    }
}
