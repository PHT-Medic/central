/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryAPICommand } from '@personalhealthtrain/central-common';
import { ServiceID } from '@personalhealthtrain/central-common';
import { SwaggerTags } from '@trapi/swagger';
import {
    DBody, DController, DPost, DRequest, DResponse,
} from '@routup/decorators';

import { NotFoundError } from '@ebec/http';
import { Request, Response, useRequestParam } from 'routup';
import { ForceLoggedInMiddleware } from '../../../middleware';
import { postHarborHookRouteHandler } from './handlers/registry/hook';

import { handleSecretStorageCommandRouteHandler } from './handlers/secret-storage/command';
import { RegistryHook } from '../../../../domains/special/registry';
import { handleStationRegistryCommandRouteHandler } from './handlers/station-registry/command';
import { handleRegistryCommandRouteHandler } from './handlers/registry/command';

@SwaggerTags('extra')
@DController('/services')
export class ServiceController {
    @DPost('/:id/hook', [ForceLoggedInMiddleware])
    async handleHarborHook(
    @DRequest() req: Request,
        @DResponse() res: Response,
        @DBody() harborHook: RegistryHook,
    ) {
        const id = useRequestParam(req, 'id');

        switch (id) {
            case ServiceID.REGISTRY:
                return postHarborHookRouteHandler(req, res);
        }

        throw new NotFoundError();
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async execHarborTask(
    @DRequest() req: Request,
        @DResponse() res: Response,
        @DBody() data: { command: RegistryAPICommand },
    ) {
        const id = useRequestParam(req, 'id');

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
