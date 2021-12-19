/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Application } from 'express';
import { attachControllers } from '@decorators/express';
import { TokenController } from '../../controllers/auth/token';
import { RealmController } from '../../controllers/auth/realm';
import { ProviderController } from '../../controllers/auth/provider';
import { UserController } from '../../controllers/auth/user';
import { UserKeyController } from '../../controllers/auth/user-secret';
import { MasterImageController } from '../../controllers/core/master-image';
import { ProposalController } from '../../controllers/core/proposal';
import { ProposalStationController } from '../../controllers/core/proposal-station';
import { StationController } from '../../controllers/core/station';
import { TrainController } from '../../controllers/core/train';
import { TrainFileController } from '../../controllers/core/train-file';
import { TrainStationController } from '../../controllers/core/train-station';
import { UserRoleController } from '../../controllers/auth/user-role';
import { RoleController } from '../../controllers/auth/role';
import { RolePermissionController } from '../../controllers/auth/role-permission';
import { ServiceController } from '../../controllers/extra/service';
import { ServiceClientController } from '../../controllers/extra/service-client';
import { PermissionController } from '../../controllers/auth/permission';
import { ClientController } from '../../controllers/auth/client';
import { MasterImageGroupController } from '../../controllers/core/master-image-groups';
import { TrainResultController } from '../../controllers/core/train-result';

export function registerControllers(router: Application) {
    attachControllers(router, [
        // Auth Controllers
        TokenController,
        RealmController,
        ProviderController,

        // Extra
        ServiceController,
        ServiceClientController,

        ClientController,
        PermissionController,
        RoleController,
        RolePermissionController,
        UserController,
        UserRoleController,
        UserKeyController,

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
