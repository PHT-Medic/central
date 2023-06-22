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
import { buildRegistryPayload } from '../../../../../../components/registry/utils/queue';
import { useRequestEnv } from '../../../../../request';
import { useEnv, useLogger } from '../../../../../../config';
import {
    RegistryCommand,
} from '../../../../../../components';
import { RegistryProjectEntity } from '../../../../../../domains/registry-project/entity';
import { RegistryEntity } from '../../../../../../domains/registry/entity';

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

    if (useEnv('env') === 'test') {
        sendAccepted(res);
        return;
    }

    const dataSource = await useDataSource();

    switch (command) {
        case RegistryAPICommand.SETUP:
        case RegistryAPICommand.CLEANUP:
        case RegistryAPICommand.DELETE: {
            const repository = dataSource.getRepository(RegistryEntity);
            const entity = await repository.createQueryBuilder('registry')
                .addSelect([
                    'registry.account_secret',
                ])
                .where('registry.id = :id', { id })
                .getOne();

            if (command === RegistryAPICommand.SETUP) {
                useLogger().info('Submitting setup registry command.');

                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.SETUP,
                    data: {
                        id: entity.id,
                    },
                });

                await publish(queueMessage);
            } else if (command === RegistryAPICommand.DELETE) {
                useLogger().info('Submitting delete registry command.');

                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.DELETE,
                    data: {
                        id: entity.id,
                    },
                });

                await publish(queueMessage);
            } else {
                useLogger().info('Submitting cleanup registry command.');

                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.CLEANUP,
                    data: {
                        id: entity.id,
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
                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.PROJECT_LINK,
                    data: {
                        id: entity.id,
                    },
                });
                await publish(queueMessage);
            } else {
                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.PROJECT_UNLINK,
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
