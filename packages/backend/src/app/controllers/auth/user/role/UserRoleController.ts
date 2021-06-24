import {getRepository} from "typeorm";
import {applyRequestFilter, applyRequestPagination} from "typeorm-extension";
import {UserRole} from "../../../../../domains/user/role";
import {check, matchedData, validationResult} from "express-validator";

import {Body, Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../../modules/http/request/middleware/auth";
import {ResponseExample, SwaggerTags} from "typescript-swagger";

type PartialUserRole = Partial<UserRole>;
const simpleExample = {role_id: 1, user_id: 1};

@SwaggerTags('user')
@Controller("/user-roles")
export class UserRoleController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole[]>([simpleExample])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUserRole[]> {
        return await getUserRolesRouteHandler(req, res) as PartialUserRole[];
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole>(simpleExample)
    async add(
        @Body() data: Pick<UserRole, 'role_id' | 'user_id'>,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUserRole> {
        return await addUserRoleRouteHandler(req, res) as PartialUserRole;
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<UserRole> {
        return await getUserRoleRouteHandler(req, res) as UserRole;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUserRole>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUserRole> {
        return await dropUserRoleRouteHandler(req, res) as PartialUserRole;
    }
}

export async function getUserRolesRouteHandler(req: any, res: any) {
    const { filter, page } = req.query;

    try {
        const repository = getRepository(UserRole);
        const query = await repository.createQueryBuilder('userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('userRoles.user', 'user');

        applyRequestFilter(query, filter, {
            role_id: 'userRoles.role_id',
            user_id: 'userRoles.user_id',
            role_name: 'role.name',
            user_name: 'user.name'
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
        return res._failServerError();
    }
}

export async function getUserRoleRouteHandler(req: any, res: any) {
    const {id} = req.params;

    const repository = getRepository(UserRole);
    const entities = await repository.findOne(id)

    if (typeof entities === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entities});
}

export async function addUserRoleRouteHandler(req: any, res: any) {
    await check('user_id')
        .exists()
        .isInt()
        .run(req);

    await check('role_id')
        .exists()
        .isInt()
        .run(req);

    if(!req.ability.can('add','userRole')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const repository = getRepository(UserRole);
    let entity = repository.create(data);

    try {
        entity = await repository.save(entity);

        return res._respondCreated({
            data: entity
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function dropUserRoleRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if(!req.ability.can('drop','userRole')) {
        return res._failForbidden();
    }

    const repository = getRepository(UserRole);

    const entity : UserRole | undefined = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failServerError();
    }
}
