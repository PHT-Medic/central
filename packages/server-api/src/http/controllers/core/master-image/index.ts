/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { MasterImage, MasterImageCommand } from '@personalhealthtrain/core';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    commandMasterImageRouteHandler,
    deleteMasterImageRouteHandler,
    getManyMasterImageRouteHandler,
    getOneMasterImageRouteHandler,
} from './handlers';

type PartialMasterImage = Partial<MasterImage>;

@DTags('master-image')
@DController('/master-images')
export class MasterImageController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImage[]> {
        return await getManyMasterImageRouteHandler(req, res) as PartialMasterImage[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImage | undefined> {
        return await getOneMasterImageRouteHandler(req, res) as PartialMasterImage | undefined;
    }

    @DPost('/command', [ForceLoggedInMiddleware])
    async runCommand(
    @DBody() data: {
        command: MasterImageCommand
    },
    @DRequest() req: any,
    @DResponse() res: any,
    ) {
        return commandMasterImageRouteHandler(req, res);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImage | undefined> {
        return deleteMasterImageRouteHandler(req, res);
    }
}
