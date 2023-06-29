/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { Registry } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type {
    DomainListSlotsType,
} from '../../../core';
import {
    createDomainListBuilder, defineDomainListEvents, defineDomainListProps,
} from '../../../core';

export default defineComponent({
    name: 'RegistryList',
    props: defineDomainListProps<Registry>(),
    slots: Object as SlotsType<DomainListSlotsType<Registry>>,
    emits: defineDomainListEvents<Registry>(),
    setup(props, ctx) {
        const { build } = createDomainListBuilder<Registry>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().registry.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Registries',
                    icon: 'fa-brands fa-docker',
                },

                noMore: {
                    content: 'No more registries available...',
                },
            },
        });

        return () => build();
    },
});
