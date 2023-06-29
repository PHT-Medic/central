/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { Station } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { DomainListSlotsType } from '../../../core';
import {
    createDomainListBuilder, defineDomainListEvents, defineDomainListProps,
} from '../../../core';

export default defineComponent({
    name: 'StationList',
    props: defineDomainListProps<Station>(),
    slots: Object as SlotsType<DomainListSlotsType<Station>>,
    emits: defineDomainListEvents<Station>(),
    setup(props, ctx) {
        const { build } = createDomainListBuilder<Station>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().station.getMany(buildInput),
            query: {
                sort: {
                    name: 'ASC',
                },
            },
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Stations',
                    icon: 'fa fa-house-medical',
                },

                noMore: {
                    content: 'No more stations available...',
                },
            },
        });

        return () => build();
    },
});
