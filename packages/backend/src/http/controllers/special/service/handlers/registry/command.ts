/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { body, matchedData, validationResult } from 'express-validator';
import {
    PermissionID, RegistryCommand,
} from '@personalhealthtrain/ui-common';
import {
    ForbiddenError,
} from '@typescript-error/http';
import { publishMessage } from 'amqp-extension';
import env from '../../../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import { ExpressValidationError } from '../../../../../express-validation';
import { setupRegistry } from '../../../../../../components/registry/handlers/setup';
import { RegistryQueueCommand, RegistryQueueEntityType } from '../../../../../../domains/special/registry/constants';
import { buildRegistryQueueMessage } from '../../../../../../domains/special/registry/queue';
import {
    deleteStationFromRegistry,
    saveStationToRegistry,
} from '../../../../../../components/registry/handlers/entities/station';

const commands = Object.values(RegistryCommand);

export async function doRegistryCommand(req: ExpressRequest, res: ExpressResponse) {
    if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry service.');
    }

    await body('id')
        .exists()
        .isString()
        .isLength({ min: 1, max: 256 })
        .run(req);

    await body('command')
        .exists()
        .custom((value) => commands.indexOf(value) !== -1)
        .run(req);

    const createValidation = validationResult(req);
    if (!createValidation.isEmpty()) {
        throw new ExpressValidationError(createValidation);
    }

    const match = matchedData(req, { includeOptionals: true });

    switch (match.command as RegistryCommand) {
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
                    id: match.id,
                });
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.SAVE,
                    {
                        type: RegistryQueueEntityType.STATION,
                        id: match.id,
                    },
                );
                await publishMessage(queueMessage);
            }
            break;
        case RegistryCommand.STATION_DELETE:
            if (env.env === 'test') {
                await deleteStationFromRegistry({
                    type: RegistryQueueEntityType.STATION,
                    id: match.id,
                });
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.DELETE,
                    {
                        type: RegistryQueueEntityType.STATION,
                        id: match.id,
                    },
                );
                await publishMessage(queueMessage);
            }
            break;
    }

    return res.respondAccepted();
}
