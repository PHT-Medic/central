/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ProposalStation,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    Station,
    Train,
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName, buildSocketProposalStationRoomName, mergeDeep,
} from '@personalhealthtrain/central-common';

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { Socket } from 'socket.io-client';
import {
    ComponentListData,
    ComponentListHandlerMethodOptions,
    ComponentListMethods,
    ComponentListProperties,
    buildListHeader, buildListItems, buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import { Realm, isPermittedForResourceRealm } from '@typescript-auth/domains';
import { BuildInput } from '@trapi/query';
import ProposalStationApprovalStatusText from './ProposalStationApprovalStatusText.vue';

enum DomainType {
    Proposal = 'proposal',
    Station = 'station',
}

export const ProposalStationList = Vue.extend<
ComponentListData<ProposalStation>,
ComponentListMethods<ProposalStation>,
any,
ComponentListProperties<ProposalStation> & {
    realmId: Realm['id'],
    sourceId: Train['id'] | Station['id'],
    target: `${DomainType}`
}
>({
    name: 'ProposalStationList',
    components: {
        ProposalStationApprovalStatusText,
    },
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<ProposalStation>>,
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
        },
        sourceId: {
            type: String,
        },
        target: {
            type: String as PropType<DomainType>,
            default: DomainType.Station,
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

            socketLockedId: null,
            socketLockedStationId: null,
        };
    },
    computed: {
        source() {
            return this.target === DomainType.Station ?
                DomainType.Proposal :
                DomainType.Station;
        },
        direction() {
            if (this.$store.getters['auth/userRealmId'] === this.realmId) {
                return 'out';
            }

            if (isPermittedForResourceRealm(this.$store.getters['auth/userRealmId'], this.realmId)) {
                return null;
            }

            return 'in';
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
        > = this.$socket.useRealmWorkspace(this.realmId);

        switch (this.direction) {
            case 'in':
                socket.emit('proposalStationsInSubscribe');
                break;
            case 'out':
                socket.emit('proposalStationsOutSubscribe');
                break;
            default:
                socket.emit('proposalStationsSubscribe');
        }

        socket.on('proposalStationCreated', this.handleSocketCreated);
        socket.on('proposalStationDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.realmId);

        switch (this.direction) {
            case 'in':
                socket.emit('proposalStationsInUnsubscribe');
                break;
            case 'out':
                socket.emit('proposalStationsOutUnsubscribe');
                break;
            default:
                socket.emit('proposalStationsUnsubscribe');
                break;
        }
        socket.off('proposalStationCreated', this.handleSocketCreated);
        socket.off('proposalStationDeleted', this.handleSocketDeleted);
    },
    methods: {
        isSameSocketRoom(room) {
            switch (this.direction) {
                case 'in':
                    return room === buildSocketProposalStationInRoomName();
                case 'out':
                    return room === buildSocketProposalStationOutRoomName();
                default:
                    return room === buildSocketProposalStationRoomName();
            }
        },
        isSocketEventForSource(item: ProposalStation) {
            switch (this.source) {
                case DomainType.Station:
                    return this.sourceId === item.station_id;
                case DomainType.Proposal:
                    return this.sourceId === item.proposal_id;
            }

            return false;
        },
        async handleSocketCreated(context: SocketServerToClientEventContext<ProposalStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                !this.isSocketEventForSource(context.data)
            ) return;

            this.handleCreated(context.data);
        },
        handleSocketDeleted(context : SocketServerToClientEventContext<ProposalStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.id === this.socketLockedId
            ) return;

            this.handleDeleted(context.data);
        },
        async loadTargetForItem(item: ProposalStation) {
            switch (this.target) {
                case DomainType.Proposal: {
                    if (!item.proposal) {
                        item.proposal = await this.$api.train.getOne(item.proposal_id);
                    }
                    break;
                }
                default: {
                    if (!item.station) {
                        item.station = await this.$api.station.getOne(item.station_id);
                    }
                    break;
                }
            }

            return item;
        },
        async load() {
            if (this.busy) return;

            this.busy = true;

            const { query } = this;

            switch (this.target) {
                case DomainType.Station:
                    query.filter = query.filter || {};
                    query.filter.station = {
                        name: this.q.length > 0 ? `~${this.q}` : this.q,
                    };
                    query.include = query.include || {};
                    query.include.station = true;
                    break;
                case DomainType.Proposal:
                    query.filter = query.filter || {};
                    query.filter.proposal = {
                        name: this.q.length > 0 ? `~${this.q}` : this.q,
                    };
                    query.include = query.include || {};
                    query.include.proposal = true;
                    break;
            }

            try {
                const response = await this.$api.proposalStation.getMany(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                }, query));

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
            data: ProposalStation,
            options?: ComponentListHandlerMethodOptions<ProposalStation>,
        ) {
            options = options || {};

            Promise.resolve()
                .then(() => this.loadTargetForItem(data))
                .then((item) => {
                    const index = this.items.findIndex((el: ProposalStation) => el.id === item.id);
                    if (index === -1) {
                        if (options.unshift) {
                            this.items.unshift(item);
                        } else {
                            this.items.push(item);
                        }

                        this.$emit('created', item);
                    }
                });
        },
        handleUpdated(item: ProposalStation) {
            const index = this.items.findIndex((el: ProposalStation) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof ProposalStation)[] = Object.keys(item) as (keyof ProposalStation)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }

                this.$emit('updated', item);
            }
        },
        handleDeleted(item: ProposalStation) {
            const index = this.items.findIndex((el: ProposalStation) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;

                this.$emit('deleted', {
                    ...this.items[index],
                    ...item,
                });
            }
        },
    },

    render(createElement: CreateElement): VNode {
        const vm = this;

        const header = buildListHeader(this, createElement, {
            title: vm.target === DomainType.Station ? 'Stations' : 'Proposals',
            iconClass: vm.target === DomainType.Station ?
                'fa fa-hospital' :
                'fa fa-file',
        });

        const search = buildListSearch(this, createElement);
        const items = buildListItems<ProposalStation>(this, createElement, {
            itemIconClass: vm.target === DomainType.Station ? 'fa fa-hospital' : 'fa fa-file',
            itemTextFn(item) {
                return createElement('span', [
                    vm.target === DomainType.Station ?
                        item.station.name :
                        vm.proposal.title,
                ]);
            },
            itemSlots: {
                handleDeleted: vm.handleDeleted,
                handleCreated: vm.handleCreated,
            },
        });

        const noMore = buildListNoMore(this, createElement, {
            hint: createElement('div', { staticClass: 'alert alert-sm alert-info' }, [
                `There are no more ${vm.target}s available...`,
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
export default ProposalStationList;
