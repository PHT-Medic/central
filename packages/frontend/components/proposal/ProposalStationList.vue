<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {addApiProposalStation, dropApiProposalStation, getApiProposalStations} from "@/domains/proposal/station/api";
import ProposalStationStatus from "@/components/proposal/ProposalStationStatus";
import Pagination from "@/components/Pagination";
import Vue from 'vue';
import StationList from "@/components/station/StationList";

export default {
    components: {StationList, Pagination, ProposalStationStatus},
    props: {
        proposalId: Number | String,
        filter: Function
    },
    computed: {
        formattedItems() {
            if(typeof this.filter === 'undefined') {
                return this.items;
            }

            return this.items.filter(this.filter);
        },
        isProposalOwner() {
            if(this.formattedItems.length === 0) {
                return false;
            }

            return this.$store.getters['auth/userRealmId'] === this.formattedItems[0].proposal.realmId;
        }
    },
    data() {
        return {
            busy: false,
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },
            itemBusy: false
        }
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            if(this.busy) return;

            this.busy = true;

            try {
                const response = await getApiProposalStations({
                    filter: {
                        proposal_id: this.proposalId
                    },
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    }
                });

                this.items = response.data;
                const {total} = response.meta;

                this.meta.total = total;
            } catch (e) {

            }

            this.busy = false;
        },
        goTo(options, resolve, reject) {
            if(options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },
        async drop(id) {
            if(this.itemBusy) return;

            this.itemBusy = true;

            try {
                await dropApiProposalStation(id);
                const index = this.items.findIndex(item => item.id === id);
                if(index !== -1) this.items.splice(index, 1);

                this.$emit('dropped', id);
            } catch (e) {
                console.log(e);
            }

            this.itemBusy = false;
        },
        async add(station) {
            if(this.itemBusy) return;

            this.itemBusy = true;

            try {
                let proposalStation = await addApiProposalStation({
                    proposalId: this.proposalId,
                    stationId: station.id
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
            this.$refs['form'].show();
        },

        notInItems(item) {
            return this.items.findIndex(el => el.stationId === item.id) === -1;
        },

        addArrayItem(item) {
            this.items.push(item);
        },
        editArrayItem(item) {
            const index = this.items.findIndex(el => el.id === item.id);
            if(index !== -1) {
                for(let key in item) {
                    Vue.set(this.items[index], key, item[key]);
                }
            }
        }
    }
}
</script>
<template>
    <div>
        <slot name="header">
            <div class="d-flex flex-row mb-2">
                <div>
                    <slot name="header-title">
                        <h6 class="mb-0">Stations</h6>
                    </slot>
                </div>
                <div class="ml-auto">
                    <slot name="header-actions">
                        <button
                            v-if="isProposalOwner"
                            type="button"
                            class="btn btn-success btn-xs"
                            @click.prevent="showStations"
                        >
                            <i class="fa fa-plus"></i>
                        </button>
                    </slot>
                </div>
            </div>
        </slot>
        <div class="c-list">
            <div class="c-list-item mb-2" v-for="(item,key) in formattedItems" :key="key">
                <div class="c-list-content align-items-center">
                    <div class="c-list-icon">
                        <i class="fa fa-hospital"></i>
                    </div>
                    <span class="mb-0">{{item.station.name}}</span>
                    <proposal-station-status
                        :status="item.status"
                        v-slot:default="slotProps"
                        class="ml-2"
                    >
                        <span class="badge" :class="'badge-'+slotProps.classSuffix">
                            {{slotProps.statusText}}
                        </span>
                    </proposal-station-status>

                    <div class="ml-auto">
                        <slot name="actions" v-bind:item="item" v-bind:drop="drop">
                            <button
                                v-if="isProposalOwner"
                                type="button"
                                class="btn btn-danger btn-xs"
                                @click.prevent="drop(item.id)"
                            >
                                <i class="fa fa-trash"></i>
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!busy && formattedItems.length === 0" slot="no-more">
            <div class="alert alert-sm alert-info">
                No (more) stations available anymore.
            </div>
        </div>

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />

        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            title-html="<i class='fa fa-hospital'></i> Provider"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <station-list :filter-items="notInItems">
                <template v-slot:actions="props">
                    <button type="button" class="btn btn-xs btn-success" :disabled="itemBusy" @click.prevent="add(props.item)">
                        <i class="fa fa-plus"></i>
                    </button>
                </template>
            </station-list>
        </b-modal>
    </div>
</template>
