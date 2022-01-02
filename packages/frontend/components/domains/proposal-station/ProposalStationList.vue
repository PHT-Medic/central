<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    PermissionID,
    addApiProposalStation,
    buildSocketProposalStationInRoomName,
    buildSocketProposalStationOutRoomName,
    buildSocketProposalStationRoomName,
    dropApiProposalStation,
    getApiProposalStation, getApiProposalStations, mergeDeep,
} from '@personalhealthtrain/ui-common';

import Vue from 'vue';
import Pagination from '../../Pagination';
import StationList from '../station/StationList';
import ProposalStationApprovalStatusText from './ProposalStationApprovalStatusText';

export default {
    components: {
        ProposalStationApprovalStatusText,
        StationList,
        Pagination,
    },
    props: {
        proposalId: Number,
        filter: Function,
        query: {
            type: Object,
            default() {
                return {};
            },
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

            socketLockedId: null,
            socketLockedStationId: null,
        };
    },
    computed: {
        formattedItems() {
            if (typeof this.filter === 'undefined') {
                return this.items;
            }

            return this.items.filter(this.filter);
        },
        canEdit() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_EDIT);
        },
        direction() {
            return this.realmId === this.$store.getters['auth/userRealmId'] ?
                'out' :
                'in';
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
        const socket = this.$socket.useRealmWorkspace(this.realmId);
        switch (this.direction) {
            case 'in':
                socket.emit('proposalStationsInSubscribe');
                break;
            case 'out':
                socket.emit('proposalStationsOutSubscribe');
                break;
        }

        socket.on('proposalStationCreated', this.handleSocketCreated);
        socket.on('proposalStationDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.realmId);
        switch (this.direction) {
            case 'in':
                socket.emit('proposalStationsInUnsubscribe');
                break;
            case 'out':
                socket.emit('proposalStationsOutUnsubscribe');
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
            }

            return false;
        },
        async handleSocketCreated(context) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.proposal_id !== this.proposalId ||
                context.data.station_id === this.socketLockedStationId
            ) return;

            const index = this.items.findIndex((item) => item.id === context.data.id);
            if (index === -1) {
                this.items.push(context.data);
                this.meta.total++;

                const data = await getApiProposalStation(context.data.id, {
                    include: {
                        station: true,
                    },
                });

                this.editArrayItem(data);
            }

            this.$emit('created', context.data);
        },
        handleSocketDeleted(context) {
            if (
                !this.isSameSocketRoom(context.meta.roomName) ||
                context.data.proposal_id !== this.proposalId ||
                context.data.id === this.socketLockedId
            ) return;

            const index = this.items.findIndex((item) => item.id === context.data.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }

            this.$emit('deleted', context.data);
        },
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await getApiProposalStations(mergeDeep({
                    filter: {
                        proposal_id: this.proposalId,
                        station: {
                            name: this.q.length > 0 ? `~${this.q}` : this.q,
                        },
                    },
                    include: {
                        station: true,
                    },
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
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
        async drop(id) {
            if (this.itemBusy) return;

            this.itemBusy = true;

            try {
                this.socketLockedId = id;

                await dropApiProposalStation(id);
                this.dropArrayItem({ id });

                this.$emit('deleted', id);

                this.socketLockedId = null;
            } catch (e) {
                console.log(e);
            }

            this.itemBusy = false;
        },
        async add(station) {
            if (this.itemBusy) return;

            this.itemBusy = true;

            try {
                this.socketLockedStationId = station.id;

                const proposalStation = await addApiProposalStation({
                    proposal_id: this.proposalId,
                    station_id: station.id,
                });

                proposalStation.station = station;

                this.items.push(proposalStation);

                this.$emit('created', proposalStation);

                this.socketLockedStationId = null;
            } catch (e) {
                console.log(e);
            }

            this.itemBusy = false;
        },

        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },

        showModal() {
            this.$refs.form.show();
        },

        notInItems(item) {
            return this.items.findIndex((el) => el.station_id === item.id) === -1;
        },

        addArrayItem(item) {
            this.items.push(item);
        },
        editArrayItem(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                for (const key in item) {
                    Vue.set(this.items[index], key, item[key]);
                }
            }
        },
        dropArrayItem(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
};
</script>
<template>
    <div>
        <slot name="header">
            <div class="d-flex flex-row mb-2">
                <div>
                    <slot name="header-title">
                        <h6 class="mb-0">
                            Stations
                        </h6>
                    </slot>
                </div>
                <div class="ml-auto">
                    <slot name="header-actions">
                        <button
                            v-if="canEdit"
                            type="button"
                            class="btn btn-success btn-xs"
                            @click.prevent="showModal"
                        >
                            <i class="fa fa-plus" />
                        </button>
                    </slot>
                </div>
            </div>
        </slot>
        <div class="form-group">
            <div class="input-group">
                <label />
                <input
                    v-model="q"
                    type="text"
                    name="q"
                    class="form-control"
                    placeholder="..."
                >
                <div class="input-group-append">
                    <span class="input-group-text"><i class="fa fa-search" /></span>
                </div>
            </div>
        </div>
        <div class="c-list">
            <div
                v-for="(item) in formattedItems"
                :key="item.id"
                class="c-list-item mb-2"
            >
                <div class="c-list-content align-items-center">
                    <div class="c-list-icon">
                        <i class="fa fa-hospital" />
                    </div>
                    <span class="mb-0">
                        <template v-if="item.station">
                            {{ item.station.name }}
                        </template>
                        <template v-else>
                            Station #{{ item.station_id }}
                        </template>
                    </span>
                    <proposal-station-approval-status-text
                        v-slot="slotProps"
                        :status="item.approval_status"
                        class="ml-2"
                    >
                        <span
                            class="badge"
                            :class="'badge-'+slotProps.classSuffix"
                        >
                            {{ slotProps.statusText }}
                        </span>
                    </proposal-station-approval-status-text>

                    <div class="ml-auto">
                        <slot
                            name="actions"
                            :item="item"
                            :drop="drop"
                        >
                            <button
                                v-if="canEdit"
                                type="button"
                                class="btn btn-danger btn-xs"
                                @click.prevent="drop(item.id)"
                            >
                                <i class="fa fa-trash" />
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="!busy && formattedItems.length === 0"
            slot="no-more"
        >
            <div class="alert alert-sm alert-info">
                No (more) stations available.
            </div>
        </div>

        <pagination
            :total="meta.total"
            :offset="meta.offset"
            :limit="meta.limit"
            @to="goTo"
        />

        <b-modal
            ref="form"
            size="lg"
            button-size="sm"
            title-html="<i class='fa fa-hospital'></i> Stations"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <station-list
                :filter-items="notInItems"
                :with-title="false"
            >
                <template #item-actions="props">
                    <button
                        v-if="canEdit"
                        type="button"
                        class="btn btn-xs btn-success"
                        :disabled="itemBusy"
                        @click.prevent="add(props.item)"
                    >
                        <i class="fa fa-plus" />
                    </button>
                </template>
            </station-list>
        </b-modal>
    </div>
</template>
