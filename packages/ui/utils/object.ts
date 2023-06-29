/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Ref } from 'vue';

export function updateObjectProperties<T extends Record<string, any>>(
    src: Ref<T>,
    input: Partial<T>,
) : Ref<T> {
    const keys : (keyof T)[] = Object.keys(input);
    for (let i = 0; i < keys.length; i++) {
        src.value[keys[i]] = input[keys[i]] as T[keyof T];
    }

    return src;
}

export function extendObjectProperties<T extends Record<string, any>>(
    src: T,
    input: Partial<T>,
) : T {
    const keys : (keyof T)[] = Object.keys(input);
    for (let i = 0; i < keys.length; i++) {
        src[keys[i]] = input[keys[i]] as T[keyof T];
    }

    return src;
}

export function initFormAttributesFromSource(
    form: Record<string, any>,
    source?: Record<string, any>,
) : void {
    if (!source) {
        return;
    }

    const keys = Object.keys(form);
    for (let i = 0; i < keys.length; i++) {
        if (Object.prototype.hasOwnProperty.call(source, keys[i])) {
            form[keys[i]] = source[keys[i]] ?? '';
        }
    }
}
