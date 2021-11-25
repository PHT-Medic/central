/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, UserRole } from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';
import { check, matchedData, validationResult } from 'express-validator';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';
import { NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

type PartialUserRole = Partial<UserRole>;
const simpleExample = { role_id: 1, user_id: 1 };

@SwaggerTags('user')
@Controller('/user-roles')
export class UserRoleController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialUserRole[]> {
        return await getUserRolesRouteHandler(req, res) as PartialUserRole[];
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole>(simpleExample)
    async add(
        @Body() data: Pick<UserRole, 'role_id' | 'user_id'>,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialUserRole> {
        return await addUserRoleRouteHandler(req, res) as PartialUserRole;
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<UserRole> {
        return await getUserRoleRouteHandler(req, res) as UserRole;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialUserRole> {
        return await dropUserRoleRouteHandler(req, res) as PartialUserRole;
    }
}

export async function getUserRolesRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    const repository = getRepository(UserRole);
    const query = await repository.createQueryBuilder('user_roles')
        .leftJoinAndSelect('user_roles.role', 'role')
        .leftJoinAndSelect('user_roles.user', 'user');

    applyFilters(query, filter, {
        allowed: ['user_roles.role_id', 'user_roles.user_id', 'user.name', 'role.name'],
        defaultAlias: 'user_roles',
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

export async function getUserRoleRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(UserRole);
    const entities = await repository.findOne(id);

    if (typeof entities === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entities });
}

export async function addUserRoleRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    await check('user_id')
        .exists()
        .isInt()
        .run(req);

    await check('role_id')
        .exists()
        .isInt()
        .run(req);

    if (!req.ability.hasPermission(PermissionID.USER_ROLE_ADD)) {
        throw new NotFoundError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(UserRole);
    let entity = repository.create(data);

    entity = await repository.save(entity);

    return res.respondCreated({
        data: entity,
    });
}

export async function dropUserRoleRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.USER_ROLE_DROP)) {
        throw new NotFoundError();
    }

    const repository = getRepository(UserRole);

    const entity : UserRole | undefined = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.delete(entity.id);

    return res.respondDeleted({ data: entity });
}
