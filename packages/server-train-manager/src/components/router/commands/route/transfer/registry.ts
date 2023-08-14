/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@personalhealthtrain/core';
import {
    REGISTRY_ARTIFACT_TAG_BASE,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/core';
import { isClientErrorWithStatusCode, useClient } from 'hapic';
import type { TransferContext } from './type';
import { moveDockerImage } from '../../../../../core/docker/image-move';
import { buildDockerAuthConfig, createBasicHarborAPIClient } from '../../../../../core';

export async function transferInterRegistry(context: TransferContext) {
    const client = useClient<APIClient>();

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

    const connectionString = buildRegistryClientConnectionStringFromRegistry(context.sourceRegistry);
    const httpClient = createBasicHarborAPIClient(connectionString);

    try {
        await httpClient.projectRepositoryArtifact
            .delete({
                projectName: context.source.project.external_name,
                repositoryName: context.source.repositoryName,
                tagOrDigest: context.source.artifactTag,
            });
    } catch (e) {
        if (!isClientErrorWithStatusCode(e, 404)) {
            throw e;
        }
    }

    if (context.source.artifactTag !== REGISTRY_ARTIFACT_TAG_BASE) {
        try {
            await httpClient.projectRepository
                .delete({
                    projectName: context.source.project.external_name,
                    repositoryName: context.source.repositoryName,
                });
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }
    }
}
