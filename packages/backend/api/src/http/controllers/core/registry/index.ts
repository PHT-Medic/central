/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Registry,
} from '@personalhealthtrain/central-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createRegistryRouteHandler,
    deleteRegistryRouteHandler,
    getManyRegistryRouteHandler,
    getOneRegistryRouteHandler,
    updateRegistryRouteHandler,
} from './handlers';

type PartialRegistry = Partial<Registry>;

@SwaggerTags('registry')
@Controller('/registries')
export class RegistryController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistry[]> {
        return await getManyRegistryRouteHandler(req, res) as PartialRegistry[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await getOneRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async update(
        @Params('id') id: string,
            @Body() data: Registry,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await updateRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: Registry,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await createRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await deleteRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }
}
