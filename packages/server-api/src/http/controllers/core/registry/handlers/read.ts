/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRequestQuery } from '@routup/query';
import type { Request, Response } from 'routup';
import { send, useRequestParam } from 'routup';
import type { SelectQueryBuilder } from 'typeorm';
import {
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applySort, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ParseAllowedOption } from 'rapiq';
import { parseQueryFields } from 'rapiq';
import { PermissionID } from '@personalhealthtrain/core';
import { RegistryEntity } from '../../../../../domains/registry/entity';
import { useRequestEnv } from '../../../../request';

function checkAndApplyFields(req: Request, query: SelectQueryBuilder<any>) {
    const protectedFields : ParseAllowedOption<RegistryEntity> = [
        'account_secret',
    ];

    const fieldsParsed = parseQueryFields<RegistryEntity>(useRequestQuery(req, 'fields'), {
        default: [
            'id',
            'name',
            'host',
            'ecosystem',
            'account_name',
            'created_at',
            'updated_at',
        ],
        allowed: protectedFields,
        defaultPath: 'registry',
    });

    const protectedSelected = fieldsParsed
        .filter((field) => field.path === 'registry' &&
            protectedFields.indexOf(field.key as any) !== -1);

    const ability = useRequestEnv(req, 'ability');
    if (protectedSelected.length > 0) {
        if (
            !ability.has(PermissionID.REGISTRY_MANAGE)
        ) {
            throw new ForbiddenError(
                `You are not permitted to read the restricted fields: ${
                    protectedSelected.map((field) => field.key).join(', ')}`,
            );
        }
    }

    applyQueryFieldsParseOutput(query, fieldsParsed, { defaultAlias: 'registry' });
}

export async function getOneRegistryRouteHandler(req: Request, res: Response) : Promise<any> {
    const id = useRequestParam(req, 'id');

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry')
        .where('registry.id = :id', { id });

    checkAndApplyFields(req, query);

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return send(res, entity);
}

export async function getManyRegistryRouteHandler(req: Request, res: Response) : Promise<any> {
    const {
        filter, page, sort,
    } = useRequestQuery(req);

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry');

    checkAndApplyFields(req, query);

    applyFilters(query, filter, {
        defaultAlias: 'registry',
        allowed: ['id', 'ecosystem', 'name'],
    });

    applySort(query, sort, {
        defaultAlias: 'registry',
        allowed: ['id', 'updated_at', 'created_at'],
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
