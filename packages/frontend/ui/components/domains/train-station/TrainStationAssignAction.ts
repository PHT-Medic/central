/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, VNode } from 'vue';
import { ComponentListItemData } from '@vue-layout/utils';
import {
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
    TrainStation, buildSocketTrainStationInRoomName, buildSocketTrainStationOutRoomName,
} from '@personalhealthtrain/central-common';
import { Socket } from 'socket.io-client';

export type TrainStationAssignActionProperties = {
    trainId: string,
    stationId: string,
    realmId: string,
};

export const TrainStationAssignAction = Vue.extend<
ComponentListItemData<TrainStation>,
any,
any,
TrainStationAssignActionProperties>({
    name: 'TrainStationAssignAction',
    props: {
        trainId: String,
        stationId: String,
        realmId: String,
    },
    data() {
        return {
            busy: false,
            item: null,

            loaded: false,

            socket: null,
        };
    },
    created() {
        Promise.resolve()
            .then(() => this.init())
            .then(() => {
                this.loaded = true;
            });
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.realmId);

        socket.emit('trainStationsOutUnsubscribe');
        socket.off('trainStationCreated', this.handleSocketCreated);
        socket.off('trainStationDeleted', this.handleSocketDeleted);
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.realmId);
        socket.emit('trainStationsOutSubscribe');
        socket.on('trainStationCreated', this.handleSocketCreated);
        socket.on('trainStationDeleted', this.handleSocketDeleted);
    },
    methods: {
        async init() {
            try {
                const response = await this.$api.trainStation.getMany({
                    filters: {
                        train_id: this.trainId,
                        station_id: this.stationId,
                    },
                    page: {
                        limit: 1,
                    },
                });

                if (response.meta.total === 1) {
                    const { 0: item } = response.data;

                    this.item = item;
                }
            } catch (e) {
                // ...
            }
        },
        async add() {
            if (this.busy || this.item) return;

            this.busy = true;

            try {
                const response = await this.$api.trainStation.create({
                    train_id: this.trainId,
                    station_id: this.stationId,
                });

                this.item = response;

                this.$emit('created', response);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy || !this.item) return;

            this.busy = true;

            try {
                const userRole = await this.$api.trainStation.delete(this.item.id);

                this.item = null;

                this.$emit('deleted', userRole);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },

        isSameSocketRoom(room) {
            switch (this.direction) {
                case 'in':
                    return room === buildSocketTrainStationInRoomName();
                case 'out':
                    return room === buildSocketTrainStationOutRoomName();
            }

            return false;
        },
        async handleSocketCreated(context: SocketServerToClientEventContext<TrainStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.train_id !== this.trainId
            ) return;

            if (!this.item) {
                this.item = context.data;
            }

            this.$emit('created', context.data);
        },
        handleSocketDeleted(context: SocketServerToClientEventContext<TrainStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.train_id !== this.trainId
            ) return;

            if (
                this.item && this.item.id === context.data.id
            ) {
                this.item = null;
            }

            this.$emit('deleted', context.data);
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        let button = h();

        if (vm.loaded) {
            button = h('button', {
                class: {
                    'btn-success': !vm.item,
                    'btn-danger': vm.item,
                },
                staticClass: 'btn btn-xs',
                on: {
                    click($event: any) {
                        $event.preventDefault();

                        if (vm.item) {
                            return vm.drop.call(null);
                        }

                        return vm.add.call(null);
                    },
                },
            }, [
                h('i', {
                    staticClass: 'fa',
                    class: {
                        'fa-plus': !vm.item,
                        'fa-trash': vm.item,
                    },
                }),
            ]);
        }

        return h('div', [button]);
    },
});

export default TrainStationAssignAction;
