/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ProposalStation,
    ProposalStationSocketClientToServerEventName,
    ProposalStationSocketServerToClientEventName,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    Station,
    Train,
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketProposalStationRoomName, mergeDeep,
} from '@personalhealthtrain/central-common';

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { Socket } from 'socket.io-client';
import {
    ComponentListData,
    ComponentListHandlerMethodOptions,
    ComponentListMethods,
    ComponentListProperties,
    PaginationMeta, buildListHeader, buildListItems, buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import { MASTER_REALM_ID, Realm } from '@authup/common';
import { BuildInput } from 'rapiq';

enum DomainType {
    Proposal = 'proposal',
    Station = 'station',
}

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export const ProposalStationList = Vue.extend<
ComponentListData<ProposalStation>,
ComponentListMethods<ProposalStation>,
any,
ComponentListProperties<ProposalStation> & {
    realmId?: Realm['id'],
    sourceId: Train['id'] | Station['id'],
    target: `${DomainType}`,
    direction: Direction
}
>({
    name: 'ProposalStationList',
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
            default: undefined,
        },
        sourceId: {
            type: String,
        },
        target: {
            type: String as PropType<DomainType>,
            default: DomainType.Station,
        },
        direction: {
            type: String as PropType<Direction>,
            default: Direction.OUT,
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
        userRealmId() {
            return this.$store.getters['auth/userRealmId'];
        },
        socketRealmId() {
            if (this.realmId) {
                return this.realmId;
            }

            if (this.userRealmId === MASTER_REALM_ID) {
                return undefined;
            }

            return this.userRealmId;
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

        if (this.socketRealmId) {
            switch (this.direction) {
                case Direction.IN:
                    socket.emit(ProposalStationSocketClientToServerEventName.IN_SUBSCRIBE);
                    break;
                case Direction.OUT:
                    socket.emit(ProposalStationSocketClientToServerEventName.OUT_SUBSCRIBE);
                    break;
            }
        } else {
            socket.emit(ProposalStationSocketClientToServerEventName.SUBSCRIBE);
        }

        socket.on(ProposalStationSocketServerToClientEventName.CREATED, this.handleSocketCreated);
        socket.on(ProposalStationSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        if (this.socketRealmId) {
            switch (this.direction) {
                case Direction.IN:
                    socket.emit(ProposalStationSocketClientToServerEventName.IN_UNSUBSCRIBE);
                    break;
                case Direction.OUT:
                    socket.emit(ProposalStationSocketClientToServerEventName.OUT_UNSUBSCRIBE);
                    break;
            }
        } else {
            socket.emit(ProposalStationSocketClientToServerEventName.UNSUBSCRIBE);
        }

        socket.off(ProposalStationSocketServerToClientEventName.CREATED, this.handleSocketCreated);
        socket.off(ProposalStationSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    methods: {
        isSameSocketRoom(room) {
            if (this.socketRealmId) {
                switch (this.direction) {
                    case Direction.IN:
                        return room === buildSocketProposalStationInRoomName();
                    case Direction.OUT:
                        return room === buildSocketProposalStationOutRoomName();
                }
            } else {
                return room === buildSocketProposalStationRoomName();
            }

            return false;
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
        async load(options?: PaginationMeta) {
            if (this.busy) return;

            if (options) {
                this.meta.offset = options.offset;
            }

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

            if (this.realmId) {
                if (this.direction === Direction.IN) {
                    query.filter.station_realm_id = this.realmId;
                } else {
                    query.filter.proposal_realm_id = this.realmId;
                }
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
            titleText: vm.target === DomainType.Station ? 'Stations' : 'Proposals',
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
                        item.proposal.title,
                ]);
            },
            itemSlots: {
                handleUpdated: vm.handleUpdated,
                handleDeleted: vm.handleDeleted,
                handleCreated: vm.handleCreated,
            },
        });

        const noMore = buildListNoMore(this, createElement, {
            text: `There are no more ${vm.target}s available...`,
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
