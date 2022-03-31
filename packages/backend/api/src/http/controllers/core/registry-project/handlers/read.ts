import { SelectQueryBuilder, getRepository } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@authelion/api-core';
import {
    applyFields,
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applyRelations, applySort,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { isPermittedForResourceRealm } from '@authelion/common';
import { parseQueryFields } from '@trapi/query';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';

function checkAndApplyFields(req: ExpressRequest, query: SelectQueryBuilder<any>, fields: any) {
    const protectedFields = [
        'account_secret',
    ];

    const fieldsParsed = parseQueryFields(fields, {
        allowed: [
            'id',
            'name',
            'ecosystem',
            'external_name',
            'type',
            'realm_id',
            'registry_id',
            'webhook_exists',
            'created_at',
            'updated_at',
            ...protectedFields,
        ],
        defaultAlias: 'registryProject',
    });

    const protectedSelected = fieldsParsed
        .filter((field) => field.alias === 'registryProject' &&
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

export async function getOneRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include, fields } = req.query;

    const repository = getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject')
        .where('registryProject.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'registryProject',
        allowed: ['realm', 'registry'],
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

export async function getManyRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = req.query;

    const repository = getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject');

    onlyRealmPermittedQueryResources(query, req.realmId, 'registryProject.realm_id');

    checkAndApplyFields(req, query, fields);

    applyFilters(query, filter, {
        defaultAlias: 'registryProject',
        allowed: ['id', 'ecosystem', 'name', 'registry_id', 'external_name', 'type'],
    });

    applySort(query, sort, {
        defaultAlias: 'registryProject',
        allowed: ['id', 'ecosystem', 'updated_at', 'created_at'],
    });

    applyRelations(query, include, {
        defaultAlias: 'registryProject',
        allowed: ['realm', 'registry'],
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