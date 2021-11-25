/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SwaggerTags } from 'typescript-swagger';
import {
    Body, Controller, Post, Request, Response,
} from '@decorators/express';
import {
    AuthClientCommand, AuthClientType, Client, PermissionID, SERVICE_ID,
} from '@personalhealthtrain/ui-common';
import { getRepository } from 'typeorm';
import { check, matchedData, validationResult } from 'express-validator';
import {
    BadRequestError, ForbiddenError, NotFoundError, NotImplementedError,
} from '@typescript-error/http';
import { doAuthClientCommand } from './command';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressValidationError } from '../../../../config/http/error/validation';

@SwaggerTags('auth')
@Controller('/clients')
export class ClientController {
    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Request() req: any,
            @Response() res: any,
    ): Promise<Client[]> {
        return addRoute(req, res);
    }

    @Post('/:id/command', [ForceLoggedInMiddleware])
    async runCommand(
    @Body() data: {command: AuthClientCommand},
        @Request() req: any,
        @Response() res: any,
    ) {
        return doAuthClientCommand(req, res);
    }
}

async function addRoute(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
        throw new ForbiddenError('You are not allowed to add service-clients.');
    }

    await check('type')
        .exists()
        .custom((value) => Object.values(AuthClientType).indexOf(value) !== -1)
        .run(req);

    await check('id')
        .exists()
        .custom((value) => typeof value === 'number' || typeof value === 'string')
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    const clientType : AuthClientType = data.type;
    const clientTargetId = data.id;

    const repository = getRepository(Client);
    let entity : Client | undefined;

    switch (clientType) {
        case AuthClientType.SERVICE:
            if (!req.ability.hasPermission(PermissionID.SERVICE_MANAGE)) {
                throw new ForbiddenError('You are not allowed to add service-clients.');
            }

            if (Object.values(SERVICE_ID).indexOf(clientTargetId) === -1) {
                throw new NotFoundError();
            }

            const serviceId : SERVICE_ID = clientTargetId;

            entity = await repository.findOne({
                service_id: serviceId,
            });

            if (typeof entity !== 'undefined') {
                throw new BadRequestError('A client already exists for that service.');
            }

            entity = repository.create({
                name: serviceId,
                service_id: serviceId,
                type: clientType,
            });
            break;
        case AuthClientType.USER:
            throw new NotImplementedError('Not implemented yet... ^^');
    }

    await repository.save(entity);

    return res.respondCreated({ data: entity });
}
