/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '../log';

export function requireFromEnv<T>(key: string, alt?: T) : T | string {
    if (
        typeof process.env[key] === 'undefined' &&
        typeof alt === 'undefined'
    ) {
        useLogger().error(`Missing variable: ${key}`);

        return process.exit(1);
    }

    return (process.env[key] ?? alt) as T | string;
}

export function requireBooleanFromEnv(key: string, alt?: boolean): boolean | undefined {
    const value = requireFromEnv(key, alt);

    switch (value) {
        case true:
        case 'true':
        case 't':
        case '1':
            return true;
        case false:
        case 'false':
        case 'f':
        case '0':
            return false;
    }

    return alt ?? !!value;
}

export function requireIntegerFromEnv(key: string, alt?: number): number {
    const value = requireFromEnv(key, alt);
    const intValue = parseInt(`${value}`, 10);

    if (Number.isNaN(intValue)) {
        return alt;
    }

    return intValue;
}
