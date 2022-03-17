/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Message } from 'amqp-extension';
import { saveStationToRegistry } from './entities/station';
import { RegistryQueueEntityType, RegistryQueuePayload } from '../../../domains/special/registry';

export async function saveToRegistry(message: Message) {
    const payload : RegistryQueuePayload = message.data as RegistryQueuePayload;

    try {
        switch (payload.type) {
            case RegistryQueueEntityType.STATION:
                await saveStationToRegistry(payload);
                break;
        }
    } catch (e) {
        console.log(e);

        throw e;
    }
}
