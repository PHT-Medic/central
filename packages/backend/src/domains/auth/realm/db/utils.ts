import {Brackets, SelectQueryBuilder} from "typeorm";
import {MASTER_REALM_ID} from "../index";
import {User} from "../../user";

export function onlyRealmPermittedQueryResources<T>(query: SelectQueryBuilder<T>, realm: string, queryField: string | string[] = 'realm_id') {
    if(realm === MASTER_REALM_ID) return;

    return query.andWhere(new Brackets(qb => {
        if(Array.isArray(queryField)) {

            for(let i=0; i<queryField.length; i++) {
                qb.orWhere(queryField[i]+' = :realm'+i, {['realm'+i]: realm});
            }
        } else {
            qb.where(queryField+' = :realm', {realm});
        }
    }));
}

/**
 * Check if owner realm is permitted for resource realm.
 *
 * @param realmId
 * @param resourceRealmId
 */
export function isPermittedForResourceRealm(realmId: string | undefined, resourceRealmId: string | undefined) : boolean {
    if(typeof realmId === 'undefined') return false;

    if(realmId === MASTER_REALM_ID) return true;

    return realmId === resourceRealmId;
}

/**
 * @deprecated
 * @param sessionUser
 * @param resource
 */
export function isRealmPermittedForResource(sessionUser: User | undefined, resource: { [key: string]: any }) {
    if (typeof sessionUser === 'undefined') {
        return false;
    }

    if (sessionUser.realm_id === 'master') {
        return true;
    }

    const realmIdKey = 'realm_id';

    if (!resource.hasOwnProperty(realmIdKey)) {
        return false;
    }

    return resource[realmIdKey] === sessionUser.realm_id
}
