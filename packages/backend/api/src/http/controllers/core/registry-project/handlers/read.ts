/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SelectQueryBuilder } from 'typeorm';
import { onlyRealmPermittedQueryResources } from '@authelion/server-core';
import {
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applyRelations, applySort, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { parseQueryFields } from 'rapiq';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryProjectEntity } from '../../../../../domains/core/registry-project/entity';

function checkAndApplyFields(req: ExpressRequest, query: SelectQueryBuilder<any>, fields: any) {
    const protectedFields = [
        'account_name',
        'account_id',
        'account_secret',
    ];

    const fieldsParsed = parseQueryFields(fields, {
        default: [
            'id',
            'name',
            'ecosystem',
            'type',
            'public',
            'external_name',
            'external_id',
            'webhook_name',
            'webhook_exists',
            'registry_id',
            'realm_id',
            'created_at',
            'updated_at',
        ],
        allowed: protectedFields,
        defaultAlias: 'registryProject',
    });

    const protectedSelected = fieldsParsed
        .filter((field) => field.alias === 'registryProject' &&
            protectedFields.indexOf(field.key) !== -1);

    if (protectedSelected.length > 0) {
        if (
            !req.ability.has(PermissionID.REGISTRY_PROJECT_MANAGE)
        ) {
            throw new ForbiddenError(
                `You are not permitted to read the restricted fields: ${
                    protectedSelected.map((field) => field.key).join(', ')}`,
            );
        }

        onlyRealmPermittedQueryResources(query, req.realmId);
    }

    applyQueryFieldsParseOutput(query, fieldsParsed);
}

export async function getOneRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include, fields } = req.query;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject')
        .where('registryProject.id = :id', { id });

    applyRelations(query, include, {
        defaultAlias: 'registryProject',
        allowed: ['registry'],
    });

    checkAndApplyFields(req, query, fields);

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyRegistryProjectRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = req.query;

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject');

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
        allowed: ['registry'],
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
