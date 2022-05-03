/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { SecretStorageQueuePayload } from '../../../domains/special/secret-storage/type';
import { SecretStorageQueueEntityType } from '../../../domains/special/secret-storage/constants';
import { deleteRobotFromSecretStorage } from './entities/robot';
import { deleteUserSecretsFromSecretStorage } from './entities/user';

export async function deleteFromSecretStorage(message: Message) {
    const payload: SecretStorageQueuePayload = message.data as SecretStorageQueuePayload;

    switch (payload.type) {
        case SecretStorageQueueEntityType.ROBOT:
            await deleteRobotFromSecretStorage(payload);
            break;
        case SecretStorageQueueEntityType.USER_SECRETS:
            await deleteUserSecretsFromSecretStorage(payload);
            break;
    }
}
