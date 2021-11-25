/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export const isUnset = (o: any) => typeof o === 'undefined' || o === null;
export const isSet = (o: any) => !isUnset(o);

export function encodeValue(val: any) {
    if (typeof val === 'string') {
        return val;
    }
    return JSON.stringify(val);
}

export function decodeValue(val: any) {
    // Try to parse as json
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (_) {

        }
    }

    // Return as is
    return val;
}
