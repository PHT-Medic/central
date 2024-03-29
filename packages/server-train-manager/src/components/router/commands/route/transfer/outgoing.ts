/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { APIClient } from '@personalhealthtrain/core';
import {
    REGISTRY_ARTIFACT_TAG_BASE,
    RegistryProjectType,
} from '@personalhealthtrain/core';
import { useClient } from 'hapic';
import { RouterCommand } from '../../../constants';
import { useRouterLogger } from '../../../utils';
import type { TransferItem } from './type';
import { transferInternal } from './internal';
import { RouterError } from '../../../error';

export async function transferOutgoing(source: TransferItem) {
    if (source.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    useRouterLogger().debug(`Move repository ${source.repositoryName} internal from ${source.project.name} project to random outgoing project.`, {
        command: RouterCommand.ROUTE,
    });

    const client = await useClient<APIClient>();
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
        throw RouterError.registryProjectNotFound({
            message: 'No outgoing repository found.',
        });
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
