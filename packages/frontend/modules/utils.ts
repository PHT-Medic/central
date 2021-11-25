/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export function clearObjectProperties(obj: {[key: string] : any}) {
    for (const propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }

        if (obj[propName] === '') {
            obj[propName] = null;
        }
    }

    return obj;
}
