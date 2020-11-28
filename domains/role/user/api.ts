import {buildUrlRelationsSuffix, changeResponseKeyCase, formatRequestRecord, RequestRecord} from "~/modules/api/utils";
import {useApi} from "~/modules/api";

export async function getRoleUsers(roleId: number, type: 'self' | 'related', options?: RequestRecord) {
    let url = buildUrlRelationsSuffix('roles', roleId, 'users', type);

    try {
        let response = await useApi('auth').get(url + formatRequestRecord(options));
        let data = response.data;

        return changeResponseKeyCase(data);
    } catch (e) {
        throw new Error('Die Rollen Benutzer konnten nicht geladen werden.');
    }
}
