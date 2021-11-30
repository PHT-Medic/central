/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Application } from 'express';
import { attachControllers } from '@decorators/express';
import { TokenController } from '../../app/controllers/auth/token';
import { RealmController } from '../../app/controllers/auth/realm';
import { ProviderController } from '../../app/controllers/auth/provider';
import { UserController } from '../../app/controllers/auth/user';
import { UserKeyController } from '../../app/controllers/auth/user-secret';
import { MasterImageController } from '../../app/controllers/core/master-image';
import { ProposalController } from '../../app/controllers/core/proposal';
import { ProposalStationController } from '../../app/controllers/core/proposal-station';
import { StationController } from '../../app/controllers/core/station';
import { TrainController } from '../../app/controllers/core/train';
import { TrainFileController } from '../../app/controllers/core/train-file';
import { TrainStationController } from '../../app/controllers/core/train-station';
import { UserRoleController } from '../../app/controllers/auth/user-role';
import { RoleController } from '../../app/controllers/auth/role';
import { RolePermissionController } from '../../app/controllers/auth/role-permission';
import { ServiceController } from '../../app/controllers/extra/service';
import { ServiceClientController } from '../../app/controllers/extra/service-client';
import { PermissionController } from '../../app/controllers/auth/permission';
import { ClientController } from '../../app/controllers/auth/client';
import { MasterImageGroupController } from '../../app/controllers/core/master-image-groups';

export function registerControllers(router: Application) {
    attachControllers(router, [
        // Auth Controllers
        TokenController,
        RealmController,
        ProviderController,

        // Service
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
        TrainStationController,
    ]);

    return router;
}
