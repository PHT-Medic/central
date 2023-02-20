/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import type { RouterQueuePayload } from '../../../components';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../../components';
import type { SecretStorageQueueCommand } from './constants';
import type {
    SecretStorageQueuePayload,
} from './type';

export function buildSecretStorageQueueMessage(
    type: SecretStorageQueueCommand,
    data: SecretStorageQueuePayload,
) : PublishOptionsExtended<RouterQueuePayload<SecretStorageQueuePayload>> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data,
            metadata: {
                component: ComponentName.SECRET_STORAGE,
                command: type,
            },
        },
    };
}
