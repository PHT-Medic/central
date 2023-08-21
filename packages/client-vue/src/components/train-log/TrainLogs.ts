/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    TrainLog,
} from '@personalhealthtrain/core';
import {
    DomainType,
    buildDomainChannelName,
} from '@personalhealthtrain/core';
import type { ListItemSlotProps } from '@vue-layout/list-controls';
import {
    defineComponent, h, ref,
} from 'vue';
import type { ListMeta } from '../../core';
import { createList } from '../../core';
import TrainLogComponent from './TrainLog';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, setup) {
        const rootNode = ref<null | HTMLElement>(null);

        const scrollToLastLine = (meta: ListMeta<TrainLog>) => {
            if (!rootNode.value) {
                return;
            }

            const el = rootNode.value.getElementsByClassName(`line-${meta.total}`)[0];

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const {
            render,
            setDefaults,
        } = createList({
            type: `${DomainType.TRAIN_LOG}`,
            onCreated(_entity, meta) {
                scrollToLastLine(meta);
            },
            socket: {
                processEvent(event) {
                    return event.meta.roomName !== buildDomainChannelName(DomainType.TRAIN_LOG) ||
                        event.data.train_id !== props.entityId;
                },
            },
            props,
            setup,
            loadAll: true,
            query: {
                filters: {
                    train_id: props.entityId,
                },
                sort: {
                    created_at: 'ASC',
                },
            },
            queryFilters: (q) => ({
                title: q.length > 0 ? `~${q}` : q,
            }),
        });

        setDefaults({
            noMore: {
                content: 'No more logs available...',
            },
            item: {
                content(item: TrainLog, slotProps: ListItemSlotProps<TrainLog>) {
                    return h(
                        TrainLogComponent,
                        {
                            entity: item,
                            index: slotProps.index,
                            onDeleted() {
                                if (slotProps && slotProps.deleted) {
                                    slotProps.deleted(item);
                                }
                            },
                            onUpdated(e: TrainLog) {
                                if (slotProps && slotProps.updated) {
                                    slotProps.updated(e);
                                }
                            },
                        },
                    );
                },
            },
        });

        return () => h('div', {
            ref: rootNode,
            class: 'log-container',
        }, [
            h('div', {
                class: 'log-body',
            }, [
                render(),
            ]),
        ]);
    },
});
