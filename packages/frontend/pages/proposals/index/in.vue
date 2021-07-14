<script>
import ProposalInForm from "@/components/proposal/ProposalInForm";
import ProposalStationStatus from "@/components/proposal/ProposalStationStatus";
import Pagination from "@/components/Pagination";
import {ProposalStationStatusOptions} from "@/domains/proposal/station";
import ProposalStationAction from "@/components/proposal/ProposalStationAction";
import {dropApiProposalStation, getApiProposalStations} from "@/domains/proposal/station/api";
import {getStations} from "@/domains/station/api";

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
                { key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },

            statusOptions: ProposalStationStatusOptions
        }
    },
    created() {
        this.load();
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
        async load() {
            this.busy = true;

            try {
                const {data: stations} = await getStations({
                    filter: {
                        realmId: this.user.realmId
                    }
                });

                if(stations.length !== 1) {
                    return;
                }

                let record = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        stationId: stations[0].id
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
        async updateApiItem(item, data) {
            if(this.itemBusy) return;

            this.itemBusy = true;

            try {
                item = await dropApiProposalStation(item.id, data);

                this.handleUpdated(item);
            } catch (e) {
                console.log(e);
            }

            this.itemBusy = false;
        },
        async approve(item) {
            return await this.updateApiItem(item, {status: 'approved'})
        },
        async reject(item) {
            return await this.updateApiItem(item, {status: 'rejected'})
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
                    <span class="badge-dark badge">{{data.item.proposal.realmId}}</span>
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
                    <nuxt-link class="btn btn-primary btn-xs" :to="'/proposals/'+data.item.proposalId+'?refPath=/proposals/in'">
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
                    <timeago :datetime="data.item.createdAt" />
                </template>
                <template v-slot:cell(updated_at)="data">
                    <timeago :datetime="data.item.updatedAt" />
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
