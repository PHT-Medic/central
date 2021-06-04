import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getTrains(options?: RequestRecord) {
    const {data: response} = await useApi('auth').get('trains'+formatRequestRecord(options));
    return response;
}

export async function getTrain(id: string) {
    const {data: response} = await useApi('auth').get('trains/'+id);

    return response;
}

export async function dropTrain(id: string) {
    const {data: response} = await useApi('auth').delete('trains/'+id);

    return response;
}

export async function editTrain(id: number, data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('trains/'+id , data);

    return response;
}

export async function addTrain(data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('trains', data);

    return response;
}

type TrainTaskType = 'build' | 'start' | 'stop' | 'scanHarbor' | 'generateHash';
export async function runTrainTask(id: string, task: TrainTaskType, data: Record<string,any> = {}) {
    const actionData = {
        task,
        ...data
    };

    const {data: response} = await useApi('auth').post('trains/' + id + '/task', actionData);

    return response;
}
