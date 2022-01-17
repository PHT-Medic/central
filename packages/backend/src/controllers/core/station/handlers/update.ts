import {
    HarborAPI,
    PermissionID,
    STATION_SECRET_ENGINE_KEY,
    VaultAPI,
    buildSecretStorageStationPayload,
    isHex,
} from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { buildRegistryStationProjectName } from '@personalhealthtrain/ui-common/dist/domains/core/station/registry';
import { useTrapiClient } from '@trapi/client';
import { runStationValidation } from './utils';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ApiKey } from '../../../../config/api';

export async function updateStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
        throw new ForbiddenError();
    }

    const data = await runStationValidation(req, 'update');
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .addSelect('station.secure_id')
        .addSelect('station.public_key')
        .where('station.id = :id', { id });

    let entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        data.public_key &&
        data.public_key !== entity.public_key &&
        !isHex(data.public_key)
    ) {
        data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
    }

    if (typeof data.secure_id === 'string') {
        // secure id changed -> remove vault project
        if (data.secure_id !== entity.secure_id) {
            try {
                const name = buildRegistryStationProjectName(entity.secure_id);
                await useTrapiClient<HarborAPI>(ApiKey.HARBOR).project.delete(name, true);
            } catch (e) {
                // ...
            }

            try {
                await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.delete(STATION_SECRET_ENGINE_KEY, entity.secure_id);
            } catch (e) {
                // ...
            }
        }
    }

    entity = repository.merge(entity, data);

    if (entity.public_key) {
        const payload = buildSecretStorageStationPayload(entity.public_key);
        await useTrapiClient<VaultAPI>(ApiKey.VAULT).keyValue.save(STATION_SECRET_ENGINE_KEY, entity.secure_id, payload);
    }

    const result = await repository.save(entity);

    return res.respondAccepted({
        data: result,
    });
}
