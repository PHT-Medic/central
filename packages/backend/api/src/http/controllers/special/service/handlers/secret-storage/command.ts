/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import {
    PermissionID,
    SecretStorageCommand,
    getUserSecretsSecretStorageKey,
    isUserSecretsSecretStorageKey,
} from '@personalhealthtrain/central-common';
import { useClient } from 'hapic';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@ebec/http';
import { UserEntity } from '@authelion/server-core';
import { publishMessage } from 'amqp-extension';
import { Client as VaultClient } from '@hapic/vault';
import { useDataSource } from 'typeorm-extension';
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import { ExpressValidationError } from '../../../../../express-validation';
import { ApiKey } from '../../../../../../config';
import { buildSecretStorageQueueMessage } from '../../../../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../../domains/special/secret-storage/constants';
import env from '../../../../../../env';
import {
    deleteUserSecretsFromSecretStorage,
    saveUserSecretsToSecretStorage,
} from '../../../../../../components/secret-storage/handlers/entities/user';

const commands = Object.values(SecretStorageCommand);

enum TargetEntity {
    USER = 'user',
}

export async function handleSecretStorageCommandRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { command } = req.body;

    if (
        !command ||
        commands.indexOf(command) === -1
    ) {
        throw new BadRequestError('The secret storage command is not valid.');
    }

    await check('name')
        .exists()
        .isString()
        .custom((value) => isUserSecretsSecretStorageKey(value))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const validationData = matchedData(req, { includeOptionals: true });

    const rawPath : string = validationData.name;

    let entity : { type: TargetEntity.USER, data: UserEntity };

    if (isUserSecretsSecretStorageKey(rawPath)) {
        const userId = getUserSecretsSecretStorageKey(rawPath);

        if (
            !req.ability.has(PermissionID.USER_EDIT) &&
            userId !== req.userId
        ) {
            throw new ForbiddenError();
        }

        const dataSource = await useDataSource();
        const userRepository = dataSource.getRepository(UserEntity);

        const data = await userRepository.findOneBy({ id: userId });

        if (!data) {
            throw new NotFoundError();
        }

        entity = {
            type: TargetEntity.USER,
            data,
        };
    } else if (
        !req.ability.has(PermissionID.SERVICE_MANAGE)
    ) {
        throw new ForbiddenError();
    }

    switch (command as SecretStorageCommand) {
        case SecretStorageCommand.ENGINE_CREATE: {
            await useClient<VaultClient>(ApiKey.VAULT)
                .keyValue.createMount({
                    path: rawPath,
                });

            return res.respondCreated();
        }
        case SecretStorageCommand.ENGINE_KEY_PULL: {
            switch (entity.type) {
                case TargetEntity.USER: {
                    throw new BadRequestError('User secrets pull is not supported.');
                }
            }

            return res.respond({ data: entity.data });
        }
        case SecretStorageCommand.ENGINE_KEY_SAVE: {
            switch (entity.type) {
                case TargetEntity.USER: {
                    if (env.env === 'test') {
                        await saveUserSecretsToSecretStorage({
                            type: SecretStorageQueueEntityType.USER_SECRETS,
                            id: entity.data.id,
                        });
                    } else {
                        const queueMessage = buildSecretStorageQueueMessage(
                            SecretStorageQueueCommand.SAVE,
                            {
                                type: SecretStorageQueueEntityType.USER_SECRETS,
                                id: entity.data.id,
                            },
                        );
                        await publishMessage(queueMessage);
                    }
                    break;
                }
            }

            return res.respondCreated();
        }
        case SecretStorageCommand.ENGINE_KEY_DROP: {
            switch (entity.type) {
                case TargetEntity.USER: {
                    if (env.env === 'test') {
                        await deleteUserSecretsFromSecretStorage({
                            type: SecretStorageQueueEntityType.USER_SECRETS,
                            id: entity.data.id,
                        });
                    } else {
                        const queueMessage = buildSecretStorageQueueMessage(
                            SecretStorageQueueCommand.DELETE,
                            {
                                type: SecretStorageQueueEntityType.USER_SECRETS,
                                id: entity.data.id,
                            },
                        );
                        await publishMessage(queueMessage);
                    }
                    break;
                }
            }

            return res.respondDeleted();
        }
    }

    throw new NotImplementedError();
}
