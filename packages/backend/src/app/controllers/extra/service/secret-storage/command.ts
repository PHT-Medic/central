/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import {
    APIType,
    Client,
    PermissionID,
    SERVICE_ID,
    STATION_SECRET_ENGINE_KEY,
    SecretStorageCommand,
    SecretType,
    Station,
    User,
    UserSecret,
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
    isService, saveToSecretEngine, useAPI,
} from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@typescript-error/http';
import { ExpressRequest, ExpressResponse } from '../../../../../config/http/type';
import { ExpressValidationError } from '../../../../../config/http/error/validation';

const commands = Object.values(SecretStorageCommand);

enum TargetEntity {
    USER = 'user',
    STATION = 'station',
    SERVICE = 'service',
}

export async function doSecretStorageCommand(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { command } = req.body;

    if (
        !command
        || commands.indexOf(command) === -1
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

    let user : User | undefined;
    let station : Station | undefined;

    const rawPath : string = validationData.name;

    let id : string | number | undefined;
    let type : TargetEntity | undefined;

    if (isSecretStorageStationKey(rawPath)) {
        if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
            throw new ForbiddenError();
        }

        const stationId : string = getSecretStorageStationKey(rawPath);

        const stationRepository = getRepository(Station);
        const query = stationRepository.createQueryBuilder('station');

        const addSelection : string[] = [
            'secure_id',
            'public_key',
            'vault_public_key_saved',
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
        const userId = parseInt(getSecretStorageUserKey(rawPath), 10);

        if (
            !req.ability.hasPermission(PermissionID.USER_EDIT)
            && userId !== req.userId
        ) {
            throw new ForbiddenError();
        }

        const userRepository = getRepository(User);

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
                const data: {
                    [K in SecretType]?: string
                } = {};

                switch (type) {
                    case TargetEntity.STATION: {
                        const { data: responseData } = await useAPI(APIType.VAULT)
                            .get(buildSecretStorageStationKey(id));

                        data[SecretType.RSA_PUBLIC_KEY] = responseData.data.data[SecretType.RSA_PUBLIC_KEY];
                        break;
                    }

                    case TargetEntity.USER: {
                        const { data: responseData } = await useAPI(APIType.VAULT)
                            .get(buildSecretStorageUserKey(id));

                        data[SecretType.RSA_PUBLIC_KEY] = responseData.data.data[SecretType.RSA_PUBLIC_KEY];
                        data[SecretType.PAILLIER_PUBLIC_KEY] = responseData.data.data[SecretType.PAILLIER_PUBLIC_KEY];
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
                    break;
                case TargetEntity.USER: {
                    const userSecrets = await getRepository(UserSecret)
                        .find({
                            user_id: user.id,
                        });

                    payload = buildSecretStorageUserPayload(userSecrets);
                    break;
                }
                case TargetEntity.SERVICE: {
                    const serviceClient = await getRepository(Client)
                        .findOne({
                            service_id: id as SERVICE_ID,
                        });

                    payload = buildSecretStorageServicePayload(serviceClient.id, serviceClient.secret);
                }
            }

            await saveToSecretEngine(STATION_SECRET_ENGINE_KEY, id.toString(), payload);

            return res.respondCreated();
        }
        case SecretStorageCommand.ENGINE_KEY_DROP: {
            try {
                switch (type) {
                    case TargetEntity.STATION: {
                        await useAPI(APIType.VAULT)
                            .delete(buildSecretStorageStationKey(id));
                        break;
                    }
                    case TargetEntity.USER: {
                        await useAPI(APIType.VAULT)
                            .delete(buildSecretStorageUserKey(id));
                        break;
                    }
                    case TargetEntity.SERVICE: {
                        await useAPI(APIType.VAULT)
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
