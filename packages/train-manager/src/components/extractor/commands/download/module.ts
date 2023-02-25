/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HTTPClient,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import { buildDockerAuthConfig, buildRemoteDockerImageURL, pullDockerImage } from '../../../../core';
import type { ComponentPayloadExtended } from '../../../type';
import { extendPayload } from '../../../utils';
import { ExtractorCommand } from '../../constants';
import { ExtractorError } from '../../error';
import type { ExtractorExtractPayload } from '../../type';
import { useExtractorLogger } from '../../utils';

export async function executeExtractorDownloadCommand(
    input: ExtractorExtractPayload,
) : Promise<ComponentPayloadExtended<ExtractorExtractPayload>> {
    useExtractorLogger().debug('Executing command', {
        command: ExtractorCommand.EXTRACT,
    });

    const data = await extendPayload(input);
    if (!data.registry) {
        throw ExtractorError.registryNotFound();
    }

    const client = useClient<HTTPClient>();

    const registryProject = await client.registryProject.getOne(data.entity.outgoing_registry_project_id);
    data.registryProject = registryProject;

    const repositoryTag = buildRemoteDockerImageURL({
        hostname: data.registry.host,
        projectName: registryProject.external_name,
        repositoryName: data.id,
    });

    await pullDockerImage(repositoryTag, buildDockerAuthConfig({
        host: data.registry.host,
        user: data.registry.account_name,
        password: data.registry.account_secret,
    }));

    return data;
}
