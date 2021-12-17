/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImageCommand } from '@personalhealthtrain/ui-common';
import { BadRequestError, NotFoundError } from '@typescript-error/http';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { syncGitRepository } from './commands/sync-git-repository';
import { syncPushedMasterImages } from './commands/sync-pushed';

export async function handleMasterImageCommandRouteHandler(req: ExpressRequest, res: ExpressResponse) {
    if (
        !req.body ||
        Object.values(MasterImageCommand).indexOf(req.body.command) === -1
    ) {
        throw new BadRequestError('The master image command is not valid.');
    }

    const { command } = req.body;

    switch (command) {
        case MasterImageCommand.SYNC_PUSHED:
            return syncPushedMasterImages(req, res);
        case MasterImageCommand.SYNC_GIT_REPOSITORY: {
            return syncGitRepository(req, res);
        }
    }

    throw new NotFoundError();
}
