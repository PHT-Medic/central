/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {SERVICE_ID, RegistryCommand} from "@personalhealthtrain/ui-common";
import {SwaggerTags} from "typescript-swagger";
import {Body, Controller, Post, Request, Response} from "@decorators/express";

import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {HarborHook, postHarborHookRouteHandler} from "./registry/hook";

import {doRegistryCommand} from "./registry/command";
import {doSecretStorageCommand} from "./secret-storage/command";
import {ExpressRequest, ExpressResponse} from "../../../../config/http/type";
import {NotFoundError} from "@typescript-error/http";

@SwaggerTags('service')
@Controller("/services")
export class ServiceController {
    @Post("/:id/hook", [ForceLoggedInMiddleware])
    async handleHarborHook(
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body() harborHook: HarborHook
    ) {
        const {id} = req.params;

        switch (id) {
            case SERVICE_ID.REGISTRY:
                return await postHarborHookRouteHandler(req, res);
        }

        throw new NotFoundError();
    }

    @Post("/:id/command", [ForceLoggedInMiddleware])
    async execHarborTask(
        @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body() data: {command: RegistryCommand},
    ) {
        const {id} = req.params;

        switch (id) {
            case SERVICE_ID.REGISTRY:
                return await doRegistryCommand(req, res);
            case SERVICE_ID.SECRET_STORAGE:
                return await doSecretStorageCommand(req, res);
        }

        throw new NotFoundError();
    }
}
