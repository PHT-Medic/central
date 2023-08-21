/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/core';
import type { Registry } from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';

export default defineComponent({
    props: defineListProps<Registry>(),
    slots: Object as SlotsType<ListSlotsType<Registry>>,
    emits: defineListEvents<Registry>(),
    setup(props, setup) {
        const { render, setDefaults } = createList({
            type: `${DomainType.REGISTRY}`,
            props,
            setup,
        });

        setDefaults({
            noMore: {
                content: 'No more registries available...',
            },
        });

        return () => render();
    },
});
