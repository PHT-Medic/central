/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName } from '../constants';
import type { RouterQueuePayload } from '../router';
import { ROUTER_QUEUE_ROUTING_KEY } from '../router';
import type { SecretStorageCommand } from './constants';
import type {
    SecretStorageQueuePayload,
} from './type';

export function buildSecretStorageQueueMessage(
    type: SecretStorageCommand,
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
