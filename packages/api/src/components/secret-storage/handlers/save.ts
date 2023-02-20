/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { saveRobotToSecretStorage } from './entities/robot';
import { SecretStorageQueueEntityType } from '../../../domains/special/secret-storage/constants';
import type { SecretStorageQueuePayload } from '../../../domains/special/secret-storage/type';
import { saveUserSecretsToSecretStorage } from './entities/user';

export async function saveToSecretStorage(payload: SecretStorageQueuePayload) {
    switch (payload.type) {
        case SecretStorageQueueEntityType.ROBOT:
            await saveRobotToSecretStorage(payload);
            break;
        case SecretStorageQueueEntityType.USER_SECRETS:
            await saveUserSecretsToSecretStorage(payload);
            break;
    }
}
