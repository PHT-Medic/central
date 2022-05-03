/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    RegistryProject,
} from '@personalhealthtrain/central-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    createRegistryProjectRouteHandler,
    deleteRegistryProjectRouteHandler,
    getManyRegistryProjectRouteHandler,
    getOneRegistryProjectRouteHandler,
    updateRegistryProjectRouteHandler,
} from './handlers';

type PartialRegistryProject = Partial<RegistryProject>;

@SwaggerTags('registry')
@Controller('/registry-projects')
export class RegistryProjectController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistryProject[]> {
        return await getManyRegistryProjectRouteHandler(req, res) as PartialRegistryProject[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await getOneRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    async update(
        @Params('id') id: string,
            @Body() data: RegistryProject,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await updateRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @Post('', [ForceLoggedInMiddleware])
    async add(
        @Body() data: RegistryProject,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await createRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await deleteRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }
}
