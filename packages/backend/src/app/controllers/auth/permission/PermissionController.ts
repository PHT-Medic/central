import {getRepository} from "typeorm";
import {applyRequestFilter, applyRequestPagination} from "typeorm-extension";
import {SwaggerTags} from "typescript-swagger";

import {Permission} from "../../../../domains/permission";
import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

@SwaggerTags("auth")
@Controller("/permissions")
export class PermissionController {
    @Get("", [ForceLoggedInMiddleware])
    async getPermissions(
        @Request() req: any,
        @Response() res: any
    ): Promise<Permission[]> {
        return await getPermissions(req, res);
    }

    @Get("/:id", [ForceLoggedInMiddleware])
    async getPermission(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Permission> {
        return await getPermission(req, res);
    }
}

async function getPermissions (req: any, res: any) {
    const { filter, page } = req.query;

    const repository = getRepository(Permission);
    const query = repository.createQueryBuilder('permission');

    applyRequestFilter(query, filter, ['id']);

    const pagination = applyRequestPagination(query, page, 50);

    const [entities, total] = await query.getManyAndCount();

    return res._respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

async function getPermission(req: any, res: any) {
    const id = req.params.id;

    try {
        const repository = getRepository(Permission);
        const result = await repository.createQueryBuilder('permission')
            .where("id = :id", {id})
            .getOne();

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: result});

    } catch (e) {
        return res._failNotFound();
    }
}
