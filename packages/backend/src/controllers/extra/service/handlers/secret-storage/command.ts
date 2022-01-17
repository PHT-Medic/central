/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import {
    PermissionID,
    ROBOT_SECRET_ENGINE_KEY,
    STATION_SECRET_ENGINE_KEY,
    SecretStorageCommand,
    ServiceID,
    USER_SECRET_ENGINE_KEY,
    VaultAPI,
    buildSecretStorageServiceKey,
    buildSecretStorageServicePayload,
    buildSecretStorageStationKey,
    buildSecretStorageStationPayload,
    buildSecretStorageUserKey,
    buildSecretStorageUserPayload,
    getSecretStorageServiceKey,
    getSecretStorageStationKey,
    getSecretStorageUserKey,
    isSecretStorageServiceKey,
    isSecretStorageStationKey,
    isSecretStorageUserKey,
    isService,
} from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { useTrapiClient } from '@trapi/client';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@typescript-error/http';
import { RobotEntity, UserEntity } from '@typescript-auth/server';
import { ExpressRequest, ExpressResponse } from '../../../../../config/http/type';
import { ExpressValidationError } from '../../../../../config/http/error/validation';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { UserSecretEntity } from '../../../../../domains/auth/user-secret/entity';
import { ApiKey } from '../../../../../config/api';

const commands = Object.values(SecretStorageCommand);

enum TargetEntity {
    USER = 'user',
    STATION = 'station',
    SERVICE = 'service',
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
        .custom((value) => isSecretStorageStationKey(value) || isSecretStorageUserKey(value))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const validationData = matchedData(req, { includeOptionals: true });

    let user : UserEntity | undefined;
    let station : StationEntity | undefined;

    const rawPath : string = validationData.name;

    let id : string | number | undefined;
    let type : TargetEntity | undefined;

    if (isSecretStorageStationKey(rawPath)) {
        if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
            throw new ForbiddenError();
        }

        const stationId : string = getSecretStorageStationKey(rawPath);

        const stationRepository = getRepository(StationEntity);
        const query = stationRepository.createQueryBuilder('station');

        const addSelection : string[] = [
            'secure_id',
            'public_key',
        ];

        addSelection.map((selection) => query.addSelect(`station.${selection}`));

        query.where('id = :id', { id: stationId });

        station = await query.getOne();
        if (typeof station === 'undefined') {
            throw new NotFoundError();
        }

        id = station.secure_id;
        type = TargetEntity.STATION;
    }

    if (isSecretStorageUserKey(rawPath)) {
        const userId = getSecretStorageUserKey(rawPath);

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

    if (isSecretStorageServiceKey(rawPath)) {
        if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
            throw new ForbiddenError();
        }

        const serviceID : string = getSecretStorageServiceKey(rawPath);

        if (!isService(serviceID)) {
            throw new NotImplementedError();
        }

        id = serviceID;
        type = TargetEntity.USER;
    }

    switch (command as SecretStorageCommand) {
        case SecretStorageCommand.ENGINE_CREATE:
            throw new NotImplementedError();
        case SecretStorageCommand.ENGINE_KEY_PULL: {
            try {
                let data: Record<string, string> = {};

                switch (type) {
                    case TargetEntity.STATION: {
                        const { data: responseData } = await useTrapiClient(ApiKey.VAULT)
                            .get(buildSecretStorageStationKey(id));

                        data = responseData.data.data;

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
                        const { data: responseData } = await useTrapiClient(ApiKey.VAULT)
                            .get(buildSecretStorageUserKey(id));

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
            let payload: Record<string, any> = {};

            switch (type) {
                case TargetEntity.STATION:
                    payload = buildSecretStorageStationPayload(station.public_key);
                    await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(STATION_SECRET_ENGINE_KEY, id.toString(), payload);
                    break;
                case TargetEntity.USER: {
                    const userSecrets = await getRepository(UserSecretEntity)
                        .find({
                            user_id: user.id,
                        });

                    payload = buildSecretStorageUserPayload(userSecrets);
                    await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(USER_SECRET_ENGINE_KEY, id.toString(), payload);
                    break;
                }
                case TargetEntity.SERVICE: {
                    const serviceClient = await getRepository(RobotEntity)
                        .findOne({
                            name: id as ServiceID,
                        });

                    payload = buildSecretStorageServicePayload(serviceClient.id, serviceClient.secret);
                    await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(ROBOT_SECRET_ENGINE_KEY, id.toString(), payload);
                }
            }

            return res.respondCreated();
        }
        case SecretStorageCommand.ENGINE_KEY_DROP: {
            try {
                switch (type) {
                    case TargetEntity.STATION: {
                        await useTrapiClient(ApiKey.VAULT)
                            .delete(buildSecretStorageStationKey(id));
                        break;
                    }
                    case TargetEntity.USER: {
                        await useTrapiClient(ApiKey.VAULT)
                            .delete(buildSecretStorageUserKey(id));
                        break;
                    }
                    case TargetEntity.SERVICE: {
                        await useTrapiClient(ApiKey.VAULT)
                            .delete(buildSecretStorageServiceKey(id));
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
