/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {getRepository} from "typeorm";
import {DispatcherHarborEventType, emitDispatcherHarborEvent} from "../../../../../domains/service/harbor/queue";
import {array, BaseSchema, object, string} from "yup";

import {
    REGISTRY_MASTER_IMAGE_PROJECT_NAME, Train,
} from "@personalhealthtrain/ui-common";
import {useLogger} from "../../../../../modules/log";

let eventValidator : undefined | BaseSchema;
function useHookEventDataValidator() : BaseSchema {
    if(typeof eventValidator !== 'undefined') {
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
                namespace: string().min(3).max(128)
            }),
            resources: array(object({
                digest: string(),
                tag: string().min(1).max(100),
                resource_url: string()
            }))
        }).noUnknown(false).default(undefined)
    }).noUnknown(false).default(undefined);

    return eventValidator;
}

export type HarborHook = {
    type: string,
    occur_at?: string,
    operator: string,
    event_data: HarborHookEvent
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
}

export async function postHarborHookRouteHandler(req: any, res: any) {
    useLogger().debug('hook received', {service: 'api-harbor-hook'})

    const repository = getRepository(Train);

    try {
        const hook : HarborHook = await useHookEventDataValidator().validate(req.body);

        const isLibraryProject : boolean = hook.event_data.repository.namespace === REGISTRY_MASTER_IMAGE_PROJECT_NAME;

        if(!isLibraryProject) {
            /**
             * Process train project
             */
            const train = await repository.findOne({id: hook.event_data.repository.name});

            if (typeof train === 'undefined') {
                useLogger().warn('hook could not proceeded, train: ' + hook.event_data.repository.name + ' does not exist.', {service: 'api-harbor-hook'})
                return res.status(200).end();
            }
        }

        await emitDispatcherHarborEvent({
            event: hook.type as DispatcherHarborEventType,
            operator: hook.operator,
            namespace: hook.event_data.repository.namespace,
            repositoryName: hook.event_data.repository.name,
            repositoryFullName: hook.event_data.repository.repo_full_name,
            artifactTag: hook.event_data.resources[0]?.tag
        });

        return res.status(200).end();
    } catch (e) {
        useLogger().warn('hook could not be proceeded.', {service: 'api-harbor-hook', errorMessage: e.message})

        return res._failBadRequest({message: 'The hook event is not valid...'});
    }
}
