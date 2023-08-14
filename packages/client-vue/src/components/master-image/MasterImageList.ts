/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { MasterImage } from '@personalhealthtrain/core';
import type { EntityListSlotsType } from '../../core';
import {
    createEntityList,
    defineDomainListEvents,
    defineDomainListProps,
} from '../../core';

export default defineComponent({
    props: defineDomainListProps<MasterImage>(),
    slots: Object as SlotsType<EntityListSlotsType<MasterImage>>,
    emits: defineDomainListEvents<MasterImage>(),
    setup(props, ctx) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.MASTER_IMAGE}`,
            props,
            setup: ctx,
            queryFilters: (q) => ({
                path: q.length > 0 ? `~${q}` : q,
            }),
            query: {
                sort: {
                    path: 'ASC',
                },
            },
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Master Images',
                icon: 'fa fa-compact-disc',
            },

            item: {
                textPropName: 'virtual_path',
            },

            noMore: {
                content: 'No more master-images available...',
            },
        });

        return () => render();
    },
});
