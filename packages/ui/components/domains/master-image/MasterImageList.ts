/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { MasterImage } from '@personalhealthtrain/central-common';
import type {
    DomainListSlotsType,
} from '../../../core';
import {
    createDomainListBuilder,
    defineDomainListEvents,
    defineDomainListProps,
} from '../../../core';

export default defineComponent({
    name: 'MasterImageList',
    props: defineDomainListProps<MasterImage>(),
    slots: Object as SlotsType<DomainListSlotsType<MasterImage>>,
    emits: defineDomainListEvents<MasterImage>(),
    setup(props, ctx) {
        const { build } = createDomainListBuilder<MasterImage>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().masterImage.getMany(buildInput),
            queryFilter: (q) => ({
                path: q.length > 0 ? `~${q}` : q,
            }),
            query: {
                sort: {
                    path: 'ASC',
                },
            },
            defaults: {
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
            },
        });

        return () => build();
    },
});
