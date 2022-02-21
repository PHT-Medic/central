/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { saveRobotToSecretStorage } from './entities/robot';
import { SecretStorageQueueEntityType } from '../../../domains/special/secret-storage/constants';
import { SecretStorageQueuePayload } from '../../../domains/special/secret-storage/type';
import { saveStationToSecretStorage } from './entities/station';
import { saveUserSecretsToSecretStorage } from './entities/user';

export async function saveToSecretStorage(message: Message) {
    const payload : SecretStorageQueuePayload = message.data as SecretStorageQueuePayload;

    switch (payload.type) {
        case SecretStorageQueueEntityType.ROBOT:
            await saveRobotToSecretStorage(payload);
            break;
        case SecretStorageQueueEntityType.STATION:
            await saveStationToSecretStorage(payload);
            break;
        case SecretStorageQueueEntityType.USER_SECRETS:
            await saveUserSecretsToSecretStorage(payload);
            break;
    }
}
