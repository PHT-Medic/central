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

function changeArrayKeyCase(stringCase: 'camelCase' | 'snakeCase', data: any[]) {
    const res : Record<string, any>[] = [];
    for(let i=0; i<data.length; i++) {
        res.push(changeKeyCase(stringCase, data[i]));
    }

    return res;
}

export function changeKeyCase(stringCase: 'camelCase' | 'snakeCase', data: any) : Record<string, any> | Record<string, any>[] {
    const prototype = Object.prototype.toString.call(data);
    switch (prototype) {
        case '[object Array]':
            data = changeArrayKeyCase(stringCase, data);
            break;
        case '[object Object]':
            let ob : Record<string, any> = {};

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

                    if(data[key]) {
                        const childPrototype = Object.prototype.toString.call(data[key]);
                        switch (childPrototype) {
                            case '[object Array]':
                                ob[caseKey] = changeArrayKeyCase(stringCase, data[key]);
                                break;
                            case '[object Object]':
                                ob[caseKey] = changeKeyCase(stringCase, data[key]);
                                break;
                            default:
                                ob[caseKey] = data[key];
                                break;
                        }
                    } else {
                        ob[caseKey] = data[key];
                    }
                }
            }

            data = ob;
            break;
    }

    return data;
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

    let keys : string[] = ['filter', 'sort', 'include', 'page', 'fields'];
    for(let i=0; i<keys.length; i++) {
        if(record.hasOwnProperty(keys[i])) {
            // @ts-ignore
            output[keys[i]] = record[keys[i]];
        }
    }

    if(typeof record.filter !== 'undefined') {
        output.filter = record.filter;
    }

    if(typeof record.fields !== 'undefined') {
        output.fields = record.fields;
    }

    if(typeof record.page !== 'undefined') {
        output.page = record.page;
    }

    if(typeof record.sort !== 'undefined') {
        let sort : string[] = [];

        for(let key in record.sort) {
            const direction : string = record.sort[key] === 'desc' ? '-' : '';
            sort.push(direction + key);
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
    let query : string[] = [];

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

                    const qV : string = encodeURIComponent(key+'['+k+']')+ '=' + encodeURIComponent(v);
                    query.push(qV);
                }

                continue;
            }

            // Encode each key and value, concatenate them into a string, and push them to the array
            const q : string = encodeURIComponent(key) + '=' + encodeURIComponent(value);
            query.push(q);
        }
    }

    // Join each item in the array with a `&` and return the resulting string
    return (expectQM ? '' : '?') + query.join('&');

};
