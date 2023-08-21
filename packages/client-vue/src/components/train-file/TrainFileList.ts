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
import type { ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';

export default defineComponent({
    props: {
        ...defineListProps<TrainFile>(),
        realmId: {
            type: String,
            default: undefined,
        },
    },
    slots: Object as SlotsType<ListSlotsType<TrainFile>>,
    emits: defineListEvents<TrainFile>(),
    setup(props, setup) {
        // todo: include sort

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.TRAIN_FILE}`,
            props,
            setup,
        });

        setDefaults({
            noMore: {
                content: 'No more train files available...',
            },
        });

        return () => render();
    },
});
