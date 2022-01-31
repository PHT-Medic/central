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

export function buildRobotAggregator() {
    function start() {
        useRobotEventEmitter()
            .on('credentials', async (robot) => {
                const queueMessage = buildSecretStorageQueueMessage(
                    SecretStorageQueueCommand.SAVE,
                    {
                        type: SecretStorageQueueEntityType.ROBOT,
                        name: robot.name,
                        id: robot.id,
                        secret: robot.secret,
                    },
                );

                await publishMessage(queueMessage);
            });

        useRobotEventEmitter()
            .on('deleted', async (robot) => {
                const queueMessage = buildSecretStorageQueueMessage(
                    SecretStorageQueueCommand.DELETE,
                    {
                        type: SecretStorageQueueEntityType.ROBOT,
                        name: robot.name,
                        id: robot.id,
                    },
                );

                await publishMessage(queueMessage);
            });
    }

    return {
        start,
    };
}
