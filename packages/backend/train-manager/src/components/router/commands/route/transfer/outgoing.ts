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
import { useClient } from 'hapic';
import { TransferItem } from './type';
import { transferInternal } from './internal';
import { RouterError } from '../../../error';
import { useLogger } from '../../../../../modules/log';

export async function transferOutgoing(source: TransferItem) {
    if (source.artifactTag === REGISTRY_ARTIFACT_TAG_BASE) {
        return;
    }

    useLogger().debug(`Move repository ${source.repositoryName} internal from ${source.project.name} project to random outgoing project.`, {
        component: 'routing',
    });

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
