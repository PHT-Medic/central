/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function nullifyEmptyObjectProperties<T extends Record<string, any>>(data: T) : T {
    const keys : (keyof T)[] = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (data[key] === '') {
            data[key] = null as T[keyof T];
        }
    }

    return data as T;
}

export function deleteUndefinedObjectProperties<T extends Record<string, any>>(data: T) : T {
    const keys : string[] = Object.keys(data);

    for (let i = 0; i < keys.length; i++) {
        if (typeof data[keys[i]] === 'undefined') {
            delete data[keys[i]];
        }
    }

    return data;
}
