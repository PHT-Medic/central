/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRobotEventEmitter } from '@typescript-auth/server';
import { publishMessage } from 'amqp-extension';
import { buildSecretStorageQueueMessage } from '../domains/special/secret-storage/queue';
import { SecretStorageQueueCommand, SecretStorageQueueEntityType } from '../domains/special/secret-storage/constants';
import env from '../env';
import {
    deleteRobotFromSecretStorage,
    saveRobotToSecretStorage,
} from '../components/secret-storage/handlers/entities/robot';
import { SecretStorageRobotQueuePayload } from '../domains/special/secret-storage/type';

export function buildRobotAggregator() {
    function start(options?: {synchronous?: boolean}) {
        options ??= {};
        options.synchronous = env.env === 'test' ?
            true :
            options.synchronous;

        useRobotEventEmitter()
            .on('credentials', async (robot) => {
                const payload : SecretStorageRobotQueuePayload = {
                    type: SecretStorageQueueEntityType.ROBOT,
                    name: robot.name,
                    id: robot.id,
                    secret: robot.secret,
                };

                if (options.synchronous) {
                    await saveRobotToSecretStorage(payload);
                } else {
                    const queueMessage = buildSecretStorageQueueMessage(
                        SecretStorageQueueCommand.SAVE,
                        payload,
                    );

                    await publishMessage(queueMessage);
                }
            });

        useRobotEventEmitter()
            .on('deleted', async (robot) => {
                const payload : SecretStorageRobotQueuePayload = {
                    type: SecretStorageQueueEntityType.ROBOT,
                    name: robot.name,
                };

                if (options.synchronous) {
                    await deleteRobotFromSecretStorage(payload);
                } else {
                    const queueMessage = buildSecretStorageQueueMessage(
                        SecretStorageQueueCommand.DELETE,
                        payload,
                    );

                    await publishMessage(queueMessage);
                }
            });
    }

    return {
        start,
    };
}
