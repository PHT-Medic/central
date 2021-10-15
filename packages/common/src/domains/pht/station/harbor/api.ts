/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {buildRegistryHarborProjectName} from "../../../../config";
import {
    deleteHarborProject,
    ensureHarborProject,
    findHarborProject,
    HarborProject
} from "../../../service";

export async function findStationHarborProject(id: string | number): Promise<HarborProject | undefined> {
    const projectName: string = buildRegistryHarborProjectName(id);

    return await findHarborProject(projectName, true);
}

export async function deleteStationHarborProject(id: string | number): Promise<void> {
    const name: string = buildRegistryHarborProjectName(id);

    await deleteHarborProject(name, true);
}

export async function ensureStationHarborProject(id: string | number): Promise<HarborProject> {
    const name: string = buildRegistryHarborProjectName(id);

    return await ensureHarborProject(name);
}
