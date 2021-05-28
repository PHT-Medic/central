import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getStations(options?: RequestRecord) {
    try {
        const response = await useApi('auth').get('stations' + formatRequestRecord(options));

        return response.data;
    } catch (e) {
        throw new Error('The stations could not be loaded.');
    }
}

export async function getStation(id: number) {
    try {
        const response = await useApi('auth').get('stations/' + id);

        return response.data;
    } catch (e) {
        throw new Error('The station does not exists or could not be loaded.');
    }
}

export async function addStation(data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('stations', data);

        return response.data;
    } catch (e) {
        throw new Error('The station could not be created..');
    }
}

export async function editStation(id: number, data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('stations/'+id, data);

        return response.data;
    } catch (e) {
        throw new Error('The station could not be edited.');
    }
}

export async function dropStation(id: number) {
    try {
        const response = await useApi('auth').delete('stations/'+id);

        return response.data;
    } catch (e) {
        throw new Error('The station could not be dropped.');
    }
}

export async function doStationTask(id: number, task: string, data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('stations/'+id + '/task', {task, ...data});

        return response.data;
    } catch (e) {
        throw new Error('The station task could not be executed.');
    }
}
