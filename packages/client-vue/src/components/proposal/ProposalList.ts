/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Proposal,
} from '@personalhealthtrain/core';
import {
    DomainType,
} from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';

export default defineComponent({
    props: {
        ...defineListProps<Proposal>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<ListSlotsType<Proposal>>,
    emits: defineListEvents<Proposal>(),
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.PROPOSAL}`,
            props,
            setup,
            queryFilters: (q) => ({
                title: q.length > 0 ? `~${q}` : q,
            }),
        });

        setDefaults({
            noMore: {
                content: 'No more proposals available...',
            },
        });

        return () => render();
    },
});
