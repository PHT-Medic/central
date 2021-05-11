import {matchedData, validationResult} from "express-validator";
import PermissionResponseSchema from "../../../domains/permission/PermissionResponseSchema";
import {getRepository} from "typeorm";
import {Permission} from "../../../domains/permission";
import {applyRequestFilterOnQuery} from "../../../db/utils/filter";
import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../modules/http/request/middleware/authMiddleware";

@SwaggerTags("permission")
@Controller("/permissions")
export class PermissionController {
    @Get("", [ForceLoggedInMiddleware])
    async getPermissions(
        @Request() req: any,
        @Response() res: any
    ): Promise<Array<Permission>> {
        return await getPermissions(req, res);
    }

    @Post("", [ForceLoggedInMiddleware])
    async addPermission(
        @Body() user: NonNullable<Permission>/* Pick<User, 'name' | 'email' | 'password' | 'realm_id'> */,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Permission> {
        return await addPermission(req, res);
    }

    @Get("/:id", [ForceLoggedInMiddleware])
    async getPermission(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Permission> {
        return await getPermission(req, res);
    }

    @Post("/:id", [ForceLoggedInMiddleware])
    async editPermission(
        @Params('id') id: string,
        @Body() user: NonNullable<Permission>/* Pick<User, 'name' | 'email' | 'password' | 'realm_id'> */,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Permission> {
        // todo: implement edit
        return (await editPermission(req, res)) as unknown as Promise<Permission>;
    }

    @Delete("/:id", [ForceLoggedInMiddleware])
    async dropPermission(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ) : Promise<Permission> {
        return await dropPermission(req, res);
    }
}

const getPermissions = async (req: any, res: any) => {
    let { filter } = req.query;

    const repository = getRepository(Permission);
    const queryBuilder = repository.createQueryBuilder('user');

    applyRequestFilterOnQuery(queryBuilder, filter, ['id', 'name']);

    let result = await queryBuilder.getMany();

    let permissionResponseSchema = new PermissionResponseSchema();
    result = permissionResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
}

const getPermission = async (req: any, res: any) => {
    let id = req.params.id;
    let result;

    try {
        const repository = getRepository(Permission);
        let result = await repository.createQueryBuilder('permission')
            .where("id = :id", {id})
            .orWhere("name Like :name", {name: id})
            .getOne();

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        let permissionResponseSchema = new PermissionResponseSchema();
        result = permissionResponseSchema.applySchemaOnEntity(result);

        return res._respond({data: result});

    } catch (e) {
        return res._failNotFound();
    }
}

const addPermission = async (req: any, res: any) => {
    if(!req.ability.can('add','permission')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidation({validation});
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(Permission);
    let permission = repository.create({
        name: data.name
    })

    try {
        await repository.save(permission);

        return res._respondCreated({
            data: permission
        });
    } catch (e) {
        return res._failValidationError();
    }
};

const dropPermission = async (req: any, res: any) => {
    let { id } = req.params;

    if(!req.ability.can('drop','permission')) {
        return res._failForbidden();
    }

    try {
        const repository = getRepository(Permission);
        await repository.delete(id);

        return res._respondDeleted();
    } catch (e) {
        return res._failValidationError();
    }
}

const editPermission = async (req: any, res: any) => {
    //todo: implement
}

export default {
    getPermissions,
    getPermission,
    addPermission,
    dropPermission,
    editPermission
}
