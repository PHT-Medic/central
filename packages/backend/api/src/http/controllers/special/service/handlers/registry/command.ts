/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, RegistryCommand,
} from '@personalhealthtrain/central-common';
import {
    BadRequestError,
    ForbiddenError,
} from '@typescript-error/http';
import { publishMessage } from 'amqp-extension';
import env from '../../../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import { setupRegistry } from '../../../../../../components/registry/handlers/setup';
import { RegistryQueueCommand, RegistryQueueEntityType, buildRegistryQueueMessage } from '../../../../../../domains/special/registry';
import {
    deleteStationFromRegistry,
    saveStationToRegistry,
} from '../../../../../../components/registry/handlers/entities/station';

const commands = Object.values(RegistryCommand);

export async function doRegistryCommand(req: ExpressRequest, res: ExpressResponse) {
    if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry service.');
    }

    const { id, command } = req.body;

    if (commands.indexOf(command) === -1) {
        throw new BadRequestError('The registry command is not valid.');
    }

    if (
        (
            command === RegistryCommand.STATION_SAVE ||
            command === RegistryCommand.STATION_DELETE
        ) &&
        typeof id !== 'string'
    ) {
        throw new BadRequestError(`An ID parameter is required for the registry command ${command}`);
    }
    switch (command) {
        case RegistryCommand.SETUP:
            if (env.env === 'test') {
                await setupRegistry();
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.SETUP,
                );
                await publishMessage(queueMessage);
            }
            break;
        case RegistryCommand.STATION_SAVE:
            if (env.env === 'test') {
                await saveStationToRegistry({
                    type: RegistryQueueEntityType.STATION,
                    id,
                });
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.SAVE,
                    {
                        type: RegistryQueueEntityType.STATION,
                        id,
                    },
                );
                await publishMessage(queueMessage);
            }
            break;
        case RegistryCommand.STATION_DELETE:
            if (env.env === 'test') {
                await deleteStationFromRegistry({
                    type: RegistryQueueEntityType.STATION,
                    id,
                });
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.DELETE,
                    {
                        type: RegistryQueueEntityType.STATION,
                        id,
                    },
                );
                await publishMessage(queueMessage);
            }
            break;
    }

    return res.respondAccepted();
}
