/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    Station,
    Train,
    TrainStation,
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketProposalStationRoomName,
    buildSocketTrainStationInRoomName,
    buildSocketTrainStationOutRoomName, buildSocketTrainStationRoomName, mergeDeep,
} from '@personalhealthtrain/central-common';

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { Socket } from 'socket.io-client';
import {
    ComponentListData,
    ComponentListHandlerMethodOptions,
    ComponentListMethods,
    ComponentListProperties,
    buildListHeader,
    buildListItems,
    buildListNoMore,
    buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import { MASTER_REALM_ID, Realm, isPermittedForResourceRealm } from '@typescript-auth/domains';
import { BuildInput } from '@trapi/query';

enum DomainType {
    Train = 'train',
    Station = 'station',
}

enum Direction {
    IN = 'in',
    OUT = 'out',
}

export const TrainStationList = Vue.extend<
ComponentListData<TrainStation>,
ComponentListMethods<TrainStation>,
any,
ComponentListProperties<TrainStation> & {
    realmId?: Realm['id'],
    sourceId: Train['id'] | Station['id'],
    target: DomainType,
    direction: Direction
}
>({
    name: 'TrainStationList',
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<TrainStation>>,
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
                DomainType.Train :
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
        if (this.loadOnInit) {
            Promise.resolve()
                .then(this.load);
        }
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        if (this.socketRealmId) {
            switch (this.direction) {
                case Direction.IN:
                    socket.emit('trainStationsInSubscribe');
                    break;
                case Direction.OUT:
                    socket.emit('trainStationsOutSubscribe');
                    break;
            }
        } else {
            socket.emit('trainStationsSubscribe');
        }

        socket.on('trainStationCreated', this.handleSocketCreated);
        socket.on('trainStationDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        if (this.socketRealmId) {
            switch (this.direction) {
                case Direction.IN:
                    socket.emit('trainStationsInUnsubscribe');
                    break;
                case Direction.OUT:
                    socket.emit('trainStationsOutUnsubscribe');
                    break;
            }
        } else {
            socket.emit('trainStationsUnsubscribe');
        }

        socket.off('trainStationCreated', this.handleSocketCreated);
        socket.off('trainStationDeleted', this.handleSocketDeleted);
    },
    methods: {
        isSameSocketRoom(room) {
            if (this.socketRealmId) {
                switch (this.direction) {
                    case Direction.IN:
                        return room === buildSocketTrainStationInRoomName();
                    case Direction.OUT:
                        return room === buildSocketTrainStationOutRoomName();
                }
            } else {
                return room === buildSocketTrainStationRoomName();
            }

            return false;
        },
        isSocketEventForSource(item: TrainStation) {
            switch (this.source) {
                case DomainType.Station:
                    return this.sourceId === item.station_id;
                case DomainType.Train:
                    return this.sourceId === item.train_id;
            }

            return false;
        },
        async handleSocketCreated(context: SocketServerToClientEventContext<TrainStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                !this.isSocketEventForSource(context.data)
            ) return;

            this.handleCreated(context.data);
        },
        handleSocketDeleted(context: SocketServerToClientEventContext<TrainStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                !this.isSocketEventForSource(context.data)
            ) return;

            this.handleDeleted(context.data);
        },
        async loadTargetForItem(item: TrainStation) {
            switch (this.target) {
                case DomainType.Train: {
                    if (!item.train) {
                        item.train = await this.$api.train.getOne(item.train_id);
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
                case DomainType.Train:
                    query.filter = query.filter || {};
                    query.filter.train = {
                        name: this.q.length > 0 ? `~${this.q}` : this.q,
                    };
                    query.include = query.include || {};
                    query.include.train = true;
                    break;
            }

            if (this.realmId) {
                if (this.direction === Direction.IN) {
                    query.filter.station_realm_id = this.realmId;
                } else {
                    query.filter.train_realm_id = this.realmId;
                }
            }

            try {
                const response = await this.$api.trainStation.getMany(mergeDeep({
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
            data: TrainStation,
            options?: ComponentListHandlerMethodOptions<TrainStation>,
        ) {
            options = options || {};

            Promise.resolve()
                .then(() => this.loadTargetForItem(data))
                .then((item) => {
                    const index = this.items.findIndex((el: TrainStation) => el.id === item.id);
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
        handleUpdated(item: TrainStation) {
            const index = this.items.findIndex((el: TrainStation) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof TrainStation)[] = Object.keys(item) as (keyof TrainStation)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }

                this.$emit('updated', item);
            }
        },
        handleDeleted(item: TrainStation) {
            const index = this.items.findIndex((el: TrainStation) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;

                this.$emit('deleted', item);
            }
        },
    },

    render(createElement: CreateElement): VNode {
        const vm = this;

        const header = buildListHeader(this, createElement, {
            title: vm.target === DomainType.Station ?
                'Stations' :
                'Trains',
            iconClass: vm.target === DomainType.Station ?
                'fa fa-hospital' :
                'fa-solid fa-train-tram',
        });

        const search = buildListSearch(this, createElement);
        const items = buildListItems<TrainStation>(this, createElement, {
            itemIconClass: vm.target === DomainType.Station ?
                'fa fa-hospital' :
                'fa-solid fa-train-tram',
            itemTextFn(item) {
                return createElement('span', [
                    vm.target === DomainType.Station ?
                        item.station.name :
                        item.train.name,
                ]);
            },
            itemSlots: {
                handleUpdated: vm.handleUpdated,
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
export default TrainStationList;
