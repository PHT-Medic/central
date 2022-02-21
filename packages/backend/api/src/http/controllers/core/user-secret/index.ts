/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import {
    UserSecret,
} from '@personalhealthtrain/ui-common';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createUserSecretRouteHandler,
    deleteUserSecretRouteHandler,
    getManyUserSecretRouteHandler,
    getOneUserSecretRouteHandler,
    updateUserSecretRouteHandler,
} from './handlers';

@SwaggerTags('user', 'pht')
@Controller('/user-secrets')
export class UserSecretController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ) : Promise<UserSecret> {
        return getManyUserSecretRouteHandler(req, res);
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async get(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<UserSecret> {
        return getOneUserSecretRouteHandler(req, res);
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Request() req: any,
            @Response() res: any,
            @Body() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return createUserSecretRouteHandler(req, res);
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async edit(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
            @Body() data: Pick<UserSecret, 'type' | 'content'>,
    ) : Promise<UserSecret> {
        return updateUserSecretRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ) : Promise<UserSecret> {
        return deleteUserSecretRouteHandler(req, res);
    }
}
