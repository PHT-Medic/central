import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function getTrainStations(options?: RequestRecord) {
    const {data: response} = await useApi('auth').get('pht/train-stations'+formatRequestRecord(options));
    return response;
}

export async function getTrainStation(id: string) {
    const {data: response} = await useApi('auth').get('pht/train-stations/'+id);

    return response;
}

export async function dropTrainStation(id: string) {
    const {data: response} = await useApi('auth').delete('pht/train-stations/'+id);

    return response;
}

export async function editTrainStation(id: number, data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('pht/train-stations/'+id , data);

    return response;
}

export async function addTrainStation(data: Record<string, any>) {
    const {data: response} = await useApi('auth').post('pht/train-stations', data);

    return response;
}
