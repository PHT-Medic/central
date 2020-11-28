import {useApi} from "~/modules/api";
import {formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getStations(options: RequestRecord) {
    try {
        const response = await useApi('auth').get('pht/stations' + formatRequestRecord(options));

        return response.data;
    } catch (e) {
        throw new Error('Die Stationen konnten nicht geladen werden.');
    }
}

export async function getStation(id: number) {
    try {
        const response = await useApi('auth').get('pht/stations/' + id);

        return response.data;
    } catch (e) {
        throw new Error('Die Station konnte nicht geladen werden.');
    }
}

export async function addStation(data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('pht/stations', data);

        return response.data;
    } catch (e) {
        throw new Error('Die Stationen konnte nicht erstellt werden.');
    }
}

export async function editStation(id: number, data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('pht/stations/'+id, data);

        return response.data;
    } catch (e) {
        throw new Error('Die Stationen konnte nicht editiert werden.');
    }
}

export async function dropStation(id: number) {
    try {
        const response = await useApi('auth').delete('pht/stations/'+id);

        return response.data;
    } catch (e) {
        throw new Error('Die Stationen konnte nicht editiert werden.');
    }
}
