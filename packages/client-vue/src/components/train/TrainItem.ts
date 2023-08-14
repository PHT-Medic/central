/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Timeago } from '@vue-layout/timeago';
import type { PropType, VNodeArrayChildren } from 'vue';
import {
    defineComponent, h, ref,
} from 'vue';
import type {
    Train,
} from '@personalhealthtrain/core';
import {
    PermissionID,
} from '@personalhealthtrain/core';
import Link from '../MyLink';
import TrainEntity from './TrainEntity';
import TrainPipeline from './TrainPipeline.vue';
import TrainStationsProgress from '../train-station/TrainStationsProgress.vue';
import TrainName from './TrainName';
import EntityDelete from '../EntityDelete';
import type { EntityManagerSlotProps } from '../../core';
import { injectAuthupStore } from '../../core';

export default defineComponent({
    components: {
        TrainName,
        TrainStationsProgress,
        TrainPipeline,
    },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['updated', 'deleted', 'failed', 'executed'],
    setup(props, { emit }) {
        const store = injectAuthupStore();
        const extendedView = ref(false);
        const toggleView = () => {
            extendedView.value = !extendedView.value;
        };

        const handleExecuted = (component: string, command: string) => {
            emit('executed', component, command);
        };

        return () => h(TrainEntity, {
            entity: props.entity,
            onDeleted(entity) {
                emit('deleted', entity);
            },
            onUpdated(entity) {
                emit('updated', entity);
            },
            onFailed(e) {
                emit('failed', e);
            },
        }, {
            default: (slotProps: EntityManagerSlotProps<Train>) => {
                if (!slotProps.data) {
                    return [];
                }

                let deleteButton : VNodeArrayChildren = [];

                if (store.has(PermissionID.TRAIN_DROP)) {
                    deleteButton = [
                        h(EntityDelete, {
                            withText: false,
                            entityId: slotProps.data.id,
                            entityType: 'train',
                            class: 'btn btn-danger btn-xs ms-1',
                            onDeleted(data: any) {
                                slotProps.deleted(data);
                            },
                        }),
                    ];
                }

                return h(
                    'div',
                    {
                        class: 'train-card',
                    },
                    [
                        h(
                            'div',
                            {
                                class: 'train-card-content align-items-center',
                            },
                            [
                                h('div', [
                                    h(
                                        TrainName,
                                        {
                                            entityId: slotProps.data.id,
                                            entityName: slotProps.data.name,
                                            editable: true,
                                            onUpdated(item: Train) {
                                                slotProps.updated(item);
                                            },
                                        },
                                        {
                                            default: (nameProps: any) => {
                                                let trainName : VNodeArrayChildren = [];

                                                if (nameProps.entityName) {
                                                    trainName = [
                                                        h(
                                                            'span',
                                                            {
                                                                class: 'text-muted ms-1',
                                                            },
                                                            nameProps.entityId,
                                                        ),
                                                    ];
                                                }

                                                return [
                                                    h('i', { class: 'fa-solid fa-train-tram me-1' }),
                                                    h(Link, {
                                                        to: `/trains/${nameProps.entityId}`,
                                                    }, [
                                                        nameProps.nameDisplay,
                                                    ]),
                                                    trainName,
                                                ];
                                            },
                                        },
                                    ),
                                ]),
                                h('div', { class: 'ms-auto' }, [
                                    h('button', {
                                        class: 'btn btn-dark btn-xs',
                                        onClick(event: any) {
                                            event.preventDefault();

                                            toggleView();
                                        },
                                    }, [
                                        h('i', {
                                            class: ['fa', {
                                                'fa-chevron-down': !extendedView.value,
                                                'fa-chevron-up': extendedView.value,
                                            }],
                                        }),
                                    ]),
                                    h(Link, {
                                        class: 'btn btn-dark btn-xs ms-1',
                                        type: 'button',
                                        to: `/trains/${slotProps.data.id}`,
                                    }, [
                                        h('i', { class: 'fa fa-bars' }),
                                    ]),
                                    deleteButton,
                                ]),
                            ],
                        ),
                        h('hr', {
                            class: 'mt-1 mb-1',
                        }),
                        h(TrainPipeline, {
                            entity: slotProps.data,
                            withCommand: extendedView.value,
                            listDirection: extendedView.value ? 'column' : 'row',
                            onUpdated(item: Train) {
                                slotProps.updated(item);
                            },
                            onFailed(error: Error) {
                                slotProps.failed(error);
                            },
                            onDeleted() {
                                slotProps.deleted();
                            },
                            onExecuted(component: string, command: string) {
                                handleExecuted(component, command);
                            },
                        }),
                        h(TrainStationsProgress, {
                            class: 'mt-1 mb-1',
                            entity: slotProps.data,
                            elementType: 'progress-bar',
                        }),
                        h('div', {
                            class: 'train-card-footer',
                        }, [
                            h('div', [
                                h('small', [
                                    h('span', { class: 'text-muted' }, 'updated'),
                                    ' ',
                                    h(Timeago, { datetime: slotProps.data.updated_at }),
                                ]),
                            ]),
                        ]),
                    ],
                );
            },
        });
    },
});
