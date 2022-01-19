/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { SecretStorageDeleteQueuePayload } from '../../../domains/extra/secret-storage/type';
import { SecretStorageQueueEntityType } from '../../../domains/extra/secret-storage/constants';
import { deleteRobotFromSecretStorage } from './entities/robot';
import { deleteStationFromSecretStorage } from './entities/station';
import { deleteUserSecretsFromSecretStorage } from './entities/user';

export async function deleteFromSecretStorage(message: Message) {
    const payload: SecretStorageDeleteQueuePayload = message.data as SecretStorageDeleteQueuePayload;

    switch (payload.type) {
        case SecretStorageQueueEntityType.ROBOT:
            await deleteRobotFromSecretStorage(payload);
            break;
        case SecretStorageQueueEntityType.STATION:
            await deleteStationFromSecretStorage(payload);
            break;
        case SecretStorageQueueEntityType.USER_SECRETS:
            await deleteUserSecretsFromSecretStorage(payload);
            break;
    }
}
