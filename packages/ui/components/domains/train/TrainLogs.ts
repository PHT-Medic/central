/*
* Copyright (c) 2022.
* Author Peter Placzek (tada5hi)
* For the full copyright and license information,
* view the LICENSE file that was distributed with this source code.
*/
import type {
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    Train,
    TrainLog,
} from '@personalhealthtrain/central-common';
import {
    TrainLogSocketClientToServerEventName,
    TrainLogSocketServerToClientEventName,
    buildSocketTrainLogRoomName,
} from '@personalhealthtrain/central-common';
import type { ComponentListHandlerMethodOptions, PaginationMeta } from '@vue-layout/utils';
import type { Socket } from 'socket.io-client';
import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import TrainLogComponent from './TrainLog.vue';

export default Vue.extend({
    props: {
        entity: Object as PropType<Train>,
    },
    data() {
        return {
            busy: false,

            items: [],

            q: '',

            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
        };
    },
    computed: {
        query() {
            return {
                filter: {
                    train_id: this.entity.id,
                },
                page: {
                    limit: this.meta.limit,
                    offset: this.meta.offset,
                },
                sort: {
                    created_at: 'ASC',
                },
            };
        },
    },
    created() {
        this.load();
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(TrainLogSocketClientToServerEventName.SUBSCRIBE);
        socket.on(TrainLogSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(TrainLogSocketClientToServerEventName.UNSUBSCRIBE);
        socket.off(TrainLogSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    methods: {
        shouldSkipEvent(context: SocketServerToClientEventContext<TrainLog>) {
            return context.meta.roomName !== buildSocketTrainLogRoomName() ||
                context.data.train_id !== this.entity.id;
        },
        handleSocketCreated(context: SocketServerToClientEventContext<TrainLog>) {
            if (this.shouldSkipEvent(context)) return;

            this.handleCreated(context.data);
        },
        async load(options?: PaginationMeta) {
            if (this.busy) return;

            if (options) {
                this.meta.offset = options.offset;
            }

            this.busy = true;

            try {
                const response = await this.$api.trainLog.getMany(this.query);

                this.items = [
                    ...this.items,
                    ...response.data,
                ];

                this.meta.offset = response.meta.offset;
                this.meta.total = response.meta.total;

                if (this.meta.total > this.items.length) {
                    this.busy = false;
                    await this.load({ offset: this.meta.offset + this.meta.limit });

                    return;
                }
            } catch (e) {
                // ...
            }

            this.$nextTick(() => {
                this.scrollToLastLine();
            });

            this.busy = false;
        },
        handleCreated(item: TrainLog, options?: ComponentListHandlerMethodOptions<TrainLog>) {
            options = options || {};

            const index = this.items.findIndex((el) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.splice(0, 0, item);
                } else {
                    this.items.push(item);
                }

                this.$emit('created', item);

                this.$nextTick(() => {
                    this.scrollToLastLine();
                });
            }
        },
        handleUpdated(item: TrainLog) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                const keys = Object.keys(item);
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }

            this.$emit('updated', item);
        },
        handleDeleted(item: TrainLog) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;

                this.$emit('deleted', item);
            }
        },

        scrollToLastLine() {
            if (!this.$el) {
                return;
            }

            const len = this.items.length;
            const el = this.$el.getElementsByClassName(`line-${len}`)[0];

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h('div', {
            staticClass: 'log-container',
        }, [
            h('div', {
                staticClass: 'log-body',
            }, vm.items.map((item, index) => h(
                TrainLogComponent,
                {
                    props: {
                        entity: item,
                        index,
                    },
                    on: {
                        deleted(e) {
                            vm.handleDeleted.call(null, e);
                        },
                        updated(e) {
                            vm.handleUpdated.call(null, e);
                        },
                        created(e) {
                            vm.handleCreated.call(null, e);
                        },
                    },
                },
            ))),
        ]);
    },

});
