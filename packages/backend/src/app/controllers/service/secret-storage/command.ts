/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {check, matchedData, validationResult} from "express-validator";
import {
    APIType,
    buildSecretStorageStationKey,
    getSecretStorageStationKey,
    getSecretStorageUserKey,
    isSecretStorageStationKey,
    isSecretStorageUserKey,
    SecretStorageCommand,
    Station,
    useAPI,
    UserKeyRing
} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";

const commands = Object.values(SecretStorageCommand);

enum TargetEntity {
    USER = 'user',
    STATION = 'station'
}

export async function doSecretStorageCommand(req: any, res: any) {
    if(!req.ability.can('manage','service')) {
        return res._failForbidden({message: 'You are not permitted to manage the secret storage service.'});
    }

    const {command} = req.body;

    if(
        !command ||
        commands.indexOf(command) === -1
    ) {
        return res._failBadRequest({message: 'The secret storage command is not valid.'});
    }

    await check('name')
        .exists()
        .isString()
        .custom(value => isSecretStorageStationKey(value) || isSecretStorageUserKey(value))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});


    let userSecrets : UserKeyRing | undefined;
    let station : Station | undefined;

    let path : string = validationData.name;

    let type : TargetEntity | undefined;

    if(isSecretStorageStationKey(path)) {
        const stationId : string = getSecretStorageStationKey(path);

        const stationRepository = getRepository(Station);
        const query = stationRepository.createQueryBuilder('station');

        const addSelection : string[] = [
            'secure_id',
            'public_key'
        ];

        addSelection.map(selection => query.addSelect('station.'+selection));

        query.where('id = :id', {id: stationId});

        station = await query.getOne();
        if(typeof station === 'undefined') {
            return res._failNotFound();
        }

        path = buildSecretStorageStationKey(station.secure_id);
        type = TargetEntity.STATION;
    }

    if(isSecretStorageUserKey(path)) {
        const userId : string = getSecretStorageUserKey(path);

        const userKeyRingRepository = getRepository(UserKeyRing);

        userSecrets = await userKeyRingRepository.findOne({
            // tslint:disable-next-line:radix
            user_id: parseInt(userId)
        });

        if(typeof userSecrets === 'undefined') {
            return res._failNotFound();
        }

        type = TargetEntity.USER;
    }

    switch (command as SecretStorageCommand) {
        case SecretStorageCommand.ENGINE_CREATE:
            // todo: Implement
            return res._failNotFound();
        case SecretStorageCommand.ENGINE_KEY_PULL:
            try {
                const { data: responseData } = await useAPI(APIType.VAULT)
                    .get(path);

                const data : {
                    public_key?: string,
                    he_key?: string
                } = {}

                switch (type) {
                    case TargetEntity.STATION:
                        data.public_key = responseData.data.data.rsa_station_public_key;
                        break;
                    case TargetEntity.USER:
                        data.public_key = responseData.data.data.rsa_public_key;
                        data.he_key = responseData.data.data.he_key;
                        break;
                }

                return res._respond({data});
            } catch (e) {
                if(e.response.status === 404) {
                    return res._failNotFound();
                }

                throw e;
            }
        case SecretStorageCommand.ENGINE_KEY_SAVE:
            let payload : Record<string, any> = {};

            switch (type) {
                case TargetEntity.STATION:
                    payload = {
                        data: {
                            rsa_station_public_key: station.public_key
                        },
                        options: {
                            "cas": 1
                        }
                    };
                    break;
                case TargetEntity.USER:
                    payload = {
                        data: {
                            rsa_public_key: userSecrets.public_key,
                            he_key: userSecrets.he_key
                        },
                        options: {
                            "cas": 0
                        }
                    };
                    break;
            }

            await useAPI(APIType.VAULT)
                .post(path, payload);

            return res._respondCreated();
        case SecretStorageCommand.ENGINE_KEY_DROP:
            try {
                await useAPI(APIType.VAULT)
                    .delete(path);
            } catch (e) {
                if(e.response.status === 404) {
                    return;
                }

                throw e;
            }

            return res._respondDeleted();
    }
}
