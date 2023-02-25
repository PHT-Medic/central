/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRobotEventEmitter } from '@authup/server-database';
import { publish } from 'amqp-extension';
import { SecretStorageCommand, SecretStorageEntityType, buildSecretStorageQueueMessage } from '../../components';
import { useEnv } from '../../config';
import {
    deleteRobotFromSecretStorage,
    saveRobotToSecretStorage,
} from '../../components/secret-storage/handlers/entities/robot';
import type { SecretStorageComponentRobotPayload } from '../../components';
import type { Aggregator } from '../type';

export function buildRobotAggregator() : Aggregator {
    function start() {
        const synchronous = useEnv('env') === 'test';

        useRobotEventEmitter()
            .on('credentials', async (robot) => {
                const payload : SecretStorageComponentRobotPayload = {
                    type: SecretStorageEntityType.ROBOT,
                    name: robot.name,
                    id: robot.id,
                    secret: robot.secret,
                };

                if (synchronous) {
                    await saveRobotToSecretStorage(payload);
                } else {
                    const queueMessage = buildSecretStorageQueueMessage(
                        SecretStorageCommand.SAVE,
                        payload,
                    );

                    await publish(queueMessage);
                }
            });

        useRobotEventEmitter()
            .on('deleted', async (robot) => {
                const payload : SecretStorageComponentRobotPayload = {
                    type: SecretStorageEntityType.ROBOT,
                    name: robot.name,
                };

                if (synchronous) {
                    await deleteRobotFromSecretStorage(payload);
                } else {
                    const queueMessage = buildSecretStorageQueueMessage(
                        SecretStorageCommand.DELETE,
                        payload,
                    );

                    await publish(queueMessage);
                }
            });
    }

    return {
        start,
    };
}
