/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { saveRobotToSecretStorage } from './entities/robot';
import { SecretStorageEntityType } from '../constants';
import type { SecretStorageSavePayload } from '../type';
import { saveUserSecretsToSecretStorage } from './entities/user';

export async function saveToSecretStorage(payload: SecretStorageSavePayload) {
    switch (payload.type) {
        case SecretStorageEntityType.ROBOT:
            await saveRobotToSecretStorage(payload);
            break;
        case SecretStorageEntityType.USER_SECRETS:
            await saveUserSecretsToSecretStorage(payload);
            break;
    }
}
