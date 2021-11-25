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
    dropApiProposalStation, getApiProposalStations,
} from '@personalhealthtrain/ui-common';

import Vue from 'vue';
import Pagination from '../../Pagination';
import StationList from '../station/StationList';
import ProposalStationApprovalStatusText from './ProposalStationApprovalStatusText';

export default {
    components: { ProposalStationApprovalStatusText, StationList, Pagination },
    props: {
        proposalId: Number | String,
        filter: Function,
    },
    data() {
        return {
            busy: false,
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
            itemBusy: false,
        };
    },
    computed: {
        formattedItems() {
            if (typeof this.filter === 'undefined') {
                return this.items;
            }

            return this.items.filter(this.filter);
        },
        isProposalOwner() {
            if (this.formattedItems.length === 0) {
                return false;
            }

            return this.$store.getters['auth/userRealmId'] === this.formattedItems[0].proposal.realm_id;
        },
        canEdit() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_EDIT);
        },
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await getApiProposalStations({
                    filter: {
                        proposal_id: this.proposalId,
                    },
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                });

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {

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
        async drop(id) {
            if (this.itemBusy) return;

            this.itemBusy = true;

            try {
                await dropApiProposalStation(id);
                const index = this.items.findIndex((item) => item.id === id);
                if (index !== -1) this.items.splice(index, 1);

                this.$emit('dropped', id);
            } catch (e) {
                console.log(e);
            }

            this.itemBusy = false;
        },
        async add(station) {
            if (this.itemBusy) return;

            this.itemBusy = true;

            try {
                const proposalStation = await addApiProposalStation({
                    proposal_id: this.proposalId,
                    station_id: station.id,
                });

                proposalStation.station = station;

                this.items.push(proposalStation);

                this.$emit('added', proposalStation);
            } catch (e) {
                console.log(e);
            }

            this.itemBusy = false;
        },

        showStations() {
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
                            v-if="isProposalOwner && canEdit"
                            type="button"
                            class="btn btn-success btn-xs"
                            @click.prevent="showStations"
                        >
                            <i class="fa fa-plus" />
                        </button>
                    </slot>
                </div>
            </div>
        </slot>
        <div class="c-list">
            <div
                v-for="(item,key) in formattedItems"
                :key="key"
                class="c-list-item mb-2"
            >
                <div class="c-list-content align-items-center">
                    <div class="c-list-icon">
                        <i class="fa fa-hospital" />
                    </div>
                    <span class="mb-0">{{ item.station.name }}</span>
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
                                v-if="isProposalOwner && canEdit"
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
                No (more) stations available anymore.
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
            title-html="<i class='fa fa-hospital'></i>"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <station-list :filter-items="notInItems">
                <template #actions="props">
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
