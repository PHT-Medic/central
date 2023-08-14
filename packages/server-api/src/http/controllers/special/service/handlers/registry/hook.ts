/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import { useRequestBody } from '@routup/body';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { RegistryCommand, RegistryHookSchema } from '../../../../../../components';
import { buildRegistryPayload } from '../../../../../../components/registry/utils/queue';
import { useLogger } from '../../../../../../config';

export async function postHarborHookRouteHandler(req: Request, res: Response) : Promise<any> {
    const body = useRequestBody(req);

    const validation = await RegistryHookSchema.safeParseAsync(body);
    if (validation.success === false) {
        useLogger().warn('The registry hook has a malformed shape.', { error: validation.error });
    } else {
        await publish(buildRegistryPayload({
            command: RegistryCommand.EVENT_HANDLE,
            data: {
                event: validation.data.type,
                operator: validation.data.operator,
                namespace: validation.data.event_data.repository.namespace,
                repositoryName: validation.data.event_data.repository.name,
                repositoryFullName: validation.data.event_data.repository.repo_full_name,
                artifactTag: validation.data.event_data.resources[0]?.tag,
                artifactDigest: validation.data.event_data.resources[0]?.digest,
            },
        }));
    }

    sendAccepted(res);
}
