/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {TrainBuildStatusType} from "../../pht";

export enum SERVICE_ID {
    REGISTRY = 'REGISTRY',
    SECRET_STORAGE = 'SECRET_STORAGE',
    TRAIN_BUILDER = 'TRAIN_BUILDER',
    TRAIN_ROUTER = 'TRAIN_ROUTER',
    RESULT_SERVICE = 'RESULT_SERVICE'
}

export type ServiceIDType = `${SERVICE_ID}`;
