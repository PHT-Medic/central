import {SelectQueryBuilder} from "typeorm";
import {snakeCase} from "change-case";

function transformRequestFields(raw: unknown, allowedFilters: Record<string, string[]>): Record<string, string[]> {
    const prototype: string = Object.prototype.toString.call(raw);
    if (prototype !== '[object Object]') {
        return {};
    }

    let domains: Record<string, any> = <Record<string, any>>raw;
    let result : Record<string, string[]> = {};

    for (let key in domains) {
        if (!domains.hasOwnProperty(key)) {
            continue;
        }

        const prototype : string = Object.prototype.toString.call(domains[key]);

        if (prototype !== '[object Array]' && prototype !== '[object String]') {
            delete domains[key];
            continue;
        }

        let fields : string[] = prototype === '[object String]' ? domains[key].split(',') : domains[key];

        if (!allowedFilters.hasOwnProperty(key)) {
            continue;
        }

        fields = fields
            .map(field => snakeCase(field))
            .filter(x => allowedFilters[key].includes(x));

        result[key] = fields;
    }

    return result;
}

export function applyRequestFields(query: SelectQueryBuilder<any>, alias: string, fields: unknown, allowedFields: Record<string, string[]> | string[]) {
    let allowed : Record<string, string[]> = {};

    if(Array.isArray(allowedFields)) {
        allowed[alias] = allowedFields.map(allowedField => snakeCase(allowedField));
    } else {
        for(let key in allowedFields) {
            if(!allowedFields.hasOwnProperty(key)) continue;

            allowed[key] = allowedFields[key].map(allowedField => snakeCase(allowedField));
        }
    }

    const domains: Record<string, string[]> = transformRequestFields(fields, allowed);

    for (let key in domains) {
        if (!domains.hasOwnProperty(key)) continue;

        for(let i=0; i<domains[key].length; i++) {
            query.addSelect(key+'.'+domains[key][i]);
        }
    }

    return query;
}
