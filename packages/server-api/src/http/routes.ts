/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { decorators } from '@routup/decorators';
import {
    useRequestBody,
} from '@routup/basic/body';
import {
    useRequestCookie,
    useRequestCookies,
} from '@routup/basic/cookie';
import {
    useRequestQuery,
} from '@routup/basic/query';
import type { Router } from 'routup';
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

export function registerControllers(router: Router) {
    router.use(decorators({
        controllers: [
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
        ],
        parameter: {
            body: (context, name) => {
                if (name) {
                    return useRequestBody(context.request, name);
                }

                return useRequestBody(context.request);
            },
            cookie: (context, name) => {
                if (name) {
                    return useRequestCookie(context.request, name);
                }

                return useRequestCookies(context.request);
            },
            query: (context, name) => {
                if (name) {
                    return useRequestQuery(context.request, name);
                }

                return useRequestQuery(context.request);
            },
        },
    }));

    return router;
}
