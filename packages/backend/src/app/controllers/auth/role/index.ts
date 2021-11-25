/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionID, Role } from '@personalhealthtrain/ui-common';
import { check, matchedData, validationResult } from 'express-validator';
import { getRepository } from 'typeorm';
import { applyFilters, applyPagination } from 'typeorm-extension';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

// ---------------------------------------------------------------------------------

type PartialRole = Partial<Role>;
const simpleExample = { name: 'admin' };

@SwaggerTags('auth')
@Controller('/roles')
export class RoleController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialRole[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialRole[]> {
        return await getRoles(req, res) as PartialRole[];
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async add(
        @Body() data: Pick<Role, 'name'>,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialRole> {
        return await addOne(req, res) as PartialRole;
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialRole> {
        return await getOne(req, res) as PartialRole;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async edit(
        @Params('id') id: string,
        @Body() data: Pick<Role, 'name'>,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialRole> {
        return await editRole(req, res) as PartialRole;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialRole>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ): Promise<PartialRole> {
        return await dropRole(req, res) as PartialRole;
    }
}

async function getRoles(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    const roleRepository = getRepository(Role);
    const query = roleRepository.createQueryBuilder('role');

    applyFilters(query, filter, {
        allowed: ['id', 'name'],
        defaultAlias: 'role',
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

async function getOne(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const roleRepository = getRepository(Role);
    const result = await roleRepository.findOne(id);

    if (typeof result === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: result });
}

async function addOne(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.ROLE_ADD)) {
        throw new ForbiddenError();
    }

    await check('name').exists().notEmpty().isLength({ min: 3, max: 30 })
        .run(req);
    await check('provider_role_id').exists().notEmpty().isLength({ min: 3, max: 100 })
        .optional({
            nullable: true,
        })
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const roleRepository = getRepository(Role);
    const role = roleRepository.create(data);

    await roleRepository.save(role);

    return res.respondCreated({
        data: {
            id: role.id,
        },
    });
}

async function editRole(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.ROLE_EDIT)) {
        throw new ForbiddenError();
    }

    await check('name').exists().notEmpty().isLength({ min: 3, max: 30 })
        .optional()
        .run(req);
    await check('provider_role_id').exists().notEmpty().isLength({ min: 3, max: 100 })
        .optional({
            nullable: true,
        })
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: true });
    if (!data) {
        return res.respondAccepted();
    }

    const roleRepository = getRepository(Role);
    let role = await roleRepository.findOne(id);

    if (typeof role === 'undefined') {
        throw new NotFoundError();
    }

    role = roleRepository.merge(role, data);

    const result = await roleRepository.save(role);

    return res.respondAccepted({
        data: result,
    });
}

// ---------------------------------------------------------------------------------

async function dropRole(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.ROLE_DROP)) {
        throw new ForbiddenError();
    }

    const roleRepository = getRepository(Role);
    await roleRepository.delete(id);

    return res.respondDeleted();
}
