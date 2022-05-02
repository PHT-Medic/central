/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseSchema, array, object, string,
} from 'yup';

import { publishMessage } from 'amqp-extension';
import {
    RegistryHook,
    RegistryQueueEvent,
    buildRegistryEventQueueMessage,
} from '../../../../../../domains/special/registry';
import { ExpressRequest, ExpressResponse } from '../../../../../type';

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

export async function postHarborHookRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const hook : RegistryHook = await useHookEventDataValidator().validate(req.body);

    const hookTypes = Object
        .values(RegistryQueueEvent)
        .map((event) => event.substring('REGISTRY_'.length));

    if (hookTypes.indexOf(hook.type) === -1) {
        return res.status(200).end();
    }

    const event : RegistryQueueEvent = `REGISTRY_${hook.type}` as RegistryQueueEvent;

    const message = buildRegistryEventQueueMessage(
        event,
        {
            operator: hook.operator,
            namespace: hook.event_data.repository.namespace,
            repositoryName: hook.event_data.repository.name,
            repositoryFullName: hook.event_data.repository.repo_full_name,
            artifactTag: hook.event_data.resources[0]?.tag,
            artifactDigest: hook.event_data.resources[0]?.digest,
        },
    );

    await publishMessage(message);

    return res.status(200).end();
}
