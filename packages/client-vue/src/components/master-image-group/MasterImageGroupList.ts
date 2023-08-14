/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@personalhealthtrain/core';
import type { MasterImageGroup } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import {
    createEntityList,
    defineDomainListEvents,
    defineDomainListProps,
} from '../../core';
import type { EntityListSlotsType } from '../../core';

export default defineComponent({
    props: defineDomainListProps<MasterImageGroup>(),
    slots: Object as SlotsType<EntityListSlotsType<MasterImageGroup>>,
    emits: defineDomainListEvents<MasterImageGroup>(),
    setup(props, ctx) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.MASTER_IMAGE_GROUP}`,
            props,
            setup: ctx,
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Master Image Groups',
            },

            noMore: {
                content: 'No more master-image-groups available...',
            },
        });

        return () => render();
    },
});
