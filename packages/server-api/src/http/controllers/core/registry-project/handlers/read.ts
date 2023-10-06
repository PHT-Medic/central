/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/basic/query';
import type { ParseAllowedOption } from 'rapiq';
import { parseQueryFields } from 'rapiq';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import type { SelectQueryBuilder } from 'typeorm';
import {
    applyFilters,
    applyPagination,
    applyQueryFieldsParseOutput,
    applyRelations,
    applySort,
    useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import { PermissionID } from '@personalhealthtrain/core';
import { useRequestEnv } from '../../../../request';
import { RegistryProjectEntity, onlyRealmWritableQueryResources } from '../../../../../domains';

function checkAndApplyFields(req: Request, query: SelectQueryBuilder<any>, fields: any) {
    const protectedFields : ParseAllowedOption<RegistryProjectEntity> = [
        'account_name',
        'account_id',
        'account_secret',
    ];

    const fieldsParsed = parseQueryFields<RegistryProjectEntity>(fields, {
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
        defaultPath: 'registryProject',
    });

    const protectedSelected = fieldsParsed
        .filter((field) => field.path === 'registryProject' &&
            protectedFields.indexOf(field.key as any) !== -1);

    if (protectedSelected.length > 0) {
        const ability = useRequestEnv(req, 'ability');
        if (
            !ability.has(PermissionID.REGISTRY_PROJECT_MANAGE)
        ) {
            throw new ForbiddenError(
                `You are not permitted to read the restricted fields: ${
                    protectedSelected.map((field) => field.key).join(', ')}`,
            );
        }

        onlyRealmWritableQueryResources(query, useRequestEnv(req, 'realm'));
    }

    applyQueryFieldsParseOutput(query, fieldsParsed, { defaultAlias: 'registryProject' });
}

export async function getOneRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');
    const { include, fields } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryProjectEntity);
    const query = repository.createQueryBuilder('registryProject')
        .where('registryProject.id = :id', { id });

    checkAndApplyFields(req, query, fields);

    applyRelations(query, include, {
        defaultAlias: 'registryProject',
        allowed: ['registry'],
    });

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyRegistryProjectRouteHandler(req: Request, res: Response) : Promise<any> {
    const {
        filter, page, sort, include, fields,
    } = useRequestQuery(req);

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

    return send(res, {
        data: entities,
        meta: {
            total,
            ...pagination,
        },
    });
}
