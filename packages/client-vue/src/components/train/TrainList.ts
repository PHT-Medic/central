/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DomainType } from '@personalhealthtrain/core';
import type {
    Train,
} from '@personalhealthtrain/core';
import type { SetupContext, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import type { ListEventsType, ListSlotsType } from '../../core';
import { createList, defineListEvents, defineListProps } from '../../core';
import TrainItem from './TrainItem';

export default defineComponent({
    props: defineListProps<Train>(),
    slots: Object as SlotsType<ListSlotsType<Train>>,
    emits: {
        ...defineListEvents<Train>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        executed: (_component: string, _command :string) => true,
    },
    setup(props, setup) {
        const {
            render,
            setDefaults,
            handleUpdated,
            handleDeleted,
        } = createList({
            type: `${DomainType.TRAIN}`,
            props,
            setup: setup as unknown as SetupContext<ListEventsType<Train>>,
        });

        setDefaults({
            item: {
                content(item) {
                    return h(TrainItem, {
                        entity: item,
                        onDeleted: handleDeleted,
                        onUpdated: handleUpdated,
                        onExecuted(component: string, command: string) {
                            setup.emit('executed', component, command);
                        },
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
