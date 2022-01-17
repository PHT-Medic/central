import { getRepository } from 'typeorm';
import { PermissionID } from '@personalhealthtrain/ui-common';
import {
    applyFields, applyFilters, applyPagination, applyRelations,
} from 'typeorm-extension';
import { NotFoundError } from '@typescript-error/http';
import { StationEntity } from '../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';

export async function getOneStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { fields } = req.query;

    const repository = getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .where('station.id = :id', { id });

    if (
        req.ability.hasPermission(PermissionID.STATION_EDIT)
    ) {
        applyFields(query, fields, {
            allowed: [
                'secure_id',
                'public_key',
                'email',
                'registry_project_account_name',
                'registry_project_account_token',
                'registry_project_id',
                'registry_project_webhook_exists',
            ],
            defaultAlias: 'station',
        });
    }

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, fields, includes,
    } = req.query;

    const repository = getRepository(StationEntity);
    const query = repository.createQueryBuilder('station');

    applyRelations(query, includes, {
        defaultAlias: 'station',
        allowed: ['realm'],
    });

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'realm_id'],
        defaultAlias: 'station',
    });

    if (
        req.ability.hasPermission(PermissionID.STATION_EDIT)
    ) {
        applyFields(query, fields, {
            allowed: [
                'secure_id',
                'public_key',
                'email',
                'registry_project_account_name',
                'registry_project_account_token',
                'registry_project_id',
                'registry_project_webhook_exists',
            ],
            defaultAlias: 'station',
        });
    }

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        },
    });
}
