/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/central-common';
import type { RegistryProject } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { EntityListSlotsType } from '../../core';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';

export default defineComponent({
    props: defineDomainListProps<RegistryProject>(),
    slots: Object as SlotsType<EntityListSlotsType<RegistryProject>>,
    emits: defineDomainListEvents<RegistryProject>(),
    setup(props, setup) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.REGISTRY_PROJECT}`,
            props,
            setup,
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Registry-Projects',
                icon: 'fa fa-diagram-project',
            },

            noMore: {
                content: 'No more registry projects available...',
            },
        });

        return () => render();
    },
});
