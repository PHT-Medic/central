import {SelectQueryBuilder} from "typeorm";

export function applyRequestFilterOnQuery(query: SelectQueryBuilder<any>, requestFilters: any, allowedFilters: string[] | { [key: string] : any }) {
    if(!requestFilters || typeof requestFilters !== 'object') {
        return;
    }

    return query.andWhere((qb) => {
        for(let key in requestFilters) {
            if(!requestFilters.hasOwnProperty(key)) {
                return;
            }

            if(Array.isArray(allowedFilters) && allowedFilters.indexOf(key) !== -1) {
                if(typeof requestFilters[key] === 'string') {
                    let ids = requestFilters[key].split(',');
                    qb.where(key+" IN (:ids)", {ids});
                }

                continue;
            }

            if(typeof allowedFilters === 'object' && Object.keys(allowedFilters).indexOf(key) !== -1) {
                if(!allowedFilters.hasOwnProperty(key)) continue;

                if(
                    typeof requestFilters[key] === 'string'
                ) {
                    let ids = requestFilters[key].split(',');
                    // @ts-ignore
                    qb.where(allowedFilters[key]+" IN (:ids)", {ids});
                }
            }
        }

        return this;
    });
}
