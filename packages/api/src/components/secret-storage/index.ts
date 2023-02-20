/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isError } from '@personalhealthtrain/central-common';
import { useLogger } from '../../config';
import type { SecretStorageQueuePayload } from '../../domains/special/secret-storage/type';
import { saveToSecretStorage } from './handlers/save';
import { deleteFromSecretStorage } from './handlers/delete';
import { SecretStorageQueueCommand } from '../../domains/special/secret-storage/constants';

export async function executeSecretStorageComponentCommand(
    command: string,
    payload: SecretStorageQueuePayload,
) : Promise<void> {
    switch (command) {
        case SecretStorageQueueCommand.SAVE: {
            await Promise.resolve(payload)
                .then(saveToSecretStorage)
                .catch((e) => {
                    if (isError(e)) {
                        useLogger().error(e.message);
                    }
                });

            break;
        }
        case SecretStorageQueueCommand.DELETE: {
            await Promise.resolve(payload)
                .then(deleteFromSecretStorage)
                .catch((e) => {
                    if (isError(e)) {
                        useLogger().error(e.message);
                    }
                });
            break;
        }
    }
}
