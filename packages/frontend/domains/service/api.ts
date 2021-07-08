import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getServices(options?: RequestRecord) {
    const {data} = await useApi('auth').get('services' + formatRequestRecord(options));

    return data;
}

export async function getService(id: string) {
    const {data} = await useApi('auth').get('services/' + id);

    return data;
}

export async function doServiceTask(id: number, task: string, data: Record<string, any>) {
    const {data: resultData} = await useApi('auth').post('services/'+id + '/task', {task, ...data});

    return resultData;
}
