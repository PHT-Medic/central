/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { RegistryCommand, ServiceID } from '@personalhealthtrain/central-common';
import { SwaggerTags } from '@trapi/swagger';
import {
    Body, Controller, Post, Request, Response,
} from '@decorators/express';

import { NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import { postHarborHookRouteHandler } from './handlers/registry/hook';

import { handleSecretStorageCommandRouteHandler } from './handlers/secret-storage/command';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { RegistryHook } from '../../../../domains/special/registry';
import { handleStationRegistryCommandRouteHandler } from './handlers/station-registry/command';
import { handleRegistryCommandRouteHandler } from './handlers/registry/command';

@SwaggerTags('extra')
@Controller('/services')
export class ServiceController {
    @Post('/:id/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
    @Request() req: ExpressRequest,
        @Response() res: ExpressResponse,
        @Body() harborHook: RegistryHook,
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
                return handleRegistryCommandRouteHandler(req, res);
            case ServiceID.SECRET_STORAGE:
                return handleSecretStorageCommandRouteHandler(req, res);
            case ServiceID.STATION_REGISTRY:
                return handleStationRegistryCommandRouteHandler(req, res);
        }

        throw new NotFoundError();
    }
}
