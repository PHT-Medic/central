/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CreateElement, VNode } from 'vue';
import Vue from 'vue';
import type { ComponentListItemData } from '@vue-layout/utils';
import type {
    ProposalStation,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import {
    ProposalStationSocketClientToServerEventName,
    ProposalStationSocketServerToClientEventName,
    buildProposalStationChannelNameForIncoming,
    buildProposalStationChannelNameForOutgoing,
} from '@personalhealthtrain/central-common';
import type { Socket } from 'socket.io-client';

export type ProposalStationAssignActionProperties = {
    proposalId: string,
    stationId: string,
    realmId: string,
};

export const ProposalStationAssignAction = Vue.extend<
ComponentListItemData<ProposalStation>,
any,
any,
ProposalStationAssignActionProperties>({
    name: 'ProposalStationAssignAction',
    props: {
        proposalId: String,
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

        socket.emit(ProposalStationSocketClientToServerEventName.OUT_UNSUBSCRIBE);
        socket.off(ProposalStationSocketServerToClientEventName.CREATED, this.handleSocketCreated);
        socket.off(ProposalStationSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.realmId);
        socket.emit(ProposalStationSocketClientToServerEventName.OUT_SUBSCRIBE);
        socket.on(ProposalStationSocketServerToClientEventName.CREATED, this.handleSocketCreated);
        socket.on(ProposalStationSocketServerToClientEventName.DELETED, this.handleSocketDeleted);
    },
    methods: {
        async init() {
            try {
                const response = await this.$api.proposalStation.getMany({
                    filters: {
                        proposal_id: this.proposalId,
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
                const response = await this.$api.proposalStation.create({
                    proposal_id: this.proposalId,
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
                const userRole = await this.$api.proposalStation.delete(this.item.id);

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
                    return room === buildSocketProposalStationInRoomName();
                case 'out':
                    return room === buildSocketProposalStationOutRoomName();
            }

            return false;
        },
        async handleSocketCreated(context: SocketServerToClientEventContext<ProposalStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.proposal_id !== this.proposalId
            ) return;

            if (!this.item) {
                this.item = context.data;
            }

            this.$emit('created', context.data);
        },
        handleSocketDeleted(context: SocketServerToClientEventContext<ProposalStation>) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.proposal_id !== this.proposalId
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

export default ProposalStationAssignAction;
