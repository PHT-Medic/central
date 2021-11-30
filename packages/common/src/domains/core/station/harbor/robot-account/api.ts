/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildRegistryHarborProjectName } from '../../../../../config';
import {
    HarborRobotAccount,
    dropHarborProjectAccount,
    ensureHarborProjectRobotAccount,
    findHarborRobotAccount,
} from '../../../../extra/service';

export async function findStationHarborProjectRobotAccount(id: string | number, withSecret = true): Promise<HarborRobotAccount | undefined> {
    const name: string = buildRegistryHarborProjectName(id);

    return findHarborRobotAccount(name, withSecret);
}

export async function ensureStationHarborProjectRobotAccount(id: string | number): Promise<HarborRobotAccount> {
    const name: string = buildRegistryHarborProjectName(id);

    return ensureHarborProjectRobotAccount(name);
}

export async function dropStationHarborProjectRobotAccount(id: string | number): Promise<void> {
    const robotAccount = await findStationHarborProjectRobotAccount(id, false);

    if (typeof robotAccount === 'undefined') {
        return;
    }

    await dropHarborProjectAccount(robotAccount.id);
}
