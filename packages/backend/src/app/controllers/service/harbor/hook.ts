import {getRepository} from "typeorm";
import {HarborQueueEventMessageData} from "../../../../aggregators/harbor";
import {Train} from "../../../../domains/pht/train";
import {TrainResult} from "../../../../domains/pht/train/result";
import {createQueueMessageTemplate, publishQueueMessage} from "../../../../modules/message-queue";
import {array, BaseSchema, object, string} from "yup";

import {
    HARBOR_INCOMING_PROJECT_NAME,
    HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME, isHarborStationProjectName
} from "../../../../config/services/harbor";
import {useLogger} from "../../../../modules/log";
import {MQ_RS_COMMAND_ROUTING_KEY, MQ_UI_H_EVENT_ROUTING_KEY} from "../../../../config/services/rabbitmq";
import {
    createTrainRouterQueueMessageEvent,
    publishTrainRouterQueueMessage
} from "../../../../domains/service/train-router/queue";

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
    console.log(req.body);
    useLogger().debug('hook received', {service: 'api-harbor-hook'})

    const repository = getRepository(Train);

    try {
        const hook : HarborHook = await useHookEventDataValidator().validate(req.body);

        const isLibraryProject : boolean = hook.event_data.repository.namespace === HARBOR_MASTER_IMAGE_PROJECT_NAME;

        if(!isLibraryProject) {
            /**
             * Process train project
             */
            const train = await repository.findOne({id: hook.event_data.repository.name});

            if (typeof train === 'undefined') {
                useLogger().warn('hook could not proceeded, train: ' + hook.event_data.repository.name + ' does not exist.', {service: 'api-harbor-hook'})
                return res._respondAccepted();
            }
        }

        // User Interface (UI)
        await publishHarborEventToUserInterface(hook);

        // Result Service (RS)
        await publishHarborEventToResultService(hook);

        // Train Router
        await publishHarborEventToTrainRouter(hook);

        return res.status(200).end();
    } catch (e) {
        useLogger().warn('hook could not be proceeded.', {service: 'api-harbor-hook', errorMessage: e.message})

        return res._failBadRequest({message: 'The hook event is not valid...'});
    }
}

async function publishHarborEventToUserInterface(hook: HarborHook) {
    let eventType : undefined | string;

    if(hook.type !== 'PUSH_ARTIFACT') {
        return;
    }

    const isLibraryProject : boolean = hook.event_data.repository.namespace === HARBOR_MASTER_IMAGE_PROJECT_NAME;
    if(isLibraryProject) {
        eventType = 'masterImagePushed';
    }

    const isStationProject : boolean = isHarborStationProjectName(hook.event_data.repository.namespace);
    const isIncomingProject : boolean = hook.event_data.repository.namespace === HARBOR_INCOMING_PROJECT_NAME;
    const isOutgoingProject : boolean = hook.event_data.repository.namespace === HARBOR_OUTGOING_PROJECT_NAME;

    if(
        isStationProject ||
        isIncomingProject ||
        isOutgoingProject
    ) {
        eventType = 'trainPushed';
    }

    if(typeof eventType !== 'undefined') {
        if(isLibraryProject) {
            if (hook.event_data.resources.length === 0) {
                useLogger().debug('artifact tag missing for master image.', {service: 'api-harbor-hook'});

                return;
            }
        }

        const data : HarborQueueEventMessageData = {
            operator: hook.operator,
            namespace: hook.event_data.repository.namespace,
            repositoryName: hook.event_data.repository.name,
            repositoryFullName: hook.event_data.repository.repo_full_name,
            artifactTag: hook.event_data.resources[0]?.tag
        };

        await publishQueueMessage(MQ_UI_H_EVENT_ROUTING_KEY, createQueueMessageTemplate(eventType, data));

        useLogger().debug('master-image/train event pushed to ui harbor aggregator.', {service: 'api-harbor-hook'});
    }
}

/**
 * Handle harbor hook event for result service.
 *
 * @param hook
 */
async function publishHarborEventToResultService(hook: HarborHook) {
    const isOutgoingProject : boolean = hook.event_data.repository.namespace === HARBOR_OUTGOING_PROJECT_NAME;

    // Result Service
    if (!isOutgoingProject) {
        return;
    }

    const resultRepository = getRepository(TrainResult);

    if(hook.type !== 'PUSH_ARTIFACT') {
        return;
    }

    let trainResult = await resultRepository.findOne({
        train_id: hook.event_data.repository.name
    });

    if(typeof trainResult === 'undefined') {
        const dbData = resultRepository.create({
            train_id: hook.event_data.repository.name,
            image: hook.event_data.repository.repo_full_name
        });

        await resultRepository.save(dbData);

        trainResult = dbData;
    }

    const queueData : HarborQueueEventMessageData & {
        trainId: string,
        resultId: string | number
    } = {
        operator: hook.operator,
        namespace: hook.event_data.repository.namespace,
        repositoryName: hook.event_data.repository.name,
        repositoryFullName: hook.event_data.repository.repo_full_name,

        // additional information
        trainId: hook.event_data.repository.name,
        resultId: trainResult.id
    }

    await publishQueueMessage(
        MQ_RS_COMMAND_ROUTING_KEY,
        createQueueMessageTemplate('download', queueData)
    );

    useLogger().debug('train event pushed to result service aggregator.', {service: 'api-harbor-hook'})

}

/**
 * Handle harbor hook event for train router.
 *
 * @param hook
 */
async function publishHarborEventToTrainRouter(hook: HarborHook) {
    // only pass station project events to train router.
    if (!isHarborStationProjectName(hook.event_data.repository.namespace)) {
        return;
    }

    // only keep track of push events
    if(hook.type !== 'PUSH_ARTIFACT') {
        return;
    }

    await publishTrainRouterQueueMessage(createTrainRouterQueueMessageEvent(
        'trainPushed',
        {
            repositoryFullName: hook.event_data.repository.repo_full_name,
            operator: hook.operator
        }
    ));

    useLogger().debug('train event pushed to train router aggregator.', {service: 'api-harbor-hook'})
}
