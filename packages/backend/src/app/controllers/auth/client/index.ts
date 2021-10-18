/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {SwaggerTags} from "typescript-swagger";
import {Body, Controller, Post, Request, Response} from "@decorators/express";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {Client, AuthClientCommand, SERVICE_ID, AuthClientType} from "@personalhealthtrain/ui-common";
import {getRepository} from "typeorm";
import {check, matchedData, validationResult} from "express-validator";
import {doAuthClientCommand} from "./command";

@SwaggerTags('auth')
@Controller("/clients")
export class ClientController {
    @Post("", [ForceLoggedInMiddleware])
    async add(
        @Request() req: any,
        @Response() res: any
    ): Promise<Client[]> {
        return await addRoute(req, res);
    }

    @Post("/:id/command", [ForceLoggedInMiddleware])
    async runCommand(
        @Body() data: {command: AuthClientCommand},
        @Request() req: any,
        @Response() res: any
    ) {
        return await doAuthClientCommand(req, res);
    }
}

async function addRoute(req: any, res: any) {
    if (!req.ability.can('manage', 'service')) {
        return res._failForbidden({message: 'You are not allowed to add service-clients.'});
    }

    await check('type')
        .exists()
        .custom(value => Object.values(AuthClientType).indexOf(value) !== -1)
        .run(req);

    await check('id')
        .exists()
        .custom(value => typeof value === 'number' || typeof value === 'string')
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    const clientType : AuthClientType = data.type;
    const clientTargetId = data.id;

    const repository = getRepository(Client);
    let entity : Client | undefined;

    switch (clientType) {
        case AuthClientType.SERVICE:
            if (!req.ability.can('manage', 'service')) {
                return res._failForbidden({message: 'You are not allowed to add service-clients.'});
            }

            if(Object.values(SERVICE_ID).indexOf(clientTargetId) === -1) {
                return res._failNotFound();
            }

            const serviceId : SERVICE_ID = clientTargetId;

            entity = await repository.findOne({
                service_id: serviceId
            });

            if (typeof entity !== 'undefined') {
                return res._failBadRequest('A client already exists for that service');
            }

            entity = repository.create({
                name: serviceId,
                service_id: serviceId,
                type: clientType
            });
            break;
        case AuthClientType.USER:
            return res._failForbidden('Not implemented yet... ^^')
    }

    await repository.save(entity);

    return res._respondCreated({data: entity});
}

