/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HTTPClient,
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
} from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { TransferItem } from '../transfer/type';
import { transferInternal } from '../transfer/internal';

export async function transferOutgoing(source: TransferItem) {
    if (source.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    const client = await useClient<HTTPClient>();
    const { data: outgoingProjects } = await client.registryProject.getMany({
        filter: {
            type: RegistryProjectType.OUTGOING,
            registry_id: source.project.registry_id,
        },
        page: {
            limit: 1,
        },
    });

    if (outgoingProjects.length === 0) {
        // todo: throw error for no outgoing set :/
        return;
    }

    await transferInternal({
        source: {
            project: source.project,
            repositoryName: source.repositoryName,
            artifactTag: source.artifactTag,
        },
        destination: {
            project: outgoingProjects[0],
            repositoryName: source.repositoryName,
        },
    });
}
