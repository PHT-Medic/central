import {SelectQueryBuilder} from "typeorm";

export function queryFindPermittedResourcesForRealm(query: SelectQueryBuilder<any>, realm: string, realmIdField: string = 'realm_id') {
    if(realm === 'master') return;

    return query.andWhere(realmIdField+' = :realm', {realm});
}

function performWhere(query: SelectQueryBuilder<any>, key: string, value: any, run: number) {
    if(value.includes(',')) {
        let ids = value.split(',');
        if (run === 1) {
            query.where(key + " IN (:ids)", {ids});
        } else {
            query.andWhere(key + " IN (:ids)", {ids});
        }
    } else {
        if (run === 1) {
            query.where(key + " LIKE :id", {id: `%${value}%`});
        } else {
            query.andWhere(key + " LIKE :id", {id: `%${value}%`});
        }
    }

    return query;
}


export function applyRequestFilterOnQuery(query: SelectQueryBuilder<any>, requestFilters: any, allowedFilters: string[] | { [key: string] : any }) {
    if(!requestFilters || typeof requestFilters !== 'object') {
        return;
    }

    for(let key in requestFilters) {
        if (!requestFilters.hasOwnProperty(key)) {
            return;
        }

        if (typeof requestFilters[key] !== 'string') {
            console.log(requestFilters[key]);
            delete requestFilters[key];
        }

        const stripped = requestFilters[key].replace(',','').trim();

        if(stripped.length === 0) {
            delete requestFilters[key];
        }
    }

    const requestedFilterLength : number = Object.keys(requestFilters).length;
    if(requestedFilterLength === 0) {
        return;
    }

    return query.andWhere((qb) => {
        let run = 0;
        for(let key in requestFilters) {
            if(!requestFilters.hasOwnProperty(key)) {
                return;
            }

            run++;

            if(Array.isArray(allowedFilters) && allowedFilters.indexOf(key) !== -1) {
                performWhere(qb, key, requestFilters[key], run);

                continue;
            }

            if(typeof allowedFilters === 'object' && Object.keys(allowedFilters).indexOf(key) !== -1) {
                if(!allowedFilters.hasOwnProperty(key)) continue;

                // @ts-ignore
                performWhere(qb, allowedFilters[key], requestFilters[key], run);
            }
        }

        return this;
    });
}
