/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SelectQueryBuilder } from 'typeorm';
import {
    applyFilters, applyPagination, applyQueryFieldsParseOutput, applySort, useDataSource,
} from 'typeorm-extension';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { parseQueryFields } from 'rapiq';
import { PermissionID } from '@personalhealthtrain/central-common';
import { ExpressRequest, ExpressResponse } from '../../../../type';
import { RegistryEntity } from '../../../../../domains/core/registry/entity';

function checkAndApplyFields(req: ExpressRequest, query: SelectQueryBuilder<any>) {
    const protectedFields = [
        'account_secret',
    ];

    const fieldsParsed = parseQueryFields(req.query.fields, {
        allowed: [
            'id',
            'name',
            'host',
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

    const dataSource = await useDataSource();
    const repository = dataSource.getRepository(RegistryEntity);
    const query = repository.createQueryBuilder('registry')
        .where('registry.id = :id', { id });

    checkAndApplyFields(req, query);

    const entity = await query.getOne();

    if (!entity) {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getManyRegistryRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, sort,
    } = req.query;

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
