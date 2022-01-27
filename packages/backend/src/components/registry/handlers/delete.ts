/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { deleteStationFromRegistry } from './entities/station';
import { RegistryQueuePayload } from '../../../domains/special/registry/type';
import { RegistryQueueEntityType } from '../../../domains/special/registry/constants';

export async function deleteFromRegistry(message: Message) {
    const payload: RegistryQueuePayload = message.data as RegistryQueuePayload;

    switch (payload.type) {
        case RegistryQueueEntityType.STATION:
            await deleteStationFromRegistry(payload);
            break;
    }
}
