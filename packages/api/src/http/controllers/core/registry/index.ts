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
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    createRegistryRouteHandler,
    deleteRegistryRouteHandler,
    getManyRegistryRouteHandler,
    getOneRegistryRouteHandler,
    updateRegistryRouteHandler,
} from './handlers';

type PartialRegistry = Partial<Registry>;

@DTags('registry')
@DController('/registries')
export class RegistryController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistry[]> {
        return await getManyRegistryRouteHandler(req, res) as PartialRegistry[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await getOneRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async update(
        @DPath('id') id: string,
            @DBody() data: Registry,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await updateRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: Registry,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await createRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialRegistry | undefined> {
        return await deleteRegistryRouteHandler(req, res) as PartialRegistry | undefined;
    }
}
