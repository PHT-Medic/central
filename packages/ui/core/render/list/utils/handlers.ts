/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ListLoadMeta } from '@vue-layout/list-controls';
import type { Ref } from 'vue';

export function buildListCreatedHandler<T extends Record<string, any>>(
    items: Ref<T[]>,
    meta: Ref<ListLoadMeta>,
) {
    return (item: T, options?: { unshift?: boolean}) => {
        options = options || {};

        const index = items.value.findIndex((el: T) => el.id === item.id);
        if (index === -1) {
            meta.value.total++;

            if (options.unshift) {
                items.value.unshift(item);
            } else {
                items.value.push(item);
            }
        }
    };
}

export function buildListUpdatedHandler<T extends Record<string, any>>(items: Ref<T[]>) {
    return (item: T) => {
        const index = items.value.findIndex((el: T) => el.id === item.id);

        if (index !== -1) {
            const keys = Object.keys(item) as (keyof T)[];
            for (let i = 0; i < keys.length; i++) {
                items.value[index][keys[i]] = item[keys[i]];
            }
        }
    };
}

export function buildListDeletedHandler<T extends Record<string, any>>(
    items: Ref<T[]>,
    meta: Ref<ListLoadMeta>,
) {
    return (item: T) => {
        const index = items.value.findIndex((el: T) => el.id === item.id);
        console.log(items.value, item);
        if (index !== -1) {
            meta.value.total--;
            items.value.splice(index, 1);
            console.log(meta.value);
        }
    };
}
