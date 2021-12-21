/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { HarborProjectWebhook } from './web-hook';
import { HarborRobotAccount } from '../robot-account';

export type HarborProject = {
    name: string,
    id: number,
    webhook?: HarborProjectWebhook,
    robot_account?: HarborRobotAccount
};
export type HarborProjectCreateContext = {
    project_name: string,
    public?: boolean,
    registry_id?: string | number | null,
    storage_limit?: number
};
