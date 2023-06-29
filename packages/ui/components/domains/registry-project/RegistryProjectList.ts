/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { RegistryProject } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type {
    DomainListSlotsType,
} from '../../../core';
import {
    createDomainListBuilder, defineDomainListEvents, defineDomainListProps,
} from '../../../core';

export default defineComponent({
    name: 'RegistryProjectList',
    props: defineDomainListProps<RegistryProject>(),
    slots: Object as SlotsType<DomainListSlotsType<RegistryProject>>,
    emits: defineDomainListEvents<RegistryProject>(),
    setup(props, ctx) {
        const { build } = createDomainListBuilder<RegistryProject>({
            props,
            setup: ctx,
            load: (buildInput) => useAPI().registryProject.getMany(buildInput),
            defaults: {
                footerPagination: true,

                headerSearch: true,
                headerTitle: {
                    content: 'Registry-Projects',
                    icon: 'fa fa-diagram-project',
                },

                noMore: {
                    content: 'No more registry projects available...',
                },
            },
        });

        return () => build();
    },
});
