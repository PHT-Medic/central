import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {RolePermission} from "../../../../../domains/role/permission";
import {applyRequestFilterOnQuery} from "../../../../../db/utils/filter";
import {applyRequestPagination} from "../../../../../db/utils/pagination";

//---------------------------------------------------------------------------------

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../../modules/http/request/middleware/auth";
import {ResponseExample, SwaggerTags} from "typescript-swagger";

type PartialPermissionController = Partial<RolePermission>;
const simpleExample = {role_id: 1, permission_id: 1};

@SwaggerTags('auth')
@Controller("/role-permissions")
export class RolePermissionController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<Array<PartialPermissionController>>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<Array<PartialPermissionController>> {
        return await getRolePermissions(req, res) as Array<PartialPermissionController>;
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController>(simpleExample)
    async add(
        @Body() data: Pick<RolePermission, 'role_id' | 'permission_id'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialPermissionController> {
        return await addRolePermission(req, res) as PartialPermissionController;
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialPermissionController> {
        return await getRolePermission(req, res) as PartialPermissionController;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialPermissionController>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialPermissionController> {
        return await dropRolePermission(req, res) as PartialPermissionController;
    }
}

/**
 * Receive user permissions of a specific user.
 *
 * @param req
 * @param res
 */
async function getRolePermissions(req: any, res: any) {
    let { filter, page } = req.query;

    try {
        const rolePermissionRepository = getRepository(RolePermission);
        let query = rolePermissionRepository.createQueryBuilder('rolePermission')
            .leftJoinAndSelect('rolePermission.permission', 'permission');

        applyRequestFilterOnQuery(query, filter, {
            role_id: 'rolePermission.role_id',
            permission_id: 'rolePermission.permission_id',
            permission_name: 'permission.name'
        });

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
    } catch (e) {
        console.log(e);
        return res._failServerError();
    }
}

//---------------------------------------------------------------------------------

/**
 * Receive a specific permission of a specific user.
 *
 * @param req
 * @param res
 */
async function getRolePermission(req: any, res: any) {
    let {id} = req.params;

    try {
        const rolePermissionRepository = getRepository(RolePermission);
        const entity = await rolePermissionRepository.findOne(id);

        if(typeof entity === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}

//---------------------------------------------------------------------------------

/**
 * Add an permission by id to a specific user.
 *
 * @param req
 * @param res
 */
const addRolePermission = async (req: any, res: any) => {
    await check('role_id')
        .exists()
        .isInt()
        .run(req);

    await check('permission_id')
        .exists()
        .isInt().run(req);

    if(!req.ability.can('add','rolePermission')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(RolePermission);
    let rolePermission = repository.create(data);

    try {
        rolePermission = await repository.save(rolePermission);

        return res._respondCreated({
            data: rolePermission
        });
    } catch (e) {
        return res._failValidationError();
    }
}

//---------------------------------------------------------------------------------

/**
 * Drop an permission by id of a specific user.
 *
 * @param req
 * @param res
 */
async function dropRolePermission(req: any, res: any) {
    let { id } = req.params;

    if(!req.ability.can('drop','rolePermission')) {
        return res._failForbidden();
    }

    try {
        const repository = getRepository(RolePermission);
        await repository.delete(id);

        return res._respondDeleted();
    } catch (e) {
        return res._failValidationError();
    }
}

//---------------------------------------------------------------------------------

export default {
    getRolePermissions,
    getRolePermission,
    addRolePermission,
    dropRolePermission
};

export {
    getRolePermissions,
    getRolePermission,
    addRolePermission,
    dropRolePermission
}
