/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@ebec/http';
import type { MatchedDataOptions } from 'express-validator';
import { matchedData } from 'express-validator';
import { deleteUndefinedObjectProperties } from '@personalhealthtrain/central-common';
import type { Request } from 'routup';
import type { EntityTarget } from 'typeorm';
import { useDataSource } from 'typeorm-extension';
import type { ExpressValidationExtendKeys, RequestValidationResult } from './type';

export function buildRequestValidationErrorMessage<
    T extends Record<string, any> = Record<string, any>,
    >(name: keyof T | (keyof T)[]) {
    const names = Array.isArray(name) ? name : [name];

    if (names.length > 1) {
        return `The parameters ${names.join(', ')} is invalid.`;
    }
    return `The parameter ${String(names[0])} is invalid.`;
}

export function matchedValidationData(
    req: Request,
    options?: Partial<MatchedDataOptions>,
): Record<string, any> {
    return deleteUndefinedObjectProperties(matchedData(req, options));
}

export function initRequestValidationResult<
    R extends Record<string, any>,
    M extends Record<string, any> = Record<string, any>,
    >() : RequestValidationResult<R, M> {
    return {
        data: {},
        relation: {},
        meta: {} as M,
    };
}

export async function extendRequestValidationResultWithRelation<
    R extends Record<string, any>,
    >(
    result: RequestValidationResult<R>,
    target: EntityTarget<any>,
    keys: Partial<ExpressValidationExtendKeys<R>>,
) : Promise<RequestValidationResult<R>> {
    if (result.data[keys.id]) {
        const dataSource = await useDataSource();

        const repository = dataSource.getRepository(target);
        const entity = await repository.findOneBy({ id: result.data[keys.id] });
        if (!entity) {
            throw new BadRequestError(buildRequestValidationErrorMessage(keys.id));
        }

        result.relation[keys.entity as keyof RequestValidationResult<R>['relation']] = entity;
    }

    return result;
}
