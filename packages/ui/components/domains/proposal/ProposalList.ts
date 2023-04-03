/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    Proposal,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import {
    ProposalSocketClientToServerEventName,
    ProposalSocketServerToClientEventName, buildSocketProposalRoomName, mergeDeep,
} from '@personalhealthtrain/central-common';
import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import type {
    ComponentListData, ComponentListHandlerMethodOptions, ComponentListMethods, ComponentListProperties,
    PaginationMeta,
} from '@vue-layout/utils';
import {
    buildListHeader,
    buildListItems,
    buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import type { BuildInput } from 'rapiq';
import type { Socket } from 'socket.io-client';
import { REALM_MASTER_NAME } from '@authup/core';

export const ProposalList = Vue.extend<
ComponentListData<Proposal>,
ComponentListMethods<Proposal>,
any,
ComponentListProperties<BuildInput<Proposal>> & {
    realmId?: string
}
>({
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<Proposal>>,
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
            items: [],
            q: '',
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
            itemBusy: false,
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

            return this.$store.getters['auth/realmId'];
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
        if (this.loadOnInit) {
            this.load();
        }
    },

    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(ProposalSocketClientToServerEventName.SUBSCRIBE);
        socket.on(ProposalSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(ProposalSocketClientToServerEventName.UNSUBSCRIBE);
        socket.off(ProposalSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    methods: {
        handleSocketCreated(context: SocketServerToClientEventContext<Proposal>) {
            if (context.meta.roomName !== buildSocketProposalRoomName()) return;

            // todo: append item at beginning as well end of list... ^^
            if (
                (this.query.sort.created_at === 'DESC' || this.query.sort.updated_at === 'DESC') &&
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
                const response = await this.$api.proposal.getMany(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        title: this.q.length > 0 ? `~${this.q}` : this.q,
                    },
                }, this.query));

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                // ...
            }

            this.busy = false;
        },

        handleCreated(
            item: Proposal,
            options?: ComponentListHandlerMethodOptions<Proposal>,
        ) {
            options = options || {};

            const index = this.items.findIndex((el: Proposal) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.unshift(item);
                } else {
                    this.items.push(item);
                }
            }
        },
        handleUpdated(item: Proposal) {
            const index = this.items.findIndex((el: Proposal) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof Proposal)[] = Object.keys(item) as (keyof Proposal)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }
        },
        handleDeleted(item: Proposal) {
            const index = this.items.findIndex((el: Proposal) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const header = buildListHeader(this, createElement, { titleText: 'Proposals', iconClass: 'fa-solid fa-scroll' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems(this, createElement, {
            itemIconClass: 'fa-solid fa-scroll',
            itemSlots: {
                handleUpdated: vm.handleUpdated,
                handleDeleted: vm.handleDeleted,
            },
        });
        const noMore = buildListNoMore(this, createElement, {
            text: 'There are no more proposals available...',
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

export default ProposalList;
