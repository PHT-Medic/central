/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import {
    createDomainListBuilder,
    defineDomainListEvents,
    defineDomainListProps,
} from '../../../core';
import type {
    DomainListSlotsType,
} from '../../../core';

export default defineComponent({
    name: 'MasterImageGroupList',
    props: defineDomainListProps<MasterImageGroup>(),
    slots: Object as SlotsType<DomainListSlotsType<MasterImageGroup>>,
    emits: defineDomainListEvents<MasterImageGroup>(),
    setup(props, ctx) {
        const { build } = createDomainListBuilder<MasterImageGroup>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().masterImageGroup.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Master Image Groups',
                },

                noMore: {
                    content: 'No more master-image-groups available...',
                },
            },
        });

        return () => build();
    },
});
