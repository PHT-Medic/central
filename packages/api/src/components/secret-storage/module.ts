/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isError } from '@personalhealthtrain/central-common';
import { useLogger } from '../../config';
import type { SecretStorageCommandContext } from './type';
import { deleteFromSecretStorage, saveToSecretStorage } from './handlers';
import { SecretStorageCommand } from './constants';

export async function executeSecretStorageComponentCommand(context: SecretStorageCommandContext) : Promise<void> {
    switch (context.command) {
        case SecretStorageCommand.SAVE: {
            await Promise.resolve(context.data)
                .then(saveToSecretStorage)
                .catch((e) => {
                    if (isError(e)) {
                        useLogger().error(e.message);
                    }
                });

            break;
        }
        case SecretStorageCommand.DELETE: {
            await Promise.resolve(context.data)
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
