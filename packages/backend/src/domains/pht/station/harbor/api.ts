import {
    deleteHarborProject,
    ensureHarborProject,
    findHarborProject,
    HarborProject
} from "../../../service/harbor/project/api";

export function buildStationHarborProjectName(id: string | number) {
    return 'station_' + id;
}

export async function findStationHarborProject(id: string | number): Promise<HarborProject | undefined> {
    const projectName: string = buildStationHarborProjectName(id);

    return await findHarborProject(projectName, true);
}

export async function deleteStationHarborProject(id: string | number): Promise<void> {
    const name: string = buildStationHarborProjectName(id);

    await deleteHarborProject(name, true);
}

export async function ensureStationHarborProject(id: string | number): Promise<HarborProject> {
    const name: string = buildStationHarborProjectName(id);

    return await ensureHarborProject(name);
}
