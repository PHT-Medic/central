import { SelectQueryBuilder, getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import {
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applyRelations, applySort,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { parseQueryFields } from '@trapi/query';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

function checkAndApplyFields(req: ExpressRequest, query: SelectQueryBuilder<any>, fields: any) {
    const protectedFields = [
        'account_secret',
    ];

    const fieldsParsed = parseQueryFields(fields, {
        allowed: [
            'id',
            'name',
            'address',
            'ecosystem',
            'created_at',
            'updated_at',
            ...protectedFields,
        ],
        defaultAlias: 'registry',
    });

    const protectedSelected = fieldsParsed
        .filter((field) => field.alias === 'registry' &&
            protectedFields.indexOf(field.key) !== -1);

    if (protectedSelected.length > 0) {
        if (
            !req.ability.hasPermission(PermissionID.REGISTRY_MANAGE)
        ) {
            throw new ForbiddenError(
                `You are not permitted to read the restricted fields: ${
                    protectedSelected.map((field) => field.key).join(', ')}`,
            );
        }
    }

    applyQueryFieldsParseOutput(query, fieldsParsed);
}

export async function getOneRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include, fields } = req.query;

    const repository = getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry')
        .where('registry.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'registry',
        allowed: ['realm'],
    });

    checkAndApplyFields(req, query, fields);

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        throw new ForbiddenError();
    }

    return res.respond({ data: entity });
}

export async function getManyRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = req.query;

    const repository = getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry');

    onlyRealmPermittedQueryResources(query, req.realmId, 'registry.realm_id');

    checkAndApplyFields(req, query, fields);

    applyFilters(query, filter, {
        defaultAlias: 'registry',
        allowed: ['id', 'ecosystem', 'realm_id', 'name'],
    });

    applySort(query, sort, {
        defaultAlias: 'registry',
        allowed: ['id', 'updated_at', 'created_at'],
    });

    applyRelations(query, include, {
        defaultAlias: 'registry',
        allowed: ['realm'],
    });

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
