<script>
import {dropRealm, getRealms} from "@/domains/realm/api.ts";
import {editApiStationProposal, getApiStationProposals} from "@/domains/station/proposal/api.ts";
import {getStation, getStations} from "@/domains/station/api.ts";
import ProposalInForm from "@/components/proposal/ProposalInForm";

export default {
    components: {ProposalInForm},
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
            mode: 'add',
            isBusy: false,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'status', label: 'Status', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'proposal_id', label: 'Antrag Id', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'proposal_title', label: 'Antrag Titel', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'created_at', label: 'Erstellt', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updated_at', label: 'Aktualisiert', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
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
            this.isBusy = true;

            try {
                const stations = await getStations({
                    filter: {
                        realmId: this.user.realmId
                    }
                });

                if(stations.length === 1) {
                    this.station = stations[0];
                    this.items = await getApiStationProposals(this.station.id, 'self');
                }

                this.isBusy = false;
            } catch (e) {
                this.isBusy = false;
                throw e;
            }
        },
        async updateApiItem(item, data) {
            if(this.itemBusy) return;

            this.itemBusy = true;

            try {
                item = await editApiStationProposal(item.proposal.id, item.id, data);

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
            this.mode = 'edit';
            this.item = item;

            this.$refs['form'].show();
        }
    }
}
</script>
<template>
    <div class="container">
        <h4 class="title">
            Eingehende Anträge
        </h4>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary alert-sm">
                    Dies ist eine Übersicht aller Anträge von allen Stationen, die gerne einen Zug über Ihrere Station laufen lassen möchten...
                </div>
                <div class="d-flex flex-row">
                    <div>
                        <button @click.prevent="load" type="button" class="btn btn-xs btn-dark">
                            <i class="fas fa-sync"></i> Aktualisieren
                        </button>
                    </div>
                </div>
                <div class="m-t-10">
                    <b-table :items="items" :fields="fields" :busy="isBusy" head-variant="'dark'" outlined>
                        <template v-slot:cell(realm)="data">
                            <span class="badge-dark badge">{{data.item.proposal.realmId}}</span>
                        </template>

                        <template v-slot:cell(status)="data">
                            <span
                                class="badge"
                                :class="{
                                 'badge-warning': data.item.status === 'rejected',
                                 'badge-success': data.item.status === 'approved',
                                 'badge-info': data.item.status === 'open'
                                }"
                            >
                                <template v-if="data.item.status === 'approved'">
                                    angenommen
                                </template>
                                <template v-else-if="data.item.status === 'rejected'">
                                    abgelehnt
                                </template>
                                <template v-else>
                                    ausstehend
                                </template>
                            </span>
                        </template>

                        <template v-slot:cell(proposal_id)="data">
                            {{data.item.proposal.id}}
                        </template>
                        <template v-slot:cell(proposal_title)="data">
                            {{data.item.proposal.title}}
                        </template>
                        <template v-slot:cell(options)="data">
                            <button
                                v-if="$auth.can('approve','proposal') && (data.item.status === 'open' || data.item.status === 'rejected')"
                                @click.prevent="approve(data.item)"
                                class="btn btn-xs btn-primary"
                            >
                                <i class="fa fa-check"></i>
                            </button>
                            <button
                                v-if="$auth.can('approve','proposal')"
                                @click.prevent="edit(data.item)"
                                type="button"
                                class="btn btn-xs btn-secondary"
                            >
                                <i class="fa fa-comment"></i>
                            </button>
                            <button
                                v-if="$auth.can('approve','proposal')  && (data.item.status === 'open' || data.item.status === 'approved')"
                                @click.prevent="reject(data.item)"
                                type="button"
                                class="btn btn-xs btn-danger"
                            >
                                <i class="fa fa-times"></i>
                            </button>
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
                    <div class="alert alert-warning alert-sm" v-if="!isBusy && items.length === 0">
                        Es sind keine Anträge vorhanden...
                    </div>
                </div>
            </div>
        </div>
        <b-modal
            size="lg"
            ref="form"
            button-size="sm"
            :title-html="'<i class=\'fas fa-file-import\'></i> Antrag' + (item ? ': '+item.proposal.title : '')"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <proposal-in-form :proposal-station-property="item" @updated="handleUpdated" />
        </b-modal>
    </div>
</template>
