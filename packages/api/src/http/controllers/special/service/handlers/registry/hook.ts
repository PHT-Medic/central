/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestBody } from '@routup/body';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import type { BaseSchema } from 'yup';
import { array, object, string } from 'yup';

import type { RegistryHook } from '../../../../../../domains/special/registry';
import {
    RegistryQueueCommand,
    buildRegistryQueueMessage,
} from '../../../../../../domains/special/registry';

let eventValidator : undefined | BaseSchema;
function useHookEventDataValidator() : BaseSchema {
    if (typeof eventValidator !== 'undefined') {
        return eventValidator;
    }

    eventValidator = object({
        type: string(),
        occur_at: string().optional(),
        operator: string().min(3).max(128),
        event_data: object({
            repository: object({
                name: string().min(3).max(128),
                repo_full_name: string().min(3).max(256),
                date_created: string().optional().default(undefined),
                namespace: string().min(3).max(128),
            }),
            resources: array(object({
                digest: string(),
                tag: string().min(1).max(100),
                resource_url: string(),
            })),
        }).noUnknown(false).default(undefined),
    }).noUnknown(false).default(undefined);

    return eventValidator;
}

export async function postHarborHookRouteHandler(req: Request, res: Response) : Promise<any> {
    const hook : RegistryHook = await useHookEventDataValidator().validate(useRequestBody(req));

    await publish(buildRegistryQueueMessage(
        RegistryQueueCommand.EVENT_HANDLE,
        {
            operator: hook.operator,
            namespace: hook.event_data.repository.namespace,
            repositoryName: hook.event_data.repository.name,
            repositoryFullName: hook.event_data.repository.repo_full_name,
            artifactTag: hook.event_data.resources[0]?.tag,
            artifactDigest: hook.event_data.resources[0]?.digest,
        },
        hook.type,
    ));

    return sendAccepted(res);
}
