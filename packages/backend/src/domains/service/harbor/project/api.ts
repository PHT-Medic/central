import {useHarborApi} from "../../../../modules/api/service/harbor";

export type HarborProject = {
    name: string,
    id: number
}

export async function findHarborProject(id: string | number, isProjectName: boolean = false) : Promise<HarborProject> {
    const headers : Record<string, any> = {};

    if(isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    try {
        const {data} = await useHarborApi()
            .get('projects/' + id);

        return {
            name: data.name,
            id: data.project_id
        };
    } catch (e) {
        if(e.response.status === 404) {
            return undefined;
        }

        throw e;
    }
}

export async function ensureHarborProject(name: string) {
    try {
        await useHarborApi()
            .post('projects', {
                project_name: name,
                public: true
            });

        return await findHarborProject(name, true);
    } catch (e) {
        if(e.response.status === 409) {
            return await findHarborProject(name, true);
        }

        throw e;
    }
}

export async function deleteHarborProject(id: string | number, isProjectName: boolean = false) {
    const headers : Record<string, any> = {};

    if(isProjectName) {
        headers['X-Is-Resource-Name'] = true;
    }

    await useHarborApi()
        .delete('projects/' + id, headers);
}
