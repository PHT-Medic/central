/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DBody, DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';
import type {
    UserSecret,
} from '@personalhealthtrain/central-common';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createUserSecretRouteHandler,
    deleteUserSecretRouteHandler,
    getManyUserSecretRouteHandler,
    getOneUserSecretRouteHandler,
    updateUserSecretRouteHandler,
} from './handlers';

@SwaggerTags('user')
@DController('/user-secrets')
export class UserSecretController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ) : Promise<UserSecret> {
        return getManyUserSecretRouteHandler(req, res);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async get(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ) : Promise<UserSecret> {
        return getOneUserSecretRouteHandler(req, res);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DRequest() req: any,
            @DResponse() res: any,
            @DBody() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return createUserSecretRouteHandler(req, res);
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
            @DBody() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return updateUserSecretRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ) : Promise<UserSecret> {
        return deleteUserSecretRouteHandler(req, res);
    }
}
