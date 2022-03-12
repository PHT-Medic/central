/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import {
    PermissionID,
    STATION_SECRET_ENGINE_KEY,
    SecretStorageCommand,
    StationSecretStoragePayload,
    VaultAPI,
    getStationSecretStorageKey,
    getUserSecretsSecretStorageKey,
    isStationSecretStorageKey, isUserSecretsSecretStorageKey,
} from '@personalhealthtrain/central-common';
import { getRepository } from 'typeorm';
import { useClient } from '@trapi/client';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@typescript-error/http';
import { UserEntity } from '@authelion/api-core';
import { publishMessage } from 'amqp-extension';
import { ExpressRequest, ExpressResponse } from '../../../../../type';
import { ExpressValidationError } from '../../../../../express-validation';
import { StationEntity } from '../../../../../../domains/core/station/entity';
import { ApiKey } from '../../../../../../config/api';
import { buildSecretStorageQueueMessage } from '../../../../../../domains/special/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../../domains/special/secret-storage/constants';
import env from '../../../../../../env';
import {
    deleteStationFromSecretStorage,
    saveStationToSecretStorage,
} from '../../../../../../components/secret-storage/handlers/entities/station';
import {
    deleteUserSecretsFromSecretStorage,
    saveUserSecretsToSecretStorage,
} from '../../../../../../components/secret-storage/handlers/entities/user';

const commands = Object.values(SecretStorageCommand);

enum TargetEntity {
    USER = 'user',
    STATION = 'station',
}

export async function doSecretStorageCommand(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
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
        .custom((value) => isStationSecretStorageKey(value) || isUserSecretsSecretStorageKey(value))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const validationData = matchedData(req, { includeOptionals: true });

    const rawPath : string = validationData.name;

    let entity : { type: TargetEntity.USER, data: UserEntity } | { type: TargetEntity.STATION, data: StationEntity};

    if (isStationSecretStorageKey(rawPath)) {
        if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
            throw new ForbiddenError();
        }

        const stationId : string = getStationSecretStorageKey(rawPath);

        const stationRepository = getRepository(StationEntity);
        const query = stationRepository.createQueryBuilder('station')
            .addSelect('station.secure_id')
            .where('id = :id', { id: stationId });

        const data = await query.getOne();
        if (typeof data === 'undefined') {
            throw new NotFoundError();
        }

        entity = {
            type: TargetEntity.STATION,
            data,
        };
    } else if (isUserSecretsSecretStorageKey(rawPath)) {
        const userId = getUserSecretsSecretStorageKey(rawPath);

        if (
            !req.ability.hasPermission(PermissionID.USER_EDIT) &&
            userId !== req.userId
        ) {
            throw new ForbiddenError();
        }

        const userRepository = getRepository(UserEntity);

        const data = await userRepository.findOne(userId);

        if (typeof data === 'undefined') {
            throw new NotFoundError();
        }

        entity = {
            type: TargetEntity.USER,
            data,
        };
    } else if (
        !req.ability.hasPermission(PermissionID.SERVICE_MANAGE)
    ) {
        throw new ForbiddenError();
    }

    switch (command as SecretStorageCommand) {
        case SecretStorageCommand.ENGINE_CREATE: {
            await useClient<VaultAPI>(ApiKey.VAULT)
                .keyValue.createMount({
                    path: rawPath,
                });

            return res.respondCreated();
        }
        case SecretStorageCommand.ENGINE_KEY_PULL: {
            switch (entity.type) {
                case TargetEntity.STATION: {
                    const response = await useClient<VaultAPI>(ApiKey.VAULT)
                        .keyValue.find<StationSecretStoragePayload>(STATION_SECRET_ENGINE_KEY, entity.data.secure_id);

                    if (response) {
                        const { data } = response;

                        entity.data = getRepository(StationEntity).merge(entity.data, {
                            ...(data.rsa_public_key ? { public_key: data.rsa_public_key } : {}),
                            ...(data.registry_robot_id ? { registry_project_account_id: data.registry_robot_id } : {}),
                            ...(data.registry_robot_name ? { registry_project_account_name: data.registry_robot_name } : {}),
                            ...(data.registry_robot_secret ? { registry_project_account_token: data.registry_robot_secret } : {}),
                        });

                        await getRepository(StationEntity)
                            .save(entity.data);
                    }
                    break;
                }
                case TargetEntity.USER: {
                    throw new BadRequestError('User secrets pull is not supported.');
                }
            }

            return res.respond({ data: entity.data });
        }
        case SecretStorageCommand.ENGINE_KEY_SAVE: {
            switch (entity.type) {
                case TargetEntity.STATION: {
                    if (env.env === 'test') {
                        await saveStationToSecretStorage({
                            type: SecretStorageQueueEntityType.STATION,
                            id: entity.data.id,
                        });
                    } else {
                        const queueMessage = buildSecretStorageQueueMessage(
                            SecretStorageQueueCommand.SAVE,
                            {
                                type: SecretStorageQueueEntityType.STATION,
                                id: entity.data.id,
                            },
                        );

                        await publishMessage(queueMessage);
                    }
                    break;
                }
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
                case TargetEntity.STATION: {
                    if (env.env === 'test') {
                        await deleteStationFromSecretStorage({
                            type: SecretStorageQueueEntityType.STATION,
                            id: entity.data.id,
                        });
                    } else {
                        const queueMessage = buildSecretStorageQueueMessage(
                            SecretStorageQueueCommand.DELETE,
                            {
                                type: SecretStorageQueueEntityType.STATION,
                                id: entity.data.id,
                            },
                        );
                        await publishMessage(queueMessage);
                    }
                    break;
                }
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
