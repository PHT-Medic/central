/*
 * Copyright (c) 2021-2022.
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
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import env from '../../../../../../env';
import { setupRegistry } from '../../../../../../components/registry/handlers/default';
import {
    RegistryQueueCommand,
    buildRegistryQueueMessage,
} from '../../../../../../domains/special/registry';
import {
    deleteRegistryProjectFromRemote,
    setupRegistryProjectForRemote,
} from '../../../../../../components/registry/handlers/project';
import { RegistryProjectEntity } from '../../../../../../domains/core/registry-project/entity';
import { RegistryEntity } from '../../../../../../domains/core/registry/entity';

const commands = Object.values(RegistryCommand);

export async function handleRegistryCommandRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry.');
    }

    const { id, command } = req.body;

    if (commands.indexOf(command) === -1) {
        throw new BadRequestError('The registry command is not valid.');
    }

    if (
        typeof id !== 'string'
    ) {
        throw new BadRequestError(`An ID parameter is required for the registry command ${command}`);
    }

    switch (command) {
        case RegistryCommand.SETUP:
        case RegistryCommand.DELETE: {
            const repository = getRepository(RegistryEntity);
            const entity = await repository.createQueryBuilder('registry')
                .addSelect([
                    'registry.address',
                    'registry.account_name',
                    'registry.account_token',
                ])
                .where('registryProject.id = :id', { id })
                .getOne();

            if (command === RegistryCommand.SETUP) {
                if (env.env === 'test') {
                    await setupRegistry({
                        entity,
                        entityId: entity.id,
                    });
                } else {
                    const queueMessage = buildRegistryQueueMessage(
                        RegistryQueueCommand.SETUP,
                        {
                            entity,
                            entityId: entity.id,
                        },
                    );
                    await publishMessage(queueMessage);
                }
            } else if (env.env === 'test') {
                // todo: implement registry deletion
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.DELETE,
                    {
                        entity,
                        entityId: entity.id,
                    },
                );

                await publishMessage(queueMessage);
            }
            break;
        }
        case RegistryCommand.PROJECT_SETUP:
        case RegistryCommand.PROJECT_DELETE: {
            const repository = getRepository(RegistryProjectEntity);
            const entity = await repository.createQueryBuilder('registryProject')
                .addSelect([
                    'registryProject.external_id',
                    'registryProject.account_id',
                    'registryProject.account_name',
                    'registryProject.account_token',
                    'registryProject.webhook_exists',
                    'registryProject.alias',
                ])
                .where('registryProject.id = :id', { id })
                .getOne();

            if (command === RegistryCommand.PROJECT_SETUP) {
                if (env.env === 'test') {
                    await setupRegistryProjectForRemote({
                        entityId: id,
                    });
                } else {
                    const queueMessage = buildRegistryQueueMessage(
                        RegistryQueueCommand.PROJECT_SETUP,
                        {
                            entityId: id,
                        },
                    );
                    await publishMessage(queueMessage);
                }
                break;
            } else if (env.env === 'test') {
                await deleteRegistryProjectFromRemote({
                    entity,
                    entityId: entity.id,
                });
            } else {
                const queueMessage = buildRegistryQueueMessage(
                    RegistryQueueCommand.PROJECT_DELETE,
                    {
                        entity,
                        entityId: entity.id,
                    },
                );
                await publishMessage(queueMessage);
            }
            break;
        }
    }

    return res.respondAccepted();
}
