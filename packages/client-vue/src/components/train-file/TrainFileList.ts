/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/core';
import type {
    TrainFile,
} from '@personalhealthtrain/core';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { EntityListSlotsType } from '../../core';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';

export default defineComponent({
    props: {
        ...defineDomainListProps<TrainFile>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<EntityListSlotsType<TrainFile>>,
    emits: defineDomainListEvents<TrainFile>(),
    setup(props, setup) {
        // todo: include sort

        const {
            render,
            setDefaults,
        } = createEntityList({
            type: `${DomainType.TRAIN_FILE}`,
            props,
            setup,
        });

        setDefaults({
            footerPagination: true,

            headerSearch: true,
            headerTitle: {
                content: 'Train Files',
                icon: 'fa-train-tram',
            },

            noMore: {
                content: 'No more train files available...',
            },
        });

        return () => render();
    },
});
