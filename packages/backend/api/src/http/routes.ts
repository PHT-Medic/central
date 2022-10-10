/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Application } from 'express';
import { attachControllers } from '@decorators/express';
import { RootController } from './controllers/core/root';
import { TrainLogController } from './controllers/core/train-log';
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
import { RegistryController } from './controllers/core/registry';
import { RegistryProjectController } from './controllers/core/registry-project';

export function registerControllers(router: Application) {
    attachControllers(router, [
        RootController,

        // Core
        MasterImageController,
        MasterImageGroupController,
        ProposalController,
        ProposalStationController,
        RegistryController,
        RegistryProjectController,
        StationController,
        TrainController,
        TrainFileController,
        TrainLogController,
        TrainStationController,
        UserSecretController,

        // Extra
        ServiceController,
    ]);

    return router;
}
