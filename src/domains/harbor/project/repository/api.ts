import {useHarborApi} from "../../../../modules/api/provider/harbor";

export interface HarborRepository {
    id: number | string,
    name: string,
    fullName: string,
    artifactsCount?: number,
    projectId: number,
    projectName: string,
    createdAt?: string,
    updatedAt?: string
}

export async function getHarborProjectRepositories(projectName: string) : Promise<HarborRepository[]> {
    const result = await useHarborApi().get('projects/'+projectName+'/repositories');

    return result.data.map((item : Record<string, any>) => {
        const parts : string[] = item.name.split('/');
        const name : string = parts.pop();
        const projectName : string = parts.pop();

        const repository: HarborRepository = {
            id: item.id,
            name,
            fullName: item.name,

            projectId: item.project_id,
            projectName,

            updatedAt: item.update_time,
            createdAt: item.creation_time,
            artifactsCount: item.artifact_count
        }

        return repository;
    });
}
