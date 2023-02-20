/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SecretStorageQueuePayload } from '../../../domains/special/secret-storage/type';
import { SecretStorageQueueEntityType } from '../../../domains/special/secret-storage/constants';
import { deleteRobotFromSecretStorage } from './entities/robot';
import { deleteUserSecretsFromSecretStorage } from './entities/user';

export async function deleteFromSecretStorage(data: SecretStorageQueuePayload) {
    switch (data.type) {
        case SecretStorageQueueEntityType.ROBOT:
            await deleteRobotFromSecretStorage(data);
            break;
        case SecretStorageQueueEntityType.USER_SECRETS:
            await deleteUserSecretsFromSecretStorage(data);
            break;
    }
}
