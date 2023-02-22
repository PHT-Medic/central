/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    PermissionID, RegistryAPICommand,
} from '@personalhealthtrain/central-common';
import {
    BadRequestError,
    ForbiddenError,
} from '@ebec/http';
import { useRequestBody } from '@routup/body';
import { publish } from 'amqp-extension';
import type { Request, Response } from 'routup';
import { sendAccepted } from 'routup';
import { useDataSource } from 'typeorm-extension';
import { useRequestEnv } from '../../../../../request';
import { useEnv, useLogger } from '../../../../../../config';
import {
    linkRegistryProject,
    setupRegistry,
    unlinkRegistryProject,
} from '../../../../../../components';
import {
    RegistryQueueCommand,
    buildRegistryPayload,
} from '../../../../../../domains/special/registry';
import { RegistryProjectEntity } from '../../../../../../domains/core/registry-project/entity';
import { RegistryEntity } from '../../../../../../domains/core/registry/entity';

const commands = Object.values(RegistryAPICommand);

export async function handleRegistryCommandRouteHandler(req: Request, res: Response) : Promise<any> {
    const ability = useRequestEnv(req, 'ability');

    if (!ability.has(PermissionID.REGISTRY_MANAGE)) {
        throw new ForbiddenError('You are not permitted to manage the registry.');
    }

    const { id, command } = useRequestBody(req);

    if (commands.indexOf(command) === -1) {
        throw new BadRequestError('The registry command is not valid.');
    }

    if (typeof id !== 'string') {
        throw new BadRequestError(`An ID parameter is required for the registry command ${command}`);
    }

    const dataSource = await useDataSource();

    switch (command) {
        case RegistryAPICommand.SETUP:
        case RegistryAPICommand.DELETE: {
            const repository = dataSource.getRepository(RegistryEntity);
            const entity = await repository.createQueryBuilder('registry')
                .addSelect([
                    'registry.account_secret',
                ])
                .where('registry.id = :id', { id })
                .getOne();

            if (command === RegistryAPICommand.SETUP) {
                if (useEnv('env') === 'test') {
                    await setupRegistry({
                        id: entity.id,
                        entity,
                    });
                } else {
                    useLogger().info('Submitting setup registry command.');
                    const queueMessage = buildRegistryPayload({
                        command: RegistryQueueCommand.SETUP,
                        data: {
                            id: entity.id,
                            entity,
                        },
                    });
                    await publish(queueMessage);
                }
            } else {
                useLogger().info('Submitting delete registry command.');

                const queueMessage = buildRegistryPayload({
                    command: RegistryQueueCommand.DELETE,
                    data: {
                        id: entity.id,
                        entity,
                    },
                });

                await publish(queueMessage);
            }
            break;
        }
        case RegistryAPICommand.PROJECT_LINK:
        case RegistryAPICommand.PROJECT_UNLINK: {
            const repository = dataSource.getRepository(RegistryProjectEntity);
            const entity = await repository.createQueryBuilder('registryProject')
                .addSelect([
                    'registryProject.account_secret',
                ])
                .where('registryProject.id = :id', { id })
                .getOne();

            if (command === RegistryAPICommand.PROJECT_LINK) {
                if (useEnv('env') === 'test') {
                    await linkRegistryProject({
                        id: entity.id,
                        entity,
                    });
                } else {
                    const queueMessage = buildRegistryPayload({
                        command: RegistryQueueCommand.PROJECT_LINK,
                        data: {
                            id: entity.id,
                            entity,
                        },
                    });
                    await publish(queueMessage);
                }
                break;
            } else if (useEnv('env') === 'test') {
                await unlinkRegistryProject({
                    id: entity.id,
                    registryId: entity.registry_id,
                    externalName: entity.external_name,
                    accountId: entity.account_id,
                    updateDatabase: true,
                });
            } else {
                const queueMessage = buildRegistryPayload({
                    command: RegistryQueueCommand.PROJECT_UNLINK,
                    data: {
                        id: entity.id,
                        registryId: entity.registry_id,
                        externalName: entity.external_name,
                        accountId: entity.account_id,
                        updateDatabase: true,
                    },
                });
                await publish(queueMessage);
            }
            break;
        }
    }

    sendAccepted(res);
}
