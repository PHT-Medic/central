/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    HarborAPI,
    REGISTRY_ARTIFACT_TAG_BASE,
    Registry,
    RegistryProjectType,
    buildAPIConnectionStringFromRegistry,
    createBasicHarborAPIConfig,
} from '@personalhealthtrain/central-common';
import { createClient, useClient } from '@trapi/client';
import { TransferItem } from './type';

type TransferContext = {
    registry?: Registry,
    source: TransferItem,
    destination: TransferItem,
};

export async function transferInternal(context: TransferContext) {
    const sourceArtifactTag = context.source.artifactTag || 'latest';

    // --------------------------------------------------------------

    if (context.source.project.registry_id !== context.destination.project.registry_id) {
        return;
    }

    if (!context.registry) {
        const client = useClient<HTTPClient>();
        context.registry = await client.registry.getOne(context.source.project.registry_id, {
            fields: ['+account_secret'],
        });
    }

    const connectionString = buildAPIConnectionStringFromRegistry(context.registry);
    const httpClientConfig = createBasicHarborAPIConfig(connectionString);
    const httpClient = createClient<HarborAPI>(httpClientConfig);

    // --------------------------------------------------------------

    if (
        context.destination.project.type !== RegistryProjectType.OUTGOING &&
        context.source.artifactTag !== REGISTRY_ARTIFACT_TAG_BASE
    ) {
        await httpClient.projectArtifact.copy(
            context.destination.project.external_name,
            context.destination.repositoryName,
            `${context.source.project.external_name}/${context.source.repositoryName}:${sourceArtifactTag}`,
        );
    }

    try {
        await httpClient.projectArtifact
            .delete(context.source.project.external_name, context.source.repositoryName, sourceArtifactTag);
    } catch (e) {
        // ...
    }

    // -------------------------------------------------------------------

    if (sourceArtifactTag !== REGISTRY_ARTIFACT_TAG_BASE) {
        try {
            await httpClient.projectRepository
                .delete(context.source.project.external_name, context.source.repositoryName);
        } catch (e) {
            // ...
        }
    }
}
