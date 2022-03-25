/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    HarborAPI,
    REGISTRY_ARTIFACT_TAG_BASE,
    buildAPIConnectionStringFromRegistry,
    createBasicHarborAPIConfig,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { buildDockerAuthConfig } from '../../../config/services/registry';
import { TransferContext } from './type';
import { moveDockerImage } from '../../../modules/docker/image-move';

export async function transferInterRegistry(context: TransferContext) {
    const client = useClient<HTTPClient>();

    if (!context.sourceRegistry) {
        context.sourceRegistry = await client.registry.getOne(context.source.project.registry_id, {
            fields: ['+account_secret'],
        });
    }

    if (!context.destinationRegistry) {
        context.destinationRegistry = await client.registry.getOne(context.destination.project.registry_id, {
            fields: ['+account_secret'],
        });
    }

    const sourceAuthConfig = buildDockerAuthConfig({
        host: context.sourceRegistry.host,
        user: context.sourceRegistry.account_name,
        password: context.sourceRegistry.account_secret,
    });

    const destinationAuthConfig = buildDockerAuthConfig({
        host: context.sourceRegistry.host,
        user: context.sourceRegistry.account_name,
        password: context.sourceRegistry.account_secret,
    });

    await moveDockerImage({
        sourceAuthConfig,
        sourceRepositoryName: context.source.repositoryName,
        sourceProjectName: context.source.project.name,
        sourceTag: context.source.artifactTag,

        destinationAuthConfig,
        destinationRepositoryName: context.destination.repositoryName,
        destinationProjectName: context.destination.project.external_name,
        destinationTag: context.destination.artifactTag,
    });

    // -------------------------------------------------------------------------

    const connectionString = buildAPIConnectionStringFromRegistry(context.sourceRegistry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    try {
        await httpClient.projectArtifact
            .delete(context.source.project.external_name, context.source.repositoryName, context.source.artifactTag);
    } catch (e) {
        // ...
    }

    if (context.source.artifactTag !== REGISTRY_ARTIFACT_TAG_BASE) {
        try {
            await httpClient.projectRepository
                .delete(context.source.project.external_name, context.source.repositoryName);
        } catch (e) {
            // ...
        }
    }
}
