import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getTrains(options?: RequestRecord) {
    const {data: response} = await useApi('auth').get('pht/trains'+formatRequestRecord(options));
    return response;
}

export async function getTrain(id: string) {
    const {data: response} = await useApi('auth').get('pht/trains/'+id);

    return response;
}

export async function dropTrain(id: string) {
    const {data: response} = await useApi('auth').delete('pht/trains/'+id);

    return response;
}

export async function editApiTrain(id: number, data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('pht/trains/'+id , data);

    return response;
}

export async function addTrain(data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('pht/trains', data);

    return response;
}

export async function runTrainBuilderTaskApi(id: string, task: string, data: Record<string,any> = {}) {
    const actionData = {
        task,
        ...data
    };

    const {data: response} = await useApi('auth').post('pht/trains/' + id + '/train-builder-task', actionData);

    return response;
}

export async function runTrainTask(id: string, task: string, data: Record<string,any> = {}) {
    const actionData = {
        task,
        ...data
    };

    const {data: response} = await useApi('auth').post('pht/trains/' + id + '/train-task', actionData);

    return response;
}

export async function generateTrainHashApi(id: string) {
    const {data: response} = await useApi('auth').post('pht/trains/' + id + '/hash-generate');

    return response;
}
