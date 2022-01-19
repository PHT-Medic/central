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
    Station,
    VaultAPI,
    buildStationSecretStorageKey,
    buildUserSecretsSecretStorageKey,
    getStationSecretStorageKey,
    getUserSecretsSecretStorageKey, isStationSecretStorageKey, isUserSecretsSecretStorageKey,
} from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { useTrapiClient } from '@trapi/client';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@typescript-error/http';
import { UserEntity } from '@typescript-auth/server';
import { publishMessage } from 'amqp-extension';
import { User } from '@typescript-auth/domains';
import { ExpressRequest, ExpressResponse } from '../../../../../config/http/type';
import { ExpressValidationError } from '../../../../../config/http/error/validation';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ApiKey } from '../../../../../config/api';
import { buildSecretStorageQueueMessage } from '../../../../../domains/extra/secret-storage/queue';
import {
    SecretStorageQueueCommand,
    SecretStorageQueueEntityType,
} from '../../../../../domains/extra/secret-storage/constants';

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

    let user : UserEntity | undefined;
    let station : StationEntity | undefined;

    const rawPath : string = validationData.name;

    let id : Station['id'] | User['id'] | undefined;
    let type : TargetEntity | undefined;

    if (isStationSecretStorageKey(rawPath)) {
        if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
            throw new ForbiddenError();
        }

        const stationId : string = getStationSecretStorageKey(rawPath);

        const stationRepository = getRepository(StationEntity);
        const query = stationRepository.createQueryBuilder('station')
            .where('id = :id', { id: stationId });

        station = await query.getOne();
        if (typeof station === 'undefined') {
            throw new NotFoundError();
        }

        id = station.id;
        type = TargetEntity.STATION;
    }

    if (isUserSecretsSecretStorageKey(rawPath)) {
        const userId = getUserSecretsSecretStorageKey(rawPath);

        if (
            !req.ability.hasPermission(PermissionID.USER_EDIT) &&
            userId !== req.userId
        ) {
            throw new ForbiddenError();
        }

        const userRepository = getRepository(UserEntity);

        user = await userRepository.findOne(userId);

        if (typeof user === 'undefined') {
            throw new NotFoundError();
        }

        id = userId;
        type = TargetEntity.USER;
    }

    switch (command as SecretStorageCommand) {
        case SecretStorageCommand.ENGINE_CREATE: {
            // todo: check response
            const response = await useTrapiClient<VaultAPI>(ApiKey.VAULT)
                .keyValue.createMount({
                    path: rawPath,
                });

            return res.respond({
                data: response,
            });
        }
        case SecretStorageCommand.ENGINE_KEY_PULL: {
            try {
                let data: Record<string, string> = {};

                switch (type) {
                    case TargetEntity.STATION: {
                        // todo: check response
                        const { data: responseData } = await useTrapiClient<VaultAPI>(ApiKey.VAULT)
                            .keyValue.find(STATION_SECRET_ENGINE_KEY, station.secure_id);

                        data = responseData.data;

                        if (
                            station &&
                            station.id &&
                            data.rsa_station_public_key
                        ) {
                            await getRepository(StationEntity)
                                .update({
                                    id: station.id,
                                }, {
                                    public_key: data.rsa_station_public_key,
                                });
                        }
                        break;
                    }

                    case TargetEntity.USER: {
                        const { data: responseData } = await useTrapiClient<VaultAPI>(ApiKey.VAULT)
                            .get(buildUserSecretsSecretStorageKey(id));

                        data = responseData.data.data;
                        break;
                    }
                }

                return res.respond({ data });
            } catch (e) {
                if (e.response.status === 404) {
                    throw new NotFoundError();
                }

                throw e;
            }
        }
        case SecretStorageCommand.ENGINE_KEY_SAVE: {
            switch (type) {
                case TargetEntity.STATION: {
                    const queueMessage = buildSecretStorageQueueMessage(
                        SecretStorageQueueCommand.SAVE,
                        {
                            type: SecretStorageQueueEntityType.STATION,
                            id,
                        },
                    );
                    await publishMessage(queueMessage);
                    break;
                }
                case TargetEntity.USER: {
                    const queueMessage = buildSecretStorageQueueMessage(
                        SecretStorageQueueCommand.SAVE,
                        {
                            type: SecretStorageQueueEntityType.USER_SECRETS,
                            id,
                        },
                    );
                    await publishMessage(queueMessage);
                    break;
                }
            }

            return res.respondCreated();
        }
        case SecretStorageCommand.ENGINE_KEY_DROP: {
            try {
                switch (type) {
                    case TargetEntity.STATION: {
                        const queueMessage = buildSecretStorageQueueMessage(
                            SecretStorageQueueCommand.DELETE,
                            {
                                type: SecretStorageQueueEntityType.STATION,
                                id,
                            },
                        );
                        await publishMessage(queueMessage);

                        break;
                    }
                    case TargetEntity.USER: {
                        const queueMessage = buildSecretStorageQueueMessage(
                            SecretStorageQueueCommand.DELETE,
                            {
                                type: SecretStorageQueueEntityType.USER_SECRETS,
                                id,
                            },
                        );
                        await publishMessage(queueMessage);
                        break;
                    }
                }
            } catch (e) {
                if (e.response.status === 404) {
                    return res.respondDeleted();
                }

                throw e;
            }

            return res.respondDeleted();
        }
    }

    throw new NotImplementedError();
}
