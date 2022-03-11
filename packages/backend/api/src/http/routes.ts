/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Application } from 'express';
import { attachControllers } from '@decorators/express';
import { UserSecretController } from './controllers/core/user-secret';
import { MasterImageController } from './controllers/core/master-image';
import { ProposalController } from './controllers/core/proposal';
import { ProposalStationController } from './controllers/core/proposal-station';
import { StationController } from './controllers/core/station';
import { TrainController } from './controllers/core/train';
import { TrainFileController } from './controllers/core/train-file';
import { TrainStationController } from './controllers/core/train-station';
import { ServiceController } from './controllers/special/service';
import { MasterImageGroupController } from './controllers/core/master-image-groups';

export function registerControllers(router: Application) {
    attachControllers(router, [
        // Core
        MasterImageController,
        MasterImageGroupController,
        ProposalController,
        ProposalStationController,
        StationController,
        TrainController,
        TrainFileController,
        TrainStationController,
        UserSecretController,

        // Extra
        ServiceController,
    ]);

    return router;
}
