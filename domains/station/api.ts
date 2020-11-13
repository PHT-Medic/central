import {useApi} from "~/modules/api";
import {changeResponseKeyCase} from "~/modules/api/utils";

export async function getStations() {
    try {
        const response = await useApi('resource').get('stations');

        return changeResponseKeyCase(response.data);
    } catch (e) {
        throw new Error('Die Stationen konnten nicht geladen werden.');
    }
}
