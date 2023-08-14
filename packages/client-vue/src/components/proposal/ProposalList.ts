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
import type { EntityListSlotsType } from '../../core';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';

export default defineComponent({
    props: {
        ...defineDomainListProps<Proposal>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<EntityListSlotsType<Proposal>>,
    emits: defineDomainListEvents<Proposal>(),
    setup(props, setup) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.PROPOSAL}`,
            props,
            setup,
            queryFilters: (q) => ({
                title: q.length > 0 ? `~${q}` : q,
            }),
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Proposals',
                icon: 'fa fa-scroll',
            },

            noMore: {
                content: 'No more proposals available...',
            },
        });

        return () => render();
    },
});
