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

@SwaggerTags('service')
@Controller("/services")
export class ServiceController {
    @Post("/:id/hook", [ForceLoggedInMiddleware])
    async handleHarborHook(
        @Request() req: any,
        @Response() res: any,
        @Body() harborHook: HarborHook
    ) {
        const {id} = req.params;

        switch (id) {
            case SERVICE_ID.REGISTRY:
                return await postHarborHookRouteHandler(req, res);
        }

        return res._failNotFound();
    }

    @Post("/:id/command", [ForceLoggedInMiddleware])
    async execHarborTask(
        @Request() req: any,
        @Response() res: any,
        @Body() data: {command: RegistryCommand},
    ) {
        const {id} = req.params;

        switch (id) {
            case SERVICE_ID.REGISTRY:
                return await doRegistryCommand(req, res);
            case SERVICE_ID.SECRET_STORAGE:
                return await doSecretStorageCommand(req, res);
        }

        return res._failNotFound();
    }
}
