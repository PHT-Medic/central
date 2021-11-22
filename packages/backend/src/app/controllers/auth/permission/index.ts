/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {Permission, PermissionID} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import {applyFilters, applyPagination} from "typeorm-extension";
import {SwaggerTags} from "typescript-swagger";

import {Body, Controller, Get, Params, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {check, matchedData, validationResult} from "express-validator";
import {ExpressRequest, ExpressResponse} from "../../../../config/http/type";
import {NotFoundError} from "@typescript-error/http";
import {ExpressValidationError} from "../../../../config/http/error/validation";

@SwaggerTags("auth")
@Controller("/permissions")
export class PermissionController {
    @Get("", [ForceLoggedInMiddleware])
    async getPermissions(
        @Request() req: any,
        @Response() res: any
    ): Promise<Permission[]> {
        return await getMany(req, res);
    }

    @Get("/:id", [ForceLoggedInMiddleware])
    async getPermission(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Permission> {
        return await getOne(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async add(
        @Body() user: NonNullable<Permission>,
        @Request() req: any,
        @Response() res: any
    ): Promise<Permission[]> {
        return await addOne(req, res);
    }
}

async function getMany(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { filter, page } = req.query;

    const repository = getRepository(Permission);
    const query = repository.createQueryBuilder('permission');

    applyFilters(query, filter, {
        allowed: ['id']
    })

    const pagination = applyPagination(query, page, {maxLimit: 50});

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

async function getOne(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const id = req.params.id;

    const repository = getRepository(Permission);
    const result = await repository.createQueryBuilder('permission')
        .where("id = :id", {id})
        .getOne();

    if(typeof result === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({data: result});
}

async function addOne(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if(!req.ability.hasPermission(PermissionID.PERMISSION_MANAGE)) {
        throw new NotFoundError();
    }

    await check('id').exists().notEmpty().isLength({min: 3, max: 30}).run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(Permission);
    const role = repository.create(data);

    await repository.save(role);

    return res.respondCreated({
        data: {
            id: role.id
        }
    });
}
