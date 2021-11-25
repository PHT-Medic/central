/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, RolePermission } from '@personalhealthtrain/ui-common';
import { check, matchedData, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';

// ---------------------------------------------------------------------------------

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

type PartialPermissionController = Partial<RolePermission>;
const simpleExample = { role_id: 1, permission_id: 'user_add' };

@SwaggerTags('auth')
@Controller('/role-permissions')
export class RolePermissionController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialPermissionController[]> {
        return await getRolePermissions(req, res) as PartialPermissionController[];
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController>(simpleExample)
    async add(
        @Body() data: Pick<RolePermission, 'role_id' | 'permission_id'>,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialPermissionController> {
        return await addRolePermission(req, res);
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialPermissionController> {
        return await getRolePermission(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialPermissionController> {
        return await dropRolePermission(req, res);
    }
}

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 */
async function getRolePermissions(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    const rolePermissionRepository = getRepository(RolePermission);
    const query = rolePermissionRepository.createQueryBuilder('rolePermission')
        .leftJoinAndSelect('rolePermission.permission', 'permission');

    applyFilters(query, filter, {
        defaultAlias: 'rolePermission',
        allowed: ['role_id', 'permission_id'],
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

// ---------------------------------------------------------------------------------

/**
 * Receive a specific permission of a specific user.
 *
 * @param req
 * @param res
 */
async function getRolePermission(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const rolePermissionRepository = getRepository(RolePermission);
    const entity = await rolePermissionRepository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

// ---------------------------------------------------------------------------------

/**
 * Add an permission by id to a specific user.
 *
 * @param req
 * @param res
 */
async function addRolePermission(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    await check('role_id')
        .exists()
        .isInt()
        .run(req);

    await check('permission_id')
        .exists()
        .isString()
        .run(req);

    if (!req.ability.hasPermission(PermissionID.ROLE_PERMISSION_ADD)) {
        throw new ForbiddenError();
    }

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(RolePermission);
    let rolePermission = repository.create(data);

    rolePermission = await repository.save(rolePermission);

    return res.respondCreated({
        data: rolePermission,
    });
}

// ---------------------------------------------------------------------------------

/**
 * Drop an permission by id of a specific user.
 *
 * @param req
 * @param res
 */
async function dropRolePermission(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.ROLE_PERMISSION_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(RolePermission);
    await repository.delete(id);

    return res.respondDeleted();
}
