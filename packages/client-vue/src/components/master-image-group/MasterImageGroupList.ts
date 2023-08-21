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
    createList,
    defineListEvents,
    defineListProps,
} from '../../core';
import type { ListSlotsType } from '../../core';

export default defineComponent({
    props: defineListProps<MasterImageGroup>(),
    slots: Object as SlotsType<ListSlotsType<MasterImageGroup>>,
    emits: defineListEvents<MasterImageGroup>(),
    setup(props, ctx) {
        const { render, setDefaults } = createList({
            type: `${DomainType.MASTER_IMAGE_GROUP}`,
            props,
            setup: ctx,
        });

        setDefaults({
            noMore: {
                content: 'No more master-image-groups available...',
            },
        });

        return () => render();
    },
});
