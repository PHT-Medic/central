/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { APagination } from '@authup/client-vue';

type PaginationLoadFn = (data?: any) => (Promise<void> | void);

export const FPagination = defineComponent({
    props: {
        total: {
            type: Number,
        },
        meta: {
            type: Object,
        },
        busy: {
            type: Boolean,
        },
        load: {
            type: Function as PropType<PaginationLoadFn>,
            required: true,
        },
    },
    setup(props) {
        return () => h(APagination, {
            busy: props.busy,
            load: props.load,
            meta: props.meta,
            total: props.total,
        });
    },
});
