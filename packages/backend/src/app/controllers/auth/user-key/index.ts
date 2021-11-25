/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import { check, matchedData, validationResult } from 'express-validator';
import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from 'typescript-swagger';
import {
    PermissionID,
    UserKeyRing,
    removeUserSecretsFromSecretEngine,
    saveUserSecretsToSecretEngine,
} from '@personalhealthtrain/ui-common';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import env from '../../../../env';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

@SwaggerTags('user', 'pht')
@Controller('/user-key-rings')
export class UserKeyController {
    @Get('', [ForceLoggedInMiddleware])
    async get(
        @Request() req: any,
        @Response() res: any,
    ) : Promise<UserKeyRing> {
        return getUserKeyRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Request() req: any,
        @Response() res: any,
        @Body() keyRing: Pick<UserKeyRing, 'public_key' | 'he_key'>,
    ) : Promise<UserKeyRing> {
        return addUserKeyRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
        @Body() keyRing: Pick<UserKeyRing, 'public_key' | 'he_key'>,
    ) : Promise<UserKeyRing> {
        return editUserKeyRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any,
    ) : Promise<UserKeyRing> {
        return dropUserKeyRouteHandler(req, res);
    }
}

export async function getUserKeyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const repository = getRepository(UserKeyRing);

    const entity = await repository.findOne({
        user_id: req.user.id,
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

async function runValidationRules(req: ExpressRequest) {
    await check('public_key').optional({ nullable: true }).isLength({ min: 5, max: 4096 }).run(req);
    await check('he_key').optional({ nullable: true }).isLength({ min: 5, max: 4096 }).run(req);
}

async function addUserKeyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (
        env.userSecretsImmutable
        && !req.ability.hasPermission(PermissionID.USER_EDIT)
    ) {
        throw new BadRequestError('User secrets are immutable and can not be changed in this environment.');
    }

    await runValidationRules(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(UserKeyRing);

    const entity = repository.create({
        user_id: req.user.id,
        ...data,
    });

    await repository.save(entity);

    await saveUserSecretsToSecretEngine(entity);

    return res.respond({ data: entity });
}

async function editUserKeyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (
        env.userSecretsImmutable
        && !req.ability.hasPermission(PermissionID.USER_EDIT)
    ) {
        throw new BadRequestError('User secrets are immutable and can not be changed in this environment.');
    }

    await runValidationRules(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const repository = getRepository(UserKeyRing);

    let entity = await repository.findOne({
        id: parseInt(id, 10),
        user_id: req.user.id,
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    entity = repository.merge(entity, data);

    await saveUserSecretsToSecretEngine(entity);

    await repository.save(entity);

    return res.respondDeleted({ data: entity });
}

async function dropUserKeyRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(UserKeyRing);

    const entity = await repository.findOne({
        id: parseInt(id, 10),
        user_id: req.user.id,
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await removeUserSecretsFromSecretEngine(entity.id);

    await repository.remove(entity);

    return res.respondDeleted({ data: entity });
}
