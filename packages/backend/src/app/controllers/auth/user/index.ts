/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {check, matchedData, validationResult} from "express-validator";
import {getCustomRepository, getRepository} from "typeorm";
import {applyFields, applyFilters, applyRelations, applyPagination} from "typeorm-extension";
import {Params, Controller, Get, Request, Response, Post, Body, Delete} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";

import {UserRepository} from "../../../../domains/auth/user/repository";
import {
    isPermittedForResourceRealm,
    onlyRealmPermittedQueryResources, PermissionID, Realm, Station, User
} from "@personalhealthtrain/ui-common";
import {getUserStationRouteHandler} from "./station";
import {useLogger} from "../../../../modules/log";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";

// ---------------------------------------------------------------------------------

type PartialUser = Partial<User>;

@SwaggerTags('user')
@Controller("/users")
export class UserController {
    @Get("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUser[]>([
        {name: 'admin', email: 'admin@example.com'},
        {name: 'moderator', email: 'moderator@example.com'}
        ])
    async getMany(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUser[]> {
        return await getUsersRouteHandler(req, res) as PartialUser[];
    }

    @Post("",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({name: 'admin', email: 'admin@example.com', realm_id: 'master'})
    async add(
        @Body() user: NonNullable<User>/* Pick<User, 'name' | 'email' | 'password' | 'realm_id'> */,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUser|undefined> {
        return await addUserRouteHandler(req, res) as PartialUser | undefined;
    }

    @Get("/me",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({name: 'admin', email: 'admin@example.com'})
    async getMe(
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUser|undefined> {
        return await getMeRouteHandler(req, res) as PartialUser | undefined;
    }

    @Get("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({name: 'admin', email: 'admin@example.com'})
    async get(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUser|undefined> {
        return await getUserRouteHandler(req, res) as PartialUser | undefined;
    }

    @Get("/:id/station", [])
    async getStation(
        @Params("id") id: number,
        @Request() req: any,
        @Response() res: any
    ): Promise<Station> {
        return await getUserStationRouteHandler(req, res) as Station;
    }

    @Post("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({name: 'admin', email: 'admin@example.com'})
    async edit(
        @Params('id') id: string,
        @Body() user: PartialUser,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUser|undefined> {
        return await editUserRouteHandler(req, res) as PartialUser | undefined;
    }

    @Delete("/:id",[ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({name: 'admin', email: 'admin@example.com'})
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialUser|undefined> {
        return await dropUserRouteHandler(req, res) as PartialUser | undefined;
    }
}

export async function getUsersRouteHandler(req: any, res: any) {
    const { filter, page, include, fields } = req.query;

    try {

        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const query = userRepository.createQueryBuilder('user');

        onlyRealmPermittedQueryResources(query, req.realmId);

        applyFields(query, fields, {
            defaultAlias: 'user',
            allowed: ['id', 'name', 'display_name', 'email']
        });

        applyFilters(query, filter, {
            defaultAlias: 'user',
            allowed: ['id', 'name', 'realm_id']
        });

        applyRelations(query, include, {
            defaultAlias: 'user',
            allowed: ['realm', 'user_roles']
        });

        const pagination = applyPagination(query, page, {maxLimit: 50});

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

export async function getUserRouteHandler(req: any, res: any) {
    const { id } = req.params;
    const { include, fields } = req.query;

    try {
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const query = await userRepository.createQueryBuilder('user')
            .andWhere("user.id = :id", {id});

        onlyRealmPermittedQueryResources(query, req.realmId);

        applyFields(query, fields, {
            defaultAlias: 'user',
            allowed: ['email']
        });

        applyRelations(query, include, {
            defaultAlias: 'user',
            allowed: ['realm', 'user_roles']
        });

        const result = await query.getOne();

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        return res._respond({data: result});
    } catch (e) {
        return res._failNotFound();
    }
}

export async function getMeRouteHandler(req: any, res: any) {
    const user = req.user;
    const permissions = req.ability.getPermissions();

    return res._respond({
        data: {
            ...user,
            permissions
        }
    });
}

export async function addUserRouteHandler(req: any, res: any) {
    if(!req.ability.hasPermission(PermissionID.USER_ADD)) {
        return res._failForbidden('You are not authorized to add a user.');
    }

    await check('display_name').exists().notEmpty().isLength({min: 4, max: 128}).optional().run(req);
    await check('email').exists().normalizeEmail().isEmail().optional({nullable: true}).run(req);
    await check('name').exists().notEmpty().isLength({min: 4, max: 128}).run(req);
    await check('password').exists().isLength({min: 5, max: 512}).optional({nullable: true}).run(req);
    await check('realm_id').exists().notEmpty().custom((value: any) => {
        return getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
            if(typeof realm === 'undefined') {
                throw new Error('The provided realm was not found.')
            }
        })
    }).run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: true});

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.create(data);

    if(!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        return res._failForbidden({message: `You are not allowed to add users to the realm ${user.realm_id}`});
    }

    if(user.password) {
        user.password = await userRepository.hashPassword(user.password);
    }

    try {
        const result = await userRepository.save(user);

        useLogger().info('user "' + data.name + '" created...');

        return res._respondCreated({
            data: {
                id: result.id
            }
        });
    } catch (e) {
        return res._failValidationError();
    }
}

export async function editUserRouteHandler(req: any, res: any) {
    let { id } = req.params;

    // tslint:disable-next-line:radix
    id = parseInt(id);

    if(Number.isNaN(id)) {
        return res._failNotFound({message: 'The user identifier is not valid.'});
    }

    if(!req.ability.hasPermission(PermissionID.USER_EDIT) && !req.user.id === id) {
        return res._failForbidden({message: 'You are not authorized to modify a user.'});
    }

    await check('display_name').exists().notEmpty().isLength({min: 4, max: 128}).optional().run(req);
    await check('email').exists().normalizeEmail({gmail_remove_dots: false}).isEmail().optional({nullable: true}).run(req);
    await check('password').exists().isLength({min: 5, max: 512})
        .custom((value, {req: request}) => {
            if(value !== request.body.password_repeat) {
                throw new Error('The provided passwords do not match.');
            } else {
                return value;
            }
        }).optional({nullable: true}).run(req);

    if(req.ability.can('edit','user')) {
        await check('name').exists().notEmpty().isLength({min: 5, max: 128}).optional().run(req);

        await check('realm_id').exists().optional().notEmpty().custom((value: any) => {
            return getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
                if (typeof realm === 'undefined') {
                    throw new Error('The provided realm does not exist.')
                }
            })
        }).run(req);
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    const userRepository = getCustomRepository<UserRepository>(UserRepository);

    if(typeof data.password !== 'undefined') {
        data.password = await userRepository.hashPassword(data.password);
    }

    let user = await userRepository.findOne(id);
    if(typeof user === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        return res._failForbidden({message: `You are not allowed to edit users of the realm ${user.realm_id}`});
    }

    if(typeof data.realm_id === 'string') {
        if (!isPermittedForResourceRealm(req.realmId, data.realm_id)) {
            return res._failForbidden({message: `You are not allowed to move users to the realm ${data.realm_id}`});
        }
    }

    user = userRepository.merge(user, data);

    try {
        const result = await userRepository.save(user);

        if(typeof result.realm_id !== 'undefined') {
            result.realm = await getRepository(Realm).findOne(result.realm_id);
        }

        return res._respond({
            data: result
        });
    } catch (e) {
        return res._failValidationError({message: 'The user information could not be updated.'});
    }
}

// ---------------------------------------------------------------------------------

export async function dropUserRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (!req.ability.hasPermission(PermissionID.USER_DROP)) {
        return res._failForbidden({message: 'You are not authorized to drop a user.'});
    }

    if(req.user.id === id) {
        return res._failValidationError({
            message: 'The own user can not be deleted.'
        })
    }

    try {
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const user = await userRepository.findOne(id);

        if(typeof user === 'undefined') {
            return res._failNotFound();
        }

        if(!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
            return res._failForbidden({message: `You are not authorized to drop a user fo the realm ${user.realm_id}`});
        }

        await userRepository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }

}
