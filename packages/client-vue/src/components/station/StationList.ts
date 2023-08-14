/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/core';
import type { Station } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';
import type { EntityListSlotsType } from '../../core';

export default defineComponent({
    props: defineDomainListProps<Station>(),
    slots: Object as SlotsType<EntityListSlotsType<Station>>,
    emits: defineDomainListEvents<Station>(),
    setup(props, setup) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.STATION}`,
            props,
            setup,
            query: {
                sort: {
                    name: 'ASC',
                },
            },
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Stations',
                icon: 'fa fa-house-medical',
            },

            noMore: {
                content: 'No more stations available...',
            },
        });

        return () => render();
    },
});
