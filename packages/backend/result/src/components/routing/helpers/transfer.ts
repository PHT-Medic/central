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
    isRegistryStationProjectName,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { ProjectRepositoryTransferItem } from './type';

export async function transferProjectRepository(
    source: ProjectRepositoryTransferItem,
    destination: ProjectRepositoryTransferItem,
) {
    const sourceArtifactTag = source.artifactTag || 'latest';

    const harborClient = useClient<HarborAPI>(HTTPClientKey.HARBOR);

    await harborClient.projectArtifact.copy(
        destination.projectName,
        destination.repositoryName,
        `${source.projectName}/${source.repositoryName}:${sourceArtifactTag}`,
    );

    try {
        await harborClient.projectArtifact
            .delete(source.projectName, source.repositoryName, sourceArtifactTag);
    } catch (e) {
        // ...
    }

    // -------------------------------------------------------------------

    const isSourceStationProject = isRegistryStationProjectName(source.projectName);
    const isDestinationStationProject = isRegistryStationProjectName(destination.projectName);

    if (
        isSourceStationProject &&
        isDestinationStationProject &&
        sourceArtifactTag === REGISTRY_ARTIFACT_TAG_LATEST
    ) {
        // station does not push 'base' tag on completion
        await harborClient.projectArtifact.copy(
            destination.projectName,
            destination.repositoryName,
            `${source.projectName}/${source.repositoryName}:${REGISTRY_ARTIFACT_TAG_BASE}`,
        );

        try {
            await harborClient.projectArtifact
                .delete(source.projectName, source.repositoryName, REGISTRY_ARTIFACT_TAG_BASE);
        } catch (e) {
            // ...
        }
    }

    // -------------------------------------------------------------------

    // latest is always last push, so only remove project than ;)
    if (sourceArtifactTag === REGISTRY_ARTIFACT_TAG_LATEST) {
        try {
            await harborClient.projectRepository
                .delete(source.projectName, source.repositoryName);
        } catch (e) {
            // ...
        }
    }
}
