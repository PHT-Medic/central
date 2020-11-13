import {useApi} from "~/modules/api";
import {changeResponseKeyCase} from "~/modules/api/utils";

export async function getPermissions() {
    try {
        let response = await useApi('auth').get('permissions');

        let data = response.data;

        return changeResponseKeyCase(data);
    } catch (e) {
        throw new Error('Die Berechtigungen konnten nicht geladen werden.');
    }
}
