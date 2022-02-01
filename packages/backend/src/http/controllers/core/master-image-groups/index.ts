/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImageGroup } from '@personalhealthtrain/ui-common';

import {
    Controller, Delete, Get, Params, Request, Response,
} from '@decorators/express';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    deleteMasterImageGroupRouteHandler,
    getManyMasterImageGroupRouteHandler,
    getOneMasterImageGroupRouteHandler,
} from './handlers';

type PartialMasterImageGroup = Partial<MasterImageGroup>;

@SwaggerTags('pht')
@Controller('/master-image-groups')
export class MasterImageGroupController {
    @Get('', [ForceLoggedInMiddleware])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImageGroup[]> {
        return await getManyMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup[];
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await getOneMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await deleteMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }
}
