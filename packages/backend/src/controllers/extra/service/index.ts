/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryCommand, ServiceID } from '@personalhealthtrain/ui-common';
import { SwaggerTags } from '@trapi/swagger';
import {
    Body, Controller, Post, Request, Response,
} from '@decorators/express';

import { NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../config/http/middleware/auth';
import { HarborHook, postHarborHookRouteHandler } from './handlers/registry/hook';

import { doRegistryCommand } from './handlers/registry/command';
import { doSecretStorageCommand } from './handlers/secret-storage/command';
import { ExpressRequest, ExpressResponse } from '../../../config/http/type';

@SwaggerTags('extra')
@Controller('/services')
export class ServiceController {
    @Post('/:id/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
    @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body() harborHook: HarborHook,
    ) {
        const { id } = req.params;

        switch (id) {
            case ServiceID.REGISTRY:
                return postHarborHookRouteHandler(req, res);
        }

        throw new NotFoundError();
    }

    @Post('/:id/command', [ForceLoggedInMiddleware])
    async execHarborTask(
    @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body() data: {command: RegistryCommand},
    ) {
        const { id } = req.params;

        switch (id) {
            case ServiceID.REGISTRY:
                return doRegistryCommand(req, res);
            case ServiceID.SECRET_STORAGE:
                return doSecretStorageCommand(req, res);
        }

        throw new NotFoundError();
    }
}
