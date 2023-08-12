/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/central-common';
import type { Registry } from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { EntityListSlotsType } from '../../core';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';

export default defineComponent({
    props: defineDomainListProps<Registry>(),
    slots: Object as SlotsType<EntityListSlotsType<Registry>>,
    emits: defineDomainListEvents<Registry>(),
    setup(props, setup) {
        const { render, setDefaults } = createEntityList({
            type: `${DomainType.REGISTRY}`,
            props,
            setup,
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Registries',
                icon: 'fa-brands fa-docker',
            },

            noMore: {
                content: 'No more registries available...',
            },
        });

        return () => render();
    },
});
