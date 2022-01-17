/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import {
    BaseSchema, array, object, string,
} from 'yup';

import {
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
} from '@personalhealthtrain/ui-common';
import { publishMessage } from 'amqp-extension';
import { useLogger } from '../../../../../modules/log';
import { DispatcherHarborEventType, buildDispatcherHarborEvent } from '../../../../../domains/extra/harbor/queue';
import { ExpressRequest, ExpressResponse } from '../../../../../config/http/type';
import { TrainEntity } from '../../../../../domains/core/train/entity';

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

type HarborHookEvent = {
    repository: {
        name: string,
        repo_full_name: string,
        date_created: string | undefined,
        namespace: string
    },
    resources: {
        digest: string,
        tag: string,
        resource_url: string
    }[],
    [key: string]: any
};

export type HarborHook = {
    type: string,
    occur_at?: string,
    operator: string,
    event_data: HarborHookEvent
};

export async function postHarborHookRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    useLogger().debug('hook received', { service: 'api-harbor-hook' });

    const repository = getRepository(TrainEntity);

    const hook : HarborHook = await useHookEventDataValidator().validate(req.body);

    const isLibraryProject : boolean = hook.event_data.repository.namespace === REGISTRY_MASTER_IMAGE_PROJECT_NAME;

    if (!isLibraryProject) {
        /**
         * Process train project
         */
        const train = await repository.findOne({ id: hook.event_data.repository.name });

        if (typeof train === 'undefined') {
            useLogger().warn(`hook could not proceeded, train: ${hook.event_data.repository.name} does not exist.`, { service: 'api-harbor-hook' });
            return res.status(200).end();
        }
    }

    const message = buildDispatcherHarborEvent({
        event: hook.type as DispatcherHarborEventType,
        operator: hook.operator,
        namespace: hook.event_data.repository.namespace,
        repositoryName: hook.event_data.repository.name,
        repositoryFullName: hook.event_data.repository.repo_full_name,
        artifactTag: hook.event_data.resources[0]?.tag,
    });

    await publishMessage(message);

    return res.status(200).end();
}
