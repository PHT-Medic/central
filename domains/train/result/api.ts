import {useApi} from "~/modules/api";

export async function runTrainResultTask(id: string, task: string, data: Record<string,any> = {}) {
    const actionData = {
        task,
        ...data
    };

    const {data: response} = await useApi('auth').post('pht/train-results/' + id + '/task', actionData);

    return response;
}
