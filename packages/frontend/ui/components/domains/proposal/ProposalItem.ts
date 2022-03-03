/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import Vue, { CreateElement, PropType, VNode } from 'vue';
import {
    PermissionID,
    Proposal,
    SocketClientToServerEvents,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import { SlotName, hasNormalizedSlot, normalizeSlot } from '@vue-layout/utils';
import { Socket } from 'socket.io-client';
import EntityDelete from '../EntityDelete';

export const ProposalItem = Vue.extend({
    name: 'ProposalItem',
    props: {
        entity: Object as PropType<Proposal>,
    },
    data() {
        return {
            busy: false,

            extendView: false,

            socketLockId: null,
        };
    },
    computed: {
        canDrop() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_DROP);
        },
        userName() {
            return this.entity.user ?
                this.entity.user.display_name :
                this.entity.user_id;
        },
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);
        socket.emit('proposalsSubscribe', { data: { id: this.entity.id } });

        socket.on('proposalUpdated', this.handleSocketUpdated);
        socket.on('proposalDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);

        socket.emit('proposalsUnsubscribe', { data: { id: this.entity.id } });
        socket.off('proposalUpdated', this.handleSocketUpdated);
        socket.off('proposalDeleted', this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context) {
            if (
                this.entity.id !== context.data.id ||
                this.socketLockId === context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleUpdated(context.data);
        },
        handleSocketDeleted(context) {
            if (
                this.entity.id !== context.data.id ||
                this.socketLockId === context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleDeleted({ ...context.data });
        },
        handleUpdated(entity) {
            this.$emit('updated', entity);
        },
        handleDeleted(entity) {
            this.$emit('deleted', entity);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },

        async edit(item) {
            if (this.busy) return;

            this.busy = true;

            try {
                this.socketLockId = this.entity.id;
                const response = await this.$api.proposal.update(this.entity.id, item);
                this.socketLockId = null;

                this.handleUpdated(response);
            } catch (e) {
                this.handleFailed(e);
            }

            this.busy = false;
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        let deleteAction = h();

        let itemActions = [];

        if (vm.canDrop) {
            deleteAction = h(
                EntityDelete,
                {
                    props: {
                        withText: false,
                        entityId: vm.entity.id,
                        entityType: 'proposal',
                    },
                    attrs: {
                        disabled: vm.busy || vm.entity.trains > 0,
                    },
                    domProps: {
                        disabled: vm.busy || vm.entity.trains > 0,
                    },
                    staticClass: 'btn btn-xs btn-danger ml-1',
                    on: {
                        deleted(data) {
                            vm.handleDeleted.call(vm, data);
                        },
                    },
                },
            );
        }

        if (hasNormalizedSlot(SlotName.ITEM_ACTIONS, vm.$scopedSlots, vm.$slots)) {
            itemActions = normalizeSlot(SlotName.ITEM_ACTIONS, { item: vm.entity, busy: vm.busy }, vm.$scopedSlots, vm.$slots);
        } else {
            itemActions = [
                h(
                    'nuxt-link',
                    {
                        props: {
                            to: `/proposals/${vm.entity.id}`,
                        },
                        attrs: {
                            disabled: vm.busy,
                        },
                        domProps: {
                            disabled: vm.busy,
                        },
                        staticClass: 'btn btn-xs btn-dark',
                    },
                    [
                        h('i', { staticClass: 'fa fa-bars' }),
                    ],
                ),
                deleteAction,
            ];
        }

        return h(
            'div',
            { staticClass: 'p-1' },
            [
                h(
                    'div',
                    { staticClass: 'd-flex flex-row algin-items-center' },
                    [
                        h('div', [
                            h('i', {
                                staticClass: 'fa-solid fa-scroll pr-1',
                            }),
                        ]),
                        h(
                            'div',
                            [
                                h(
                                    'nuxt-link',
                                    {
                                        props: {
                                            to: `/proposals/${vm.entity.id}`,
                                        },
                                        staticClass: 'mb-0',
                                    },
                                    [
                                        vm.entity.title,
                                    ],
                                ),
                            ],
                        ),
                        h(
                            'div',
                            {
                                staticClass: 'ml-auto',
                            },
                            itemActions,
                        ),
                    ],
                ),
                h(
                    'div',
                    {
                        staticClass: 'd-flex flex-row',
                    },
                    [
                        h('div', [
                            h(
                                'small',
                                [
                                    h('span', { staticClass: 'text-primary' }, [vm.entity.trains]),
                                    ' ',
                                    'Train(s)',
                                ],
                            ),
                            h('span', { staticClass: 'mr-1' }, [',']),
                            h('small', [
                                h('span', { staticClass: 'text-muted' }, [
                                    'updated',
                                ]),
                                ' ',
                                h('timeago', {
                                    props: {
                                        datetime: vm.entity.updated_at,
                                    },
                                }),
                            ]),
                        ]),
                        h('div', { staticClass: 'ml-auto' }, [
                            h('small', [
                                h('span', { staticClass: 'text-muted' }, [
                                    'created by',
                                ]),
                                ' ',
                                h('span', [
                                    vm.userName,
                                ]),
                            ]),
                        ]),
                    ],
                ),
            ],
        );
    },
});

export default ProposalItem;
