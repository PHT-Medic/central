<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {getApiProposalStations, getAPIStations, ProposalStationApprovalStatus} from "@personalhealthtrain/ui-common";
import ProposalInForm from "../../../components/proposal/ProposalInForm";
import ProposalStationStatus from "../../../components/proposal/ProposalStationStatus";
import Pagination from "../../../components/Pagination";
import ProposalStationAction from "../../../components/proposal/ProposalStationAction";

export default {
    components: {ProposalStationAction, Pagination, ProposalStationStatus, ProposalInForm},
    meta: {
        requireLoggedIn: true,
        requireAbility(can) {
            return can('approve','proposal');
        }
    },
    data() {
        return {
            item: undefined,
            itemBusy: false,
            busy: false,
            fields: [
                { key: 'proposal_id', label: 'Id', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'proposal_title', label: 'Title', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'status', label: 'Status', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },

            statusOptions: ProposalStationApprovalStatus,

            station: null
        }
    },
    created() {
        this.init()
            .then(this.load);
    },
    computed: {
      user() {
          return this.$store.getters['auth/user'];
      }
    },
    methods: {
        handleCreated(e) {
            this.$refs['form'].hide();

            this.items.push(e);
        },
        handleUpdated(e) {
            this.$refs['form'].hide();

            const index = this.items.findIndex(item => item.id === e.id);

            Object.assign(this.items[index], e);
        },


        /**
         * Get station of current user.
         *
         * @return {Promise<void>}
         */
        async init() {
            const {data: stations} = await getAPIStations({
                filter: {
                    realm_id: this.user.realm_id
                }
            });

            if(stations.length !== 1) {
                return;
            }

            this.station = stations[0];
        },

        /**
         * Load proposals.
         *
         * @return {Promise<void>}
         */
        async load() {
            if(this.busy || !this.station) return;

            this.busy = true;

            try {
                let record = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        station_id: this.station.id
                    }
                };

                const response = await getApiProposalStations(record);

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

        async edit(item) {
            this.item = item;

            this.$refs['form'].show();
        }
    }
}
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is a slight overview of all incoming proposals from other stations. If you approve a proposal,
            your station can be targeted by inherited trains from that proposal.
        </div>
        <div class="d-flex flex-row">
            <div>
                <button @click.prevent="load" type="button" class="btn btn-xs btn-dark">
                    <i class="fas fa-sync"></i> Refresh
                </button>
            </div>
        </div>
        <div class="m-t-10">
            <b-table :items="items" :fields="fields" :busy="busy" head-variant="'dark'" outlined>
                <template v-slot:cell(realm)="data">
                    <span class="badge-dark badge">{{data.item.proposal.realm_id}}</span>
                </template>

                <template v-slot:cell(status)="data">
                    <proposal-station-status
                        :status="data.item.status"
                        v-slot:default="slotProps"
                    >
                        <span class="badge" :class="'badge-'+slotProps.classSuffix">
                            {{slotProps.statusText}}
                        </span>
                    </proposal-station-status>
                </template>

                <template v-slot:cell(proposal_id)="data">
                    {{data.item.proposal.id}}
                </template>
                <template v-slot:cell(proposal_title)="data">
                    {{data.item.proposal.title}}
                </template>
                <template v-slot:cell(options)="data">
                    <nuxt-link class="btn btn-primary btn-xs" :to="'/proposals/'+data.item.proposal_id+'?refPath=/proposals/in'">
                        <i class="fa fa-arrow-right"></i>
                    </nuxt-link>
                    <template v-if="$auth.can('approve', 'proposal')">
                        <b-dropdown class="dropdown-xs" :no-caret="true">
                            <template #button-content>
                                <i class="fa fa-bars"></i>
                            </template>
                            <b-dropdown-item @click.prevent="edit(data.item)"><i class="fa fa-comment-alt pl-1 pr-1"></i> comment</b-dropdown-item>
                            <b-dropdown-divider />
                            <proposal-station-action
                                :proposal-station-id="data.item.id"
                                :status="data.item.status"
                                :with-icon="true"
                                action-type="dropDownItem"
                                action="approve"
                                @done="handleUpdated"
                            />
                            <proposal-station-action
                                :proposal-station-id="data.item.id"
                                :status="data.item.status"
                                :with-icon="true"
                                action-type="dropDownItem"
                                action="reject"
                                @done="handleUpdated"
                            />
                        </b-dropdown>
                    </template>
                </template>
                <template v-slot:cell(created_at)="data">
                    <timeago :datetime="data.item.created_at" />
                </template>
                <template v-slot:cell(updated_at)="data">
                    <timeago :datetime="data.item.updated_at" />
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-danger my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
            <div class="alert alert-warning alert-sm" v-if="!busy && items.length === 0">
                There are no proposals available.
            </div>
        </div>

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />

        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            :title-html="'<i class=\'fas fa-file-import\'></i> Proposal' + (item ? ': '+item.proposal.title : '')"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <proposal-in-form :proposal-station-property="item" @updated="handleUpdated" />
        </b-modal>
    </div>
</template>
