/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    APIClient,
    Registry,
} from '@personalhealthtrain/central-common';
import {
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
    buildRegistryClientConnectionStringFromRegistry,
} from '@personalhealthtrain/central-common';
import { isClientErrorWithStatusCode, useClient } from 'hapic';
import { RouterCommand } from '../../../constants';
import { useRouterLogger } from '../../../utils';
import type { TransferItem } from './type';
import { transferInterRegistry } from './registry';
import { createBasicHarborAPIClient } from '../../../../../core';

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
        const client = useClient<APIClient>();
        context.registry = await client.registry.getOne(context.source.project.registry_id, {
            fields: ['+account_secret'],
        });
    }

    const connectionString = buildRegistryClientConnectionStringFromRegistry(context.registry);
    const httpClient = createBasicHarborAPIClient(connectionString);

    // --------------------------------------------------------------

    if (context.destination.project.type === RegistryProjectType.STATION) {
        await httpClient.projectRepositoryArtifact.copy(
            {
                projectName: context.destination.project.external_name,
                repositoryName: context.destination.repositoryName,
            },
            {
                projectName: context.source.project.external_name,
                repositoryName: context.source.repositoryName,
                artifactTag: REGISTRY_ARTIFACT_TAG_BASE,
            },
        );

        try {
            await httpClient.projectRepositoryArtifact
                .delete({
                    projectName: context.source.project.external_name,
                    repositoryName: context.source.repositoryName,
                    tagOrDigest: REGISTRY_ARTIFACT_TAG_BASE,
                });
        } catch (e) {
            if (!isClientErrorWithStatusCode(e, 404)) {
                throw e;
            }
        }
    }

    // --------------------------------------------------------------

    await httpClient.projectRepositoryArtifact.copy(
        {
            projectName: context.destination.project.external_name,
            repositoryName: context.destination.repositoryName,
        },
        {
            projectName: context.source.project.external_name,
            repositoryName: context.source.repositoryName,
            artifactTag: context.source.artifactTag,
        },
    );

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

    // -------------------------------------------------------------------

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
