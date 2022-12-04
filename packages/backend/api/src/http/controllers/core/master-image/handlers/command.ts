/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImageCommand } from '@personalhealthtrain/central-common';
import { BadRequestError, NotFoundError } from '@ebec/http';
import { useRequestBody } from '@routup/body';
import { Request, Response } from 'routup';
import { syncGitRepository } from './commands/sync-git-repository';
import { syncPushedMasterImages } from './commands/sync-pushed';

export async function commandMasterImageRouteHandler(req: Request, res: Response) {
    const body = useRequestBody(req);

    if (
        !body ||
        Object.values(MasterImageCommand).indexOf(body.command) === -1
    ) {
        throw new BadRequestError('The master image command is not valid.');
    }

    const { command } = body;

    switch (command) {
        case MasterImageCommand.SYNC_PUSHED:
            return syncPushedMasterImages(req, res);
        case MasterImageCommand.SYNC_GIT_REPOSITORY: {
            return syncGitRepository(req, res);
        }
    }

    throw new NotFoundError();
}
