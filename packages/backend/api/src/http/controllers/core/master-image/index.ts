/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { MasterImage, MasterImageCommand } from '@personalhealthtrain/central-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import { commandMasterImageRouteHandler } from './handlers/command';
import {
    deleteMasterImageRouteHandler,
    getManyMasterImageRouteHandler,
    getOneMasterImageRouteHandler,
} from './handlers';

type PartialMasterImage = Partial<MasterImage>;

@SwaggerTags('pht')
@Controller('/master-images')
export class MasterImageController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImage[]> {
        return await getManyMasterImageRouteHandler(req, res) as PartialMasterImage[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImage | undefined> {
        return await getOneMasterImageRouteHandler(req, res) as PartialMasterImage | undefined;
    }

    @Post('/command', [ForceLoggedInMiddleware])
    async runCommand(
    @Body() data: {
        command: MasterImageCommand
    },
    @Request() req: any,
    @Response() res: any,
    ) {
        return commandMasterImageRouteHandler(req, res);
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImage | undefined> {
        return deleteMasterImageRouteHandler(req, res);
    }
}
