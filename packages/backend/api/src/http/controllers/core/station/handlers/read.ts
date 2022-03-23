import { SelectQueryBuilder, getRepository } from 'typeorm';
import { PermissionID } from '@personalhealthtrain/central-common';
import {
    parseQueryFields,
} from '@trapi/query';
import {
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applyRelations,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import { StationEntity } from '../../../../../domains/core/station/entity';
import { ExpressRequest, ExpressResponse } from '../../../../type';

async function checkAndApplyFields(req: ExpressRequest, query: SelectQueryBuilder<any>, fields: any) {
    const protectedFields = [
        'public_key',
        'email',
    ];

    const fieldsParsed = parseQueryFields(fields, {
        allowed: [
            'id',
            'name',
            'created_at',
            'updated_at',
            ...protectedFields,
        ],
        defaultAlias: 'station',
    });

    const protectedSelected = fieldsParsed
        .filter((field) => field.alias === 'station' && protectedFields.indexOf(field.key) !== -1);

    if (protectedSelected.length > 0) {
        if (
            !req.ability.hasPermission(PermissionID.STATION_EDIT)
        ) {
            throw new ForbiddenError(
                `You are not permitted to read the restricted fields: ${
                    protectedSelected.map((field) => field.key).join(', ')}`,
            );
        }

        onlyRealmPermittedQueryResources(query, req.realmId, 'station.realm_id');
    }

    applyQueryFieldsParseOutput(query, fieldsParsed);
}

export async function getOneStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { fields } = req.query;

    const repository = getRepository(StationEntity);
    const query = repository.createQueryBuilder('station')
        .where('station.id = :id', { id });

    await checkAndApplyFields(req, query, fields);

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
        allowed: ['realm', 'registry_project', 'registry'],
    });

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'hidden', 'realm_id'],
        defaultAlias: 'station',
    });

    await checkAndApplyFields(req, query, fields);

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
