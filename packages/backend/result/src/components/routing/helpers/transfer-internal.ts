/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClientKey,
    HarborAPI,
    REGISTRY_ARTIFACT_TAG_BASE,
    REGISTRY_ARTIFACT_TAG_LATEST,
    RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { TransferItem } from './type';

export async function transferInternal(
    source: TransferItem,
    destination: TransferItem,
) {
    const sourceArtifactTag = source.artifactTag || 'latest';

    const harborClient = useClient<HarborAPI>(HTTPClientKey.HARBOR);

    await harborClient.projectArtifact.copy(
        destination.project.external_name,
        destination.repositoryName,
        `${source.project.external_name}/${source.repositoryName}:${sourceArtifactTag}`,
    );

    try {
        await harborClient.projectArtifact
            .delete(source.project.external_name, source.repositoryName, sourceArtifactTag);
    } catch (e) {
        // ...
    }

    // -------------------------------------------------------------------

    if (
        (
            source.project.type === RegistryProjectType.STATION ||
                source.project.type === RegistryProjectType.ECOSYSTEM_AGGREGATOR
        ) &&
        destination.project.type === RegistryProjectType.STATION &&
        sourceArtifactTag === REGISTRY_ARTIFACT_TAG_LATEST
    ) {
        // station does not push 'base' tag on completion
        await harborClient.projectArtifact.copy(
            destination.project.external_name,
            destination.repositoryName,
            `${source.project.external_name}/${source.repositoryName}:${REGISTRY_ARTIFACT_TAG_BASE}`,
        );

        try {
            await harborClient.projectArtifact
                .delete(source.project.external_name, source.repositoryName, REGISTRY_ARTIFACT_TAG_BASE);
        } catch (e) {
            // ...
        }
    }

    // -------------------------------------------------------------------

    // latest is always last push, so only remove project than ;)
    if (sourceArtifactTag === REGISTRY_ARTIFACT_TAG_LATEST) {
        try {
            await harborClient.projectRepository
                .delete(source.project.external_name, source.repositoryName);
        } catch (e) {
            // ...
        }
    }
}
