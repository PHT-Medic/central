/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import Vue, { CreateElement, PropType, VNode } from 'vue';
import { Socket } from 'socket.io-client';
import {
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    Train, TrainSocketClientToServerEventName, TrainSocketServerToClientEventName,
} from '@personalhealthtrain/central-common';
import TrainPipeline from './TrainPipeline.vue';
import TrainStationsProgress from '../train-station/TrainStationsProgress.vue';
import TrainName from './TrainName.vue';
import EntityDelete from '../EntityDelete';

export const TrainListItem = Vue.extend({
    components: {
        TrainName,
        TrainStationsProgress,
        TrainPipeline,
    },
    props: {
        entity: Object as PropType<Train>,
    },
    data() {
        return {
            item: null,

            busy: false,

            extendView: false,

            socketLockId: null,
        };
    },
    computed: {
        canDrop() {
            return this.$auth.can('drop', 'train');
        },
        userName() {
            return this.entity.user ?
                this.entity.user.name :
                this.entity.user_id;
        },
    },
    created() {
        this.item = this.entity;
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);

        socket.emit(TrainSocketClientToServerEventName.SUBSCRIBE, { data: { id: this.entity.id } });
        socket.on(TrainSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        socket.on(TrainSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.entity.realm_id);

        socket.emit(TrainSocketClientToServerEventName.UNSUBSCRIBE, { data: { id: this.item.id } });
        socket.off(TrainSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
        socket.off(TrainSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    methods: {
        handleSocketUpdated(context: SocketServerToClientEventContext<Train>) {
            if (
                this.entity.id !== context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleUpdated(context.data);
        },
        handleSocketDeleted(context: SocketServerToClientEventContext<Train>) {
            if (
                this.entity.id !== context.data.id ||
                this.socketLockId === context.data.id ||
                context.meta.roomId !== this.entity.id
            ) return;

            this.handleDeleted(context.data);
        },
        handleUpdated(item: Train) {
            // eslint-disable-next-line no-restricted-syntax
            for (const key in item) {
                Vue.set(this.item, key, item[key]);
            }

            this.$emit('updated', item);
        },
        handleDeleted(item: Train) {
            this.$emit('deleted', item);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },

        // ---------------------------------------------------------

        toggleExtendView() {
            this.extendView = !this.extendView;
        },

        // ---------------------------------------------------------

        async drop() {
            if (this.busy) return;

            this.busy = true;

            try {
                this.socketLockId = this.item.id;
                await this.$api.train.delete(this.item.id);
                this.socketLockId = null;

                this.$emit('deleted', this.item);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.busy = false;
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        let deleteButton = h();

        if (vm.canDrop) {
            deleteButton = h(EntityDelete, {
                props: {
                    withText: false,
                    entityId: vm.entity.id,
                    entityType: 'train',
                },
                staticClass: 'btn btn-danger btn-xs ml-1',
                on: {
                    deleted(entity) {
                        vm.handleDeleted.call(null, entity);
                    },
                },
            });
        }

        return h(
            'div',
            {
                staticClass: 'train-card',
            },
            [
                h(
                    'div',
                    {
                        staticClass: 'train-card-content align-items-center',
                    },
                    [
                        h('div', [
                            h(
                                TrainName,
                                {
                                    props: {
                                        entityId: vm.entity.id,
                                        entityName: vm.entity.name,
                                        withEdit: true,
                                    },
                                    on: {
                                        updated(item) {
                                            vm.handleUpdated.call(vm, item);
                                        },
                                    },
                                    scopedSlots: {
                                        text: (props) => {
                                            let trainName = h();

                                            if (props.entityName) {
                                                trainName = h(
                                                    'span',
                                                    {
                                                        staticClass: 'text-muted ml-1',
                                                    },
                                                    props.entityId,
                                                );
                                            }
                                            return [
                                                h('i', { staticClass: 'fa-solid fa-train-tram mr-1' }),
                                                h('nuxt-link', {
                                                    props: {
                                                        to: `/trains/${props.entityId}`,
                                                    },
                                                }, [
                                                    props.displayText,
                                                ]),
                                                trainName,
                                            ];
                                        },
                                    },
                                },
                            ),
                        ]),
                        h('div', { staticClass: 'ml-auto' }, [
                            h('button', {
                                staticClass: 'btn btn-dark btn-xs',
                                on: {
                                    click(event) {
                                        event.preventDefault();

                                        vm.toggleExtendView.call(null);
                                    },
                                },
                            }, [
                                h('i', {
                                    staticClass: 'fa',
                                    class: {
                                        'fa-chevron-down': !vm.extendView,
                                        'fa-chevron-up': vm.extendView,
                                    },
                                }),
                            ]),
                            h('nuxt-link', {
                                staticClass: 'btn btn-dark btn-xs ml-1',
                                attrs: {
                                    type: 'button',
                                },
                                props: {
                                    to: `/trains/${vm.entity.id}`,
                                },
                            }, [
                                h('i', { staticClass: 'fa fa-bars' }),
                            ]),
                            deleteButton,
                        ]),
                    ],
                ),
                h('hr', {
                    staticClass: 'mt-1 mb-1',
                }),
                h(TrainPipeline, {
                    props: {
                        entity: vm.item,
                        withCommand: vm.extendView,
                        listDirection: vm.extendView ? 'column' : 'row',
                    },
                    on: {
                        updated(item) {
                            vm.handleUpdated.call(null, item);
                        },
                        failed(item) {
                            vm.handleFailed.call(null, item);
                        },
                        deleted(item) {
                            vm.handleDeleted.call(null, item);
                        },
                    },
                }),
                h(TrainStationsProgress, {
                    staticClass: 'mt-1 mb-1',
                    props: {
                        entity: vm.item,
                        elementType: 'progress-bar',
                    },
                }),
                h('div', {
                    staticClass: 'train-card-footer',
                }, [
                    h('div', [
                        h('small', [
                            h('span', { staticClass: 'text-muted' }, 'updated'),
                            ' ',
                            h('timeago', { props: { datetime: vm.item.updated_at } }),
                        ]),
                    ]),
                    h('div', { staticClass: 'ml-auto' }, [
                        h('small', [
                            h('span', { staticClass: 'text-muted' }, 'created by'),
                            ' ',
                            h('span', vm.userName),
                        ]),
                    ]),
                ]),
            ],
        );
    },
});
