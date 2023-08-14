/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import type {
    UserSecret,
} from '@personalhealthtrain/core';
import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    createUserSecretRouteHandler,
    deleteUserSecretRouteHandler,
    getManyUserSecretRouteHandler,
    getOneUserSecretRouteHandler,
    updateUserSecretRouteHandler,
} from './handlers';

@DTags('user')
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
        @DPath('id') id: string,
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
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
            @DBody() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return updateUserSecretRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ) : Promise<UserSecret> {
        return deleteUserSecretRouteHandler(req, res);
    }
}
