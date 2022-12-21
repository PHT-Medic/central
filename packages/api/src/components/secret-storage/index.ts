/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConsumeHandler, Message } from 'amqp-extension';
import { saveToSecretStorage } from './handlers/save';
import { deleteFromSecretStorage } from './handlers/delete';
import { SecretStorageQueueCommand } from '../../domains/special/secret-storage/constants';

export function createSecretStorageComponentHandlers() : Record<SecretStorageQueueCommand, ConsumeHandler> {
    return {
        [SecretStorageQueueCommand.SAVE]: async (message: Message) => {
            await saveToSecretStorage(message);
        },
        [SecretStorageQueueCommand.DELETE]: async (message: Message) => {
            await deleteFromSecretStorage(message);
        },
    };
}
