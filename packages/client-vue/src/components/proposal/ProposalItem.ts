/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { VCTimeago } from '@vuecs/timeago';
import type {
    PropType, VNode,
} from 'vue';
import {
    computed, defineComponent, h,
} from 'vue';
import type {
    Proposal,
} from '@personalhealthtrain/core';
import {
    DomainType,
    PermissionID,
} from '@personalhealthtrain/core';
import { VCLink } from '@vuecs/link';
import {
    EntityListSlotName, hasNormalizedSlot, injectAuthupStore, normalizeSlot,
} from '../../core';
import EntityDelete from '../EntityDelete';
import ProposalEntity from './ProposalEntity';
import type { EntityManagerSlotProps } from '../../core';

export default defineComponent({
    props: {
        entity: {
            type: Object as PropType<Proposal>,
            required: true,
        },
    },
    emits: ['updated', 'failed', 'deleted'],
    setup(props, { slots, emit }) {
        const store = injectAuthupStore();
        const canDrop = computed(() => store.has(PermissionID.PROPOSAL_DROP));

        return () => h(ProposalEntity, {
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
            default: (props: EntityManagerSlotProps<Proposal>) => {
                if (!props.data) {
                    return [];
                }

                let deleteAction : VNode | undefined;

                let itemActions : VNode | VNode[] | undefined;

                if (canDrop.value) {
                    deleteAction = h(
                        EntityDelete,
                        {
                            withText: false,
                            entityId: props.data.id,
                            entityType: DomainType.PROPOSAL,
                            disabled: props.busy || props.data.trains > 0,
                            class: 'btn btn-xs btn-danger ms-1',
                            onDeleted(data: any) {
                                props.deleted(data);
                            },
                        },
                    );
                }

                if (hasNormalizedSlot(EntityListSlotName.ITEM_ACTIONS, slots)) {
                    itemActions = normalizeSlot(EntityListSlotName.ITEM_ACTIONS, props, slots);
                } else {
                    itemActions = [
                        h(
                            VCLink,
                            {
                                to: `/proposals/${props.data.id}`,
                                disabled: props.busy,
                                class: 'btn btn-xs btn-dark',
                            },
                            [
                                h('i', { class: 'fa fa-bars' }),
                            ],
                        ),
                    ];

                    if (deleteAction) {
                        itemActions.push(deleteAction);
                    }
                }

                return h(
                    'div',
                    { class: 'p-1 w-100' },
                    [
                        h(
                            'div',
                            { class: 'd-flex flex-row algin-items-center' },
                            [
                                h('div', [
                                    h('i', {
                                        class: 'fa-solid fa-scroll pe-1',
                                    }),
                                ]),
                                h(
                                    'div',
                                    [
                                        h(
                                            VCLink,
                                            {
                                                to: `/proposals/${props.data.id}`,
                                                class: 'mb-0',
                                            },
                                            [
                                                props.data.title,
                                            ],
                                        ),
                                    ],
                                ),
                                h(
                                    'div',
                                    {
                                        class: 'ms-auto',
                                    },
                                    itemActions,
                                ),
                            ],
                        ),
                        h(
                            'div',
                            {
                                class: 'd-flex flex-row',
                            },
                            [
                                h('div', [
                                    h(
                                        'small',
                                        [
                                            h('span', { class: 'text-primary' }, [props.data.trains]),
                                            ' ',
                                            'Train(s)',
                                        ],
                                    ),
                                    h('span', { class: 'me-1' }, [',']),
                                    h('small', [
                                        h('span', { class: 'text-muted' }, [
                                            'updated',
                                        ]),
                                        ' ',
                                        h(VCTimeago, {
                                            datetime: props.data.updated_at,
                                        }),
                                    ]),
                                ]),
                                h('div', { class: 'ms-auto' }, [
                                    h('small', [
                                        h('span', { class: 'text-muted' }, [
                                            'created by',
                                        ]),
                                        ' ',
                                        h('span', [
                                            props.data.user_id,
                                        ]),
                                    ]),
                                ]),
                            ],
                        ),
                    ],
                );
            },
        });
    },
});
