/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Application } from 'express';
import { attachControllers } from '@decorators/express';
import { UserSecretController } from '../../controllers/auth/user-secret';
import { MasterImageController } from '../../controllers/core/master-image';
import { ProposalController } from '../../controllers/core/proposal';
import { ProposalStationController } from '../../controllers/core/proposal-station';
import { StationController } from '../../controllers/core/station';
import { TrainController } from '../../controllers/core/train';
import { TrainFileController } from '../../controllers/core/train-file';
import { TrainStationController } from '../../controllers/core/train-station';
import { ServiceController } from '../../controllers/extra/service';
import { ClientController } from '../../controllers/auth/client';
import { MasterImageGroupController } from '../../controllers/core/master-image-groups';
import { TrainResultController } from '../../controllers/core/train-result';

export function registerControllers(router: Application) {
    attachControllers(router, [
        // Extra
        ServiceController,

        ClientController,
        UserSecretController,

        // PHT Controllers
        MasterImageController,
        MasterImageGroupController,

        ProposalController,
        ProposalStationController,
        StationController,
        TrainController,
        TrainFileController,
        TrainResultController,
        TrainStationController,
    ]);

    return router;
}
