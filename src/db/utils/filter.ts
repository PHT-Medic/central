import {Brackets, SelectQueryBuilder} from "typeorm";
import {snakeCase} from 'change-case';

function transformRequestFilters(rawFilters: unknown, allowedFilters: Record<string, any>): Record<string, string> {
    let filters: Record<string, any> = {};

    const prototype: string = Object.prototype.toString.call(rawFilters);
    if (prototype !== '[object Object]') {
        return filters;
    }

    filters = <Record<string, any>>rawFilters;

    let result : Record<string, any> = {};

    for (let key in filters) {
        if (!filters.hasOwnProperty(key)) {
            continue;
        }

        if (typeof filters[key] !== 'string') {
            continue;
        }

        const stripped = filters[key].replace(',', '').trim();

        if (stripped.length === 0) {
            continue;
        }

        const newKey : string = snakeCase(key);

        if(!allowedFilters.hasOwnProperty(newKey)) {
            continue;
        }

        result[newKey] = filters[key];
    }

    return result;
}

export function transformAllowedFields(rawFilters: string[] | Record<string, any>): Record<string, string> {
    let filters: Record<string, string> = {};

    const allowedFiltersPrototype: string = Object.prototype.toString.call(rawFilters);
    switch (allowedFiltersPrototype) {
        case '[object Array]':
            const tempStrArr = <string[]>rawFilters;
            for (let i = 0; i < tempStrArr.length; i++) {
                const newKey : string = snakeCase(tempStrArr[i]);
                filters[newKey] = newKey;
            }
            break;
        case '[object Object]':
            rawFilters = (rawFilters as Record<string, any>);
            for(let key in rawFilters) {
                if(!rawFilters.hasOwnProperty(key)) continue;

                const newKey : string = snakeCase(key);

                filters[newKey] = rawFilters[key];
            }
            break;
    }

    return filters;
}

export function applyRequestFilterOnQuery(query: SelectQueryBuilder<any>, rawRequestFilters: unknown, rawAllowedFields: string[] | Record<string, any>) {
    const allowedFields: Record<string, any> = transformAllowedFields(rawAllowedFields);
    const requestFilters : Record<string, any> = transformRequestFilters(rawRequestFilters, allowedFields);

    const requestedFilterLength: number = Object.keys(requestFilters).length;
    if (requestedFilterLength === 0) {
        return;
    }

    return query.andWhere(new Brackets(qb => {
        let run = 0;
        for (let key in requestFilters) {
            if (!requestFilters.hasOwnProperty(key) || !allowedFields.hasOwnProperty(key)) {
                continue;
            }

            run++;

            let value : string = requestFilters[key];

            const paramKey = 'filter-' + allowedFields[key] + '-' + run;
            const whereKind : 'where' | 'andWhere' = run === 1 ? 'where' : 'andWhere';

            let queryString : Array<string> = [
                allowedFields[key]
            ];

            const isUnequalPrefix = value.charAt(0) === '!' && value.charAt(1) === '=';
            if(isUnequalPrefix) value = value.slice(2);

            const isLikeOperator = value.charAt(0) === '~';
            if(isLikeOperator) value = value.slice(1);

            const isInOperator = value.includes(',');

            const isEqualOperator = !isLikeOperator && !isInOperator;

            if(isEqualOperator) {
                if(isUnequalPrefix) {
                    queryString.push("!=");
                } else {
                    queryString.push("=");
                }
            } else {
                if(isUnequalPrefix) {
                    queryString.push('NOT');
                }

                if(isLikeOperator) {
                    queryString.push('LIKE');
                } else {
                    queryString.push('IN');
                }
            }

            if(isLikeOperator) {
                value += '%';
            }

            if(isInOperator) {
                queryString.push('(:'+paramKey+')');
            } else {
                queryString.push(':'+paramKey);
            }

            qb[whereKind](queryString.join(" "), {[paramKey]: isInOperator ? value.split(',') : value});
        }

        if(run === 0) {
            qb.where("true = true");
        }

        return qb;
    }));
}
