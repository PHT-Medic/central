import {Brackets, SelectQueryBuilder} from "typeorm";

function transformRequestFilters(rawFilters: unknown, allowedFilters: Record<string, any>): Record<string, any> {
    let filters: Record<string, any> = {};

    const prototype: string = Object.prototype.toString.call(rawFilters);
    if (prototype !== '[object Object]') {
        return filters;
    }

    filters = <Record<string, any>>rawFilters;

    for (let key in filters) {
        if (!filters.hasOwnProperty(key)) {
            continue;
        }

        if (typeof filters[key] !== 'string') {
            delete filters[key];
        }

        const stripped = filters[key].replace(',', '').trim();

        if (stripped.length === 0 || !allowedFilters.hasOwnProperty(key)) {
            delete filters[key];
        }
    }

    return filters;
}

function transformAllowedFields(rawFilters: string[] | Record<string, any>): Record<string, any> {
    let filters: Record<string, any> = {};

    const allowedFiltersPrototype: string = Object.prototype.toString.call(rawFilters);

    switch (allowedFiltersPrototype) {
        case '[object Array]':
            const tempStrArr = <string[]>rawFilters;
            for (let i = 0; i < tempStrArr.length; i++) {
                filters[tempStrArr[i]] = tempStrArr[i];
            }
            break;
        case '[object Object]':
            filters = rawFilters;
            break;
    }

    return filters;
}

export function applyRequestFilterOnQuery(query: SelectQueryBuilder<any>, rawRequestFilters: unknown, rawAllowedFields: string[] | Record<string, any>) {
    const allowedFields: Record<string, any> = transformAllowedFields(rawAllowedFields);
    const requestFilters = <Record<string, any>>transformRequestFilters(rawRequestFilters, allowedFields);

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

            console.log(allowedFields[key]);

            if (requestFilters[key].includes(',')) {
                let ids = requestFilters[key].split(',');
                qb[run === 1 ? 'where' : 'andWhere'](allowedFields[key] + " IN (:ids)", {ids});
            } else {
                let parameters: Record<string, any> = {};
                const paramKey = 'filter-' + allowedFields[key];
                if (requestFilters[key].charAt(0) === '~') {
                    requestFilters[key] = requestFilters[key].slice(1);
                    parameters[paramKey] = `${requestFilters[key]}%`;
                    qb[run === 1 ? 'where' : 'andWhere'](allowedFields[key] + " LIKE :" + paramKey, parameters);
                } else {
                    parameters[paramKey] = requestFilters[key];
                    qb[run === 1 ? 'where' : 'andWhere'](allowedFields[key] + " = :" + paramKey, parameters);
                }

            }
        }

        return qb;
    }));
}
