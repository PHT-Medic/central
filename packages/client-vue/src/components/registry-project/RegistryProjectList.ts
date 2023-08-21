/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/core';
import type { RegistryProject } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';

export default defineComponent({
    props: defineListProps<RegistryProject>(),
    slots: Object as SlotsType<ListSlotsType<RegistryProject>>,
    emits: defineListEvents<RegistryProject>(),
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.REGISTRY_PROJECT}`,
            props,
            setup,
        });

        setDefaults({
            noMore: {
                content: 'No more registry projects available...',
            },
        });

        return () => render();
    },
});
