import {Station} from "../../station";
import {useHarborApi} from "../../../modules/api/service/harbor";

type HarborProject = {
    name: string,
    id: number
}

export function createHarborProjectNameByStationId(stationId: string | number) {
    return 'station_'+stationId;
}

export async function findHarborProject(entity: Station) : Promise<HarborProject | undefined> {
    const projectName: string = createHarborProjectNameByStationId(entity.id);

    const {data} = await useHarborApi()
        .get('projects?name=' + projectName);

    const stations = Array.isArray(data) ? data.filter((policy: { name: string; }) => policy.name === projectName) : [];

    if (stations.length === 1) {
        const project = stations[0];

        return {
            name: project.name,
            id: project.project_id
        };
    }

    return undefined;
}

export async function ensureHarborProject(entity: Station) : Promise<number> {
    const projectName: string = createHarborProjectNameByStationId(entity.id);

    try {
        await useHarborApi()
            .post('projects', {
                project_name: projectName,
                public: true
            });

        return (await findHarborProject(entity)).id;
    } catch (e) {
        if(e.response.status === 409) {
            return (await findHarborProject(entity)).id;
        }

        throw e;
    }
}

export async function dropHarborProject(entity: Station) : Promise<void> {
    if(entity.harbor_project_id) {
        try {
            await useHarborApi()
                .delete('projects/' + entity.harbor_project_id);
        } catch (e) {
            entity.harbor_project_id = null;

            if(e.response.status === 404) {
                return await dropHarborProject(entity);
            }

            throw e;
        }
    } else {
        const name: string = createHarborProjectNameByStationId(entity.id);
        const {data} = await useHarborApi().get('projects?name=' + name + '&page_size=1');

        if (
            Array.isArray(data) &&
            data.length === 1 &&
            data[0].name === name
        ) {
            await useHarborApi()
                .delete('projects/' + data[0].project_id);
        }
    }
}
