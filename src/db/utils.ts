import {Brackets, SelectQueryBuilder} from "typeorm";

export function onlyRealmPermittedQueryResources<T>(query: SelectQueryBuilder<T>, realm: string, queryField: string | Array<string> = 'realm_id') {
    if(realm === 'master') return;

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


