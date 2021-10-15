/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";

import {
    isPermittedForResourceRealm,
    findStationVaultPublicKey,
    deleteStationVaultPublicKey,
    saveStationVaultPublicKey,
    Station
} from "@personalhealthtrain/ui-common";

export enum StationTask {
    CHECK_VAULT = 'checkVault',

    SAVE_VAULT_PUBLIC_KEY = 'saveVaultPublicKey',
    DROP_VAULT_PUBLIC_KEY = 'dropVaultPublicKey'
}

export async function doStationTaskRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if(!req.ability.can('edit', 'station')) {
        return res._failBadRequest();
    }

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(Object.values(StationTask))
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Station);

    const query = repository.createQueryBuilder('station');

    const addSelection : string[] = [
        'secure_id',
        'public_key',
        'vault_public_key_saved'
    ];

    addSelection.map(selection => query.addSelect('station.'+selection));

    query.where('id = :id', {id});

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        return res._failForbidden();
    }

    if(!req.ability.can('edit', 'station')) {
        return res._failForbidden();
    }

    switch (validationData.task) {
        case StationTask.CHECK_VAULT:
            try {
                const publicKey = await findStationVaultPublicKey(entity.id);

                console.log('Public key loaded from vault: ' + publicKey);

                if(typeof publicKey !== 'undefined') {
                    const { content }  = publicKey;

                    entity.vault_public_key_saved = true;
                    entity.public_key = content;
                }

                await repository.save(entity);

                return res._respondAccepted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case StationTask.SAVE_VAULT_PUBLIC_KEY:
            try {
                await saveStationVaultPublicKey(entity.secure_id, entity.public_key);

                entity.vault_public_key_saved = true;

                await repository.save(entity);

                return res._respond({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        case StationTask.DROP_VAULT_PUBLIC_KEY:
            try {
                await deleteStationVaultPublicKey(entity.secure_id);

                entity.vault_public_key_saved = false;

                await repository.save(entity);

                return res._respondDeleted({data: entity});
            } catch (e) {
                return res._failBadRequest({message: e.message});
            }
        default:
            return res._failBadRequest({message: 'The task type is not valid...'})
    }
}
