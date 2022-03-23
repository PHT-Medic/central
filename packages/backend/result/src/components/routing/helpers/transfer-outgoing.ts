/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Ecosystem, HTTPClient, RegistryProjectType } from '@personalhealthtrain/central-common';
import { useClient } from '@trapi/client';
import { TransferItem } from './type';
import { transferInternal } from './transfer-internal';

export async function transferOutgoing(source: TransferItem) {
    const client = await useClient<HTTPClient>();

    const { data: outgoingProjects } = await client.registryProject.getMany({
        filter: {
            type: RegistryProjectType.OUTGOING,
            ecosystem: Ecosystem.DEFAULT,
        },
        page: {
            limit: 1,
        },
    });

    if (outgoingProjects.length === 0) {
        // todo: throw error for no outgoing set :/
        return;
    }

    await transferInternal(
        {
            project: source.project,
            repositoryName: source.repositoryName,
            artifactTag: source.artifactTag,
        },
        {
            project: outgoingProjects[0],
            repositoryName: source.repositoryName,
        },
    );
}
