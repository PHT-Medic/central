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
import { getRepository } from 'typeorm';
import env from '../../../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import { setupRegistry } from '../../../../../../components/registry/handlers/setup';
import { RegistryQueueCommand, RegistryQueueEntityType, buildRegistryQueueMessage } from '../../../../../../domains/special/registry';
import {
    deleteStationFromRegistry,
    saveStationToRegistry,
} from '../../../../../../components/registry/handlers/entities/station';
import { StationEntity } from '../../../../../../domains/core/station/entity';

const commands = Object.values(RegistryCommand);

export async function runRegistryCommandRouteHandler(req: ExpressRequest, res: ExpressResponse) {
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
        case RegistryCommand.STATION_DELETE: {
            const repository = getRepository(StationEntity);
            const entity = await repository.createQueryBuilder('station')
                .addSelect('station.secure_id')
                .addSelect('station.registry_project_id')
                .addSelect('station.registry_project_account_id')
                .where({
                    id,
                })
                .getOne();

            if (env.env === 'test') {
                await deleteStationFromRegistry({
                    type: RegistryQueueEntityType.STATION,
                    id: entity.id,
                    secure_id: entity.secure_id,
                    registry_project_id: entity.registry_project_id,
                    registry_project_account_id: entity.registry_project_account_id,
                });
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.DELETE,
                    {
                        type: RegistryQueueEntityType.STATION,
                        id: entity.id,
                        secure_id: entity.secure_id,
                        registry_project_id: entity.registry_project_id,
                        registry_project_account_id: entity.registry_project_account_id,
                    },
                );
                await publishMessage(queueMessage);
            }
            break;
        }
    }

    return res.respondAccepted();
}
