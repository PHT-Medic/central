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
    DBody, DController, DDelete, DGet, DParam, DPost, DRequest, DResponse,
} from '@routup/decorators';
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
@DController('/registry-projects')
export class RegistryProjectController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject[]> {
        return await getManyRegistryProjectRouteHandler(req, res) as PartialRegistryProject[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await getOneRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DParam('id') id: string,
            @DBody() data: RegistryProject,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await updateRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: RegistryProject,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await createRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DParam('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistryProject | undefined> {
        return await deleteRegistryProjectRouteHandler(req, res) as PartialRegistryProject | undefined;
    }
}
