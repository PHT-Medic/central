import {useHarborApi} from "../../../modules/api/provider/harbor";


export interface TrainRepository {
    id: number | string,
    name: string,
    artifactsCount: number,
    projectId: number,
    createdAt: string,
    updatedAt: string
}

export async function getTrainRepositories() : Promise<TrainRepository[]> {
    try {
        const result = await useHarborApi().get('projects/pht_outgoing/repositories');

        return result.data.map((item : Record<string, any>) => {
            const trainId : string = item.name.split('/').pop();

            const train: TrainRepository = {
                id: item.id,
                name: item.name,
                projectId: item.project_id,
                updatedAt: item.update_time,
                createdAt: item.creation_time,
                artifactsCount: item.artifact_count
            }

            return train;
        });
    } catch (e) {
        throw new Error('Die Züge konnten nicht geladen werden...');
    }
}

