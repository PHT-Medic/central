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
} from '@personalhealthtrain/central-common';
import {
    TrainSocketClientToServerEventName,
    TrainSocketServerToClientEventName, buildSocketTrainRoomName, mergeDeep,
} from '@personalhealthtrain/central-common';
import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import type {
    ComponentListData,
    ComponentListHandlerMethodOptions,
    ComponentListMethods,
    ComponentListProperties,
    PaginationMeta,
} from '@vue-layout/utils';
import {
    buildListHeader,
    buildListItems,
    buildListNoMore,
    buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import type { BuildInput } from 'rapiq';
import type { Socket } from 'socket.io-client';
import { REALM_MASTER_NAME } from '@authup/common';
import { TrainListItem } from './TrainListItem';

export const TrainList = Vue.extend<
ComponentListData<Train>,
ComponentListMethods<Train>,
any,
ComponentListProperties<BuildInput<Train>>
>({
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<Train>>,
            default() {
                return {};
            },
        },
        withHeader: {
            type: Boolean,
            default: true,
        },
        withNoMore: {
            type: Boolean,
            default: true,
        },
        withPagination: {
            type: Boolean,
            default: true,
        },
        withSearch: {
            type: Boolean,
            default: true,
        },
        realmId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,

            message: null,
            items: [],

            q: '',

            itemBusy: false,

            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
        };
    },
    computed: {
        socketRealmId() {
            if (this.realmId) {
                return this.realmId;
            }

            if (this.$store.getters['auth/realmName'] === REALM_MASTER_NAME) {
                return undefined;
            }

            if (this.query.filter.realm_id) {
                return this.query.filter.realm_id;
            }

            return this.$store.getters['auth/realmId'];
        },
        queryFinal() {
            return mergeDeep({
                filter: {
                    name: this.q.length > 0 ? `~${this.q}` : this.q,
                },
                page: {
                    limit: this.meta.limit,
                    offset: this.meta.offset,
                },
                sort: {
                    created_at: 'DESC',
                },
                include: {
                    result: true,
                },
            }, this.query);
        },
    },
    watch: {
        q(val, oldVal) {
            if (val === oldVal) return;

            if (val.length === 1 && val.length > oldVal.length) {
                return;
            }

            this.meta.offset = 0;

            this.load();
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

        socket.emit(TrainSocketClientToServerEventName.SUBSCRIBE);
        socket.on(TrainSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(TrainSocketClientToServerEventName.UNSUBSCRIBE);
        socket.off(TrainSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    methods: {
        handleSocketCreated(context: SocketServerToClientEventContext<Train>) {
            if (context.meta.roomName !== buildSocketTrainRoomName()) return;

            if (
                (this.queryFinal.sort.created_at === 'DESC' || this.queryFinal.sort.updated_at === 'DESC') &&
                this.meta.offset === 0
            ) {
                this.handleCreated(context.data, { unshift: true });
                return;
            }

            if (
                this.meta.total < this.meta.limit
            ) {
                this.handleCreated(context.data);
            }
        },
        async load(options?: PaginationMeta) {
            if (this.busy) return;

            if (options) {
                this.meta.offset = options.offset;
            }

            this.busy = true;

            try {
                const response = await this.$api.train.getMany(this.queryFinal);

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        handleCreated(item: Train, options?: ComponentListHandlerMethodOptions<Train>) {
            options = options || {};

            const index = this.items.findIndex((el) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.splice(0, 0, item);
                } else {
                    this.items.push(item);
                }

                this.$emit('created', item);
            }
        },
        handleUpdated(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                const keys = Object.keys(item);
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }

            this.$emit('updated', item);
        },
        handleDeleted(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;

                this.$emit('deleted', item);
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        const header = buildListHeader(this, createElement, { titleText: 'Trains', iconClass: 'fa-solid fa-train-tram' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems<Train>(this, createElement, {
            itemIconClass: 'fa-solid fa-train-tram',
            itemSlots: {
                handleUpdated: vm.handleUpdated,
                handleDeleted: vm.handleDeleted,
            },
            itemFn(item) {
                return h(TrainListItem, {
                    props: {
                        entity: item,
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
                });
            },
        });
        const noMore = buildListNoMore(this, createElement, {
            text: 'There are no more trains available...',
        });
        const pagination = buildListPagination(this, createElement);

        return createElement(
            'div',
            { staticClass: 'list' },
            [
                header,
                search,
                items,
                noMore,
                pagination,
            ],
        );
    },
});

export default TrainList;
