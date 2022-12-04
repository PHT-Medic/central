/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImageGroup } from '@personalhealthtrain/central-common';

import {
    DController, DDelete, DGet, DParam, DRequest, DResponse,
} from '@routup/decorators';
import { SwaggerTags } from '@trapi/swagger';
import { ForceLoggedInMiddleware } from '../../../middleware/auth';
import {
    deleteMasterImageGroupRouteHandler,
    getManyMasterImageGroupRouteHandler,
    getOneMasterImageGroupRouteHandler,
} from './handlers';

type PartialMasterImageGroup = Partial<MasterImageGroup>;

@SwaggerTags('master-image')
@DController('/master-image-groups')
export class MasterImageGroupController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImageGroup[]> {
        return await getManyMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await getOneMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialMasterImageGroup | undefined> {
        return await deleteMasterImageGroupRouteHandler(req, res) as PartialMasterImageGroup | undefined;
    }
}
