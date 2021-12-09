/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { check, matchedData, validationResult } from 'express-validator';
import { getCustomRepository, getRepository } from 'typeorm';
import {
    applyFields, applyFilters, applyPagination, applyRelations,
} from 'typeorm-extension';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';

import {
    PermissionID,
    Realm, User, isPermittedForResourceRealm, onlyRealmPermittedQueryResources,
} from '@personalhealthtrain/ui-common';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { UserRepository } from '../../../../domains/auth/user/repository';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import env from '../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

export async function getUsersRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, include, fields,
    } = req.query;

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const query = userRepository.createQueryBuilder('user');

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFields(query, fields, {
        defaultAlias: 'user',
        allowed: ['id', 'name', 'display_name', 'email'],
    });

    applyFilters(query, filter, {
        defaultAlias: 'user',
        allowed: ['id', 'name', 'realm_id'],
    });

    applyRelations(query, include, {
        defaultAlias: 'user',
        allowed: ['realm', 'user_roles'],
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

export async function getUserRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { include, fields } = req.query;

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const query = await userRepository.createQueryBuilder('user')
        .andWhere('user.id = :id', { id });

    onlyRealmPermittedQueryResources(query, req.realmId);

    applyFields(query, fields, {
        defaultAlias: 'user',
        allowed: ['email'],
    });

    applyRelations(query, include, {
        defaultAlias: 'user',
        allowed: ['realm', 'user_roles'],
    });

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getMeRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { user } = req;
    const permissions = req.ability.getPermissions();

    return res.respond({
        data: {
            ...user,
            permissions,
        },
    });
}

async function runValidations(req: ExpressRequest, mode: 'create' | 'update') {
    await check('display_name').exists().notEmpty().isLength({ min: 3, max: 128 })
        .optional()
        .run(req);
    await check('email').exists().normalizeEmail().isEmail()
        .optional({ nullable: true })
        .run(req);
    await check('password').exists().isLength({ min: 5, max: 512 }).optional({ nullable: true })
        .run(req);

    if (mode !== 'update' || req.ability.hasPermission(PermissionID.USER_EDIT)) {
        const nameChain = check('name')
            .exists()
            .notEmpty()
            .isLength({ min: 3, max: 128 });

        if (mode === 'update') {
            nameChain.optional({ nullable: true });
        }

        await nameChain.run(req);

        // -------

        const realmChain = check('realm_id').exists().notEmpty().custom((value: any) => getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
            if (typeof realm === 'undefined') {
                throw new Error('The provided realm was not found.');
            }
        }));

        if (mode === 'update') {
            realmChain.optional({ nullable: true });
        }

        await realmChain.run(req);
    }
}

export async function addUserRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.USER_ADD)) {
        throw new ForbiddenError('You are not authorized to add a user.');
    }

    await runValidations(req, 'create');

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: true });

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.create(data);

    if (!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        throw new ForbiddenError(`You are not allowed to add users to the realm ${user.realm_id}`);
    }

    if (user.password) {
        user.password = await userRepository.hashPassword(user.password);
    }

    await userRepository.save(user);

    delete user.password;

    return res.respondCreated({ data: user });
}

export async function editUserRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id: idStr } = req.params;

    const id : number = parseInt(idStr, 10);

    if (Number.isNaN(id)) {
        throw new BadRequestError('The user identifier is not valid.');
    }

    if (
        !req.ability.hasPermission(PermissionID.USER_EDIT) &&
        req.user.id !== id
    ) {
        throw new ForbiddenError('You are not authorized to modify a user.');
    }

    await runValidations(req, 'update');

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });
    if (!data) {
        return res.respondAccepted();
    }

    if (
        typeof data.password !== 'undefined' &&
        env.userPasswordImmutable &&
        !req.ability.hasPermission(PermissionID.USER_EDIT)
    ) {
        throw new BadRequestError('User passwords are immutable and can not be changed in this environment.');
    }

    const userRepository = getCustomRepository<UserRepository>(UserRepository);

    if (typeof data.password !== 'undefined') {
        data.password = await userRepository.hashPassword(data.password);
    }

    let user = await userRepository.findOne(id);
    if (typeof user === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        throw new ForbiddenError(`You are not allowed to edit users of the realm ${user.realm_id}`);
    }

    if (typeof data.realm_id === 'string') {
        if (!isPermittedForResourceRealm(req.realmId, data.realm_id)) {
            throw new ForbiddenError(`You are not allowed to move users to the realm ${data.realm_id}`);
        }
    }

    user = userRepository.merge(user, data);

    await userRepository.save(user);

    if (typeof user.realm_id !== 'undefined') {
        user.realm = await getRepository(Realm).findOne(user.realm_id);
    }

    return res.respond({
        data: user,
    });
}

// ---------------------------------------------------------------------------------

export async function dropUserRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.USER_DROP)) {
        throw new ForbiddenError('You are not authorized to drop a user.');
    }

    if (req.user.id === parseInt(id, 10)) {
        throw new BadRequestError('The own user can not be deleted.');
    }

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.findOne(id);

    if (typeof user === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, user.realm_id)) {
        throw new ForbiddenError(`You are not authorized to drop a user fo the realm ${user.realm_id}`);
    }

    await userRepository.delete(id);

    return res.respondDeleted();
}

// ---------------------------------------------------------------------------------

type PartialUser = Partial<User>;

@SwaggerTags('user')
@Controller('/users')
export class UserController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUser[]>([
        { name: 'admin', email: 'admin@example.com' },
        { name: 'moderator', email: 'moderator@example.com' },
    ])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialUser[]> {
        return getUsersRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({ name: 'admin', email: 'admin@example.com', realm_id: 'master' })
    async add(
        @Body() user: NonNullable<User>/* Pick<User, 'name' | 'email' | 'password' | 'realm_id'> */,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialUser | undefined> {
        return addUserRouteHandler(req, res);
    }

    @Get('/me', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({ name: 'admin', email: 'admin@example.com' })
    async getMe(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialUser | undefined> {
        return getMeRouteHandler(req, res);
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({ name: 'admin', email: 'admin@example.com' })
    async get(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialUser | undefined> {
        return getUserRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({ name: 'admin', email: 'admin@example.com' })
    async edit(
        @Params('id') id: string,
            @Body() user: PartialUser,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialUser | undefined> {
        return editUserRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialUser>({ name: 'admin', email: 'admin@example.com' })
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialUser | undefined> {
        return dropUserRouteHandler(req, res);
    }
}
