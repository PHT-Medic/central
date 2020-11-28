import { camelCase, snakeCase } from 'change-case';

export function buildUrlRelationsSuffix(uriResourceName: string, uriResourceId: number | string, UriRelationName: string, type: 'self' | 'related') {
    let url = uriResourceName+'/'+uriResourceId;

    switch (type) {
        case 'self':
            url += '/relationships'
            break;
        case 'related':
            break;
    }

    url += '/'+UriRelationName;

    return url;
}

export function changeKeyCase(stringCase: 'camelCase' | 'snakeCase', data: Record<string, any> | Record<string, any>[]) : Record<string, any> | Record<string, any>[] {
    if(Array.isArray(data)) {
        const res : Record<string, any>[] = [];
        for(let i=0; i<data.length; i++) {
            res.push(changeKeyCase(stringCase, data[i]));
        }

        return res;
    }

    const ob : Record<string, any> = {};

    for(let key in data) {
        if(data.hasOwnProperty(key)) {
            let caseKey : string;
            switch (stringCase) {
                case "camelCase":
                    caseKey = camelCase(key);
                    break;
                case "snakeCase":
                    caseKey = snakeCase(key);
                    break;
            }

            if(data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
                ob[caseKey] = changeKeyCase(stringCase, data[key]);
            } else {
                ob[caseKey] = data[key];
            }
        }
    }

    return ob;
}

export function changeResponseKeyCase(data: Record<string, any> | Record<string, any>[]) {
    return changeKeyCase('camelCase', data);
}

export function changeRequestKeyCase(data: Record<string, any> | Record<string, any>[]) {
    return changeKeyCase('snakeCase', data);
}

export type RequestRecord = {
    filter?: {
        [key: string] : any
    },
    fields?: {
        [key: string] : string[] | string
    },
    sort?: {
        [key: string] : 'asc' | 'desc'
    },
    include?: string[],
    page?: {
        limit?: number,
        offset?: number
    }
}

export function formatRequestRecord(record?: RequestRecord) : string {
    if(typeof record === 'undefined' || record === null) return '';

    let output : {[key: string] : any} = {};

    let keys : string[] = ['filter', 'sort', 'include'];
    for(let i=0; i<keys.length; i++) {
        if(record.hasOwnProperty(keys[i])) {
            // @ts-ignore
            output[keys[i]] = record[keys[i]];
        }
    }

    if(typeof record.filter !== 'undefined') {
        output.filter = record.filter;
    }

    if(typeof record.sort !== 'undefined') {
        let sort = [];

        for(let key in record.sort) {
            sort.push((record.sort[key] === 'desc' ? '-' : '') + key);
        }

        output.sort = sort;
    }

    return buildQuery(output);
}

export function buildQuery(data?: any, expectQM?: boolean) {
    if(typeof data === 'undefined' || data === null) return '';

    // If the data is already a string, return it as-is
    if (typeof (data) === 'string') return data;

    // Create a query array to hold the key/value pairs
    let query = [];

    // Loop through the data object
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            let value = data[key];

            if(value && typeof value === 'object' && value.constructor === Array) {
                value = value.join(',');
            }

            if(value && typeof value === 'object' && value.constructor === Object) {
                for(let k in value) {
                    let v : any = value[k];

                    if(v && typeof v === 'object' && v.constructor === Array) {
                        v = v.join(',');
                    }

                    query.push(encodeURIComponent(key+'['+k+']') + '=' + encodeURIComponent(v));
                }

                continue;
            }

            // Encode each key and value, concatenate them into a string, and push them to the array
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    }

    // Join each item in the array with a `&` and return the resulting string
    return (expectQM ? '' : '?') + query.join('&');

};
