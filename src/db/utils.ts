import {SelectQueryBuilder} from "typeorm";

export function queryFindPermittedResourcesForRealm(query: SelectQueryBuilder<any>, realm: string, realmIdField: string = 'realm_id') {
    if(realm === 'master') return;

    return query.andWhere(realmIdField+' = :realm', {realm});
}


