import {useApi} from "~/modules/api";
import {changeRequestKeyCase, changeResponseKeyCase} from "~/modules/api/utils";

export async function getTrains(proposalId: number) {
    try {
        const response = await useApi('resource').get('trains?filter[proposal_id]=' + proposalId);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Züge konnten nicht geladen werden.');
    }
}

export async function getTrain(id: number) {
    try {
        const response = await useApi('resource').get('trains/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Der Zug mit der ID ' + id + ' konnte nicht gefunden werden.');
    }
}

export async function dropTrain(id: number) {
    try {
        const response = await useApi('resource').delete('trains/'+id);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Zug mit der ID ' + id + ' konnte nicht gelöscht werden.');
    }
}

export async function editTrain(id: number, data: Record<string, any>) {
    try {
        const response = await useApi('resource').post('trains/'+id , changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Zug konnte nicht bearbeitet werden.');
    }
}

export async function addTrain(data: Record<string, any>) {
    try {
        let response = await useApi('resource').post('trains', changeRequestKeyCase(data));

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Zug konnte nicht erstellt werden.');
    }
}

export async function doTrainAction(id: number, action: string) {
    try {
        let response = await useApi('resource').get('trains/' + id + '/action/' + action);

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Aktion konnte nicht auf den Zug angewendet werden.');
    }
}
