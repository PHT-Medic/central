/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/central-common';
import type {
    Train,
} from '@personalhealthtrain/central-common';
import type { SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import type { EntityListSlotsType } from '../../core';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';
import TrainItem from './TrainItem';

export default defineComponent({
    props: defineDomainListProps<Train>(),
    slots: Object as SlotsType<EntityListSlotsType<Train>>,
    emits: defineDomainListEvents<Train>(),
    setup(props, setup) {
        const {
            render,
            setDefaults,
            handleUpdated,
            handleDeleted,
        } = createEntityList({
            type: `${DomainType.TRAIN}`,
            props,
            setup,
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Trains',
                icon: 'fa fa-train-tram',
            },

            item: {
                content(item) {
                    return h(TrainItem, {
                        entity: item,
                        onDeleted: handleDeleted,
                        onUpdated: handleUpdated,
                    });
                },
            },

            noMore: {
                content: 'No more trains available...',
            },
        });

        return () => render();
    },
});
