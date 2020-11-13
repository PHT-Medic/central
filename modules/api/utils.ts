import { camelCase, snakeCase } from 'change-case';

export function buildUrlRelationSuffix(prefix: string, userId: number, type: 'self' | 'related') {
    let url = prefix+'/'+userId;

    switch (type) {
        case 'self':
            url += '/relationships'
            break;
        case 'related':
            break;
    }

    url += '/permissions';

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

            ob[caseKey] = data[key];
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
