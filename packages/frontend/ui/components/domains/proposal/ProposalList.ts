/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    Proposal,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    buildSocketProposalRoomName,
    mergeDeep,
} from '@personalhealthtrain/central-common';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import {
    ComponentListData, ComponentListHandlerMethodOptions, ComponentListMethods, ComponentListProperties,
    buildListHeader,
    buildListItems,
    buildListNoMore,
    buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import { BuildInput } from '@trapi/query';
import { Socket } from 'socket.io-client';

export const ProposalList = Vue.extend<
ComponentListData<Proposal>,
ComponentListMethods<Proposal>,
any,
ComponentListProperties<Proposal>
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
        realmId() {
            return this.query?.filter?.realm_id ??
                this.query?.filters?.realm_id ??
                this.$store.getters['auth/userRealmId'];
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
        // todo: maybe allow non realm workspace subscription
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.realmId);

        socket.emit('proposalsSubscribe');
        socket.on('proposalCreated', this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.realmId);

        socket.emit('proposalsUnsubscribe');
        socket.off('proposalCreated', this.handleSocketCreated);
    },
    methods: {
        handleSocketCreated(context: SocketServerToClientEventContext<Proposal>) {
            if (context.meta.roomName !== buildSocketProposalRoomName()) return;

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
        async load() {
            if (this.busy) return;

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
        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
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
        const header = buildListHeader(this, createElement, { title: 'Proposals', iconClass: 'fa-solid fa-scroll' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems(this, createElement, {
            itemIconClass: 'fa-solid fa-scroll',
            itemSlots: {
                handleUpdated: vm.handleUpdated,
                handleDeleted: vm.handleDeleted,
            },
        });
        const noMore = buildListNoMore(this, createElement, {
            hint: createElement('div', { staticClass: 'alert alert-sm alert-info' }, [
                'There are no more proposals available...',
            ]),
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
