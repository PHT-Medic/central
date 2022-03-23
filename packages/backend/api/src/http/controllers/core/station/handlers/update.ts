import {
    PermissionID,
    isHex,
} from '@personalhealthtrain/central-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@authelion/common';
import { runStationValidation } from './utils';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

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
        .addSelect([
            'station.registry_project_id',
            'station.registry_project_account_id',
            'station.registry_project_account_name',
            'station.registry_project_account_token',
            'station.registry_project_webhook_exists',
            'station.public_key',
            'station.secure_id',
        ])
        .where('station.id = :id', { id });

    let entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError('You are not permitted to delete this station.');
    }

    if (
        data.public_key &&
        data.public_key !== entity.public_key &&
        !isHex(data.public_key)
    ) {
        data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
    }

    entity = repository.merge(entity, data);

    await repository.save(entity);

    return res.respondAccepted({
        data: entity,
    });
}
