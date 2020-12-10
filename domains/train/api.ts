import {useApi} from "~/modules/api";
import {changeRequestKeyCase, changeResponseKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";

export async function getTrains(options?: RequestRecord) {
    try {
        const response = await useApi('auth').get('pht/trains'+formatRequestRecord(options));

        return response.data;
    } catch (e) {
        throw new Error('Die Züge konnten nicht geladen werden.');
    }
}

export async function getTrain(id: string) {
    try {
        const response = await useApi('auth').get('pht/trains/'+id);

        return response.data;
    } catch (e) {
        throw new Error('Der Zug mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropTrain(id: string) {
    try {
        const response = await useApi('auth').delete('pht/trains/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Zug mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function editApiTrain(id: number, data: Record<string, any>) {
    try {
        const response = await useApi('auth').post('pht/trains/'+id , data);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Zug konnte nicht bearbeitet werden.');
    }
}

export async function addTrain(data: Record<string, any>) {
    try {
        let response = await useApi('auth').post('pht/trains', data);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Zug konnte nicht erstellt werden.');
    }
}

export async function doTrainAction(id: string, action: string) {
    try {
        let response = await useApi('auth').get('pht/trains/' + id + '/action/' + action);

        return response.data;
    } catch (e) {
        throw new Error('Die Aktion konnte nicht auf den Zug angewendet werden.');
    }
}
