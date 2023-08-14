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
import type { SetupContext, SlotsType } from 'vue';
import { defineComponent, h } from 'vue';
import type { EntityListEventsType, EntityListSlotsType } from '../../core';
import { createEntityList, defineDomainListEvents, defineDomainListProps } from '../../core';
import TrainItem from './TrainItem';

export default defineComponent({
    props: defineDomainListProps<Train>(),
    slots: Object as SlotsType<EntityListSlotsType<Train>>,
    emits: {
        ...defineDomainListEvents<Train>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        executed: (_component: string, _command :string) => true,
    },
    setup(props, setup) {
        const {
            render,
            setDefaults,
            handleUpdated,
            handleDeleted,
        } = createEntityList({
            type: `${DomainType.TRAIN}`,
            props,
            setup: setup as unknown as SetupContext<EntityListEventsType<Train>>,
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
