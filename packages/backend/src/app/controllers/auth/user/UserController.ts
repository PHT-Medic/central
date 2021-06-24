import {check, matchedData, validationResult} from "express-validator";
import {getCustomRepository, getRepository} from "typeorm";
import {applyRequestFilter, applyRequestPagination} from "typeorm-extension";
import {Params, Controller, Get, Request, Response, Post, Body, Delete} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";

import {hashPassword} from "../../../../modules/auth/utils/password";
import {UserRepository} from "../../../../domains/user/repository";
import {onlyRealmPermittedQueryResources} from "../../../../domains/realm/db/utils";
import {isRealmPermittedForResource} from "../../../../modules/auth/utils";
import {Realm} from "../../../../domains/realm";
import {User} from "../../../../domains/user";
import {ForceLoggedInMiddleware} from "../../../../modules/http/request/middleware/auth";
import {Station} from "../../../../domains/station";
import {getUserStationRouteHandler} from "./station/UserStationController";
import {useLogger} from "../../../../modules/log";

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
    const { filter, page } = req.query;

    try {

        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const query = userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.realm', 'realm');

        onlyRealmPermittedQueryResources(query, req.user.realm_id);

        applyRequestFilter(query, filter, {
            id: 'user.id',
            name: 'user.name'
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

export async function getUserRouteHandler(req: any, res: any) {
    const { id } = req.params;

    try {
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const query = await userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.realm', 'realm')
            .andWhere("user.id = :id", {id});

        onlyRealmPermittedQueryResources(query, req.user.realm_id);

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
    const permissions = req.permissions;

    return res._respond({
        data: {
            ...user,
            permissions
        }
    });
}

export async function addUserRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','user')) {
        return res._failForbidden();
    }

    await check('email').exists().normalizeEmail().isEmail().optional({nullable: true}).run(req);
    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).run(req);
    await check('password').exists().isLength({min: 5, max: 512}).optional({nullable: true}).run(req);
    await check('realm_id').exists().notEmpty().custom((value: any) => {
        return getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
            if(typeof realm === 'undefined') {
                throw new Error('Der Realm wurde nicht gefunden.')
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

    if(typeof user.password !== 'undefined' && user.password !== null) {
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
        return res._failNotFound();
    }

    if(!req.ability.can('edit','user') && !req.user.id === id) {
        return res._failForbidden();
    }

    await check('email').exists().normalizeEmail({gmail_remove_dots: false}).isEmail().optional({nullable: true}).run(req);
    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).optional().run(req);
    await check('password').exists().isLength({min: 5, max: 512})
        .custom((value, {req: request}) => {
            if(value !== request.body.password_repeat) {
                throw new Error('Die Passwörter stimmen nicht überein.');
            } else {
                return value;
            }
        }).optional({nullable: true}).run(req);

    if(req.ability.can('edit','user')) {
        await check('realm_id').exists().optional().notEmpty().custom((value: any) => {
            return getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
                if (typeof realm === 'undefined') {
                    throw new Error('Der Realm wurde nicht gefunden.')
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

    if(typeof data.password !== 'undefined') {
        data.password = await hashPassword(data.password);
    }

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    let user = await userRepository.findOne(id);
    if(typeof user === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, user)) {
        return res._failForbidden();
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
        return res._failValidationError({message: 'Die Benutzer Attribute konnten nicht aktualisiert werden.'});
    }
}

// ---------------------------------------------------------------------------------

export async function dropUserRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (!req.ability.can('drop', 'user')) {
        return res._failForbidden();
    }

    if(req.user.id === id) {
        return res._failValidationError({
            message: 'Der eigene Benutzer kann nicht gelöscht werden.'
        })
    }

    try {
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const user = await userRepository.findOne(id);

        if(typeof user === 'undefined') {
            return res._failNotFound();
        }

        if(!isRealmPermittedForResource(req.user, user)) {
            return res._failForbidden();
        }

        await userRepository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }

}
