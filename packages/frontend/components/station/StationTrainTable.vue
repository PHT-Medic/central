<script>
import AlertMessage from "@/components/alert/AlertMessage";
import Pagination from "@/components/Pagination";
import {editTrainStation, getTrainStations} from "@/domains/train-station/api";
import {TrainStationStatusOptions} from "@/domains/train-station";
import TrainStationAction from "@/components/train-station/TrainStationAction";
import TrainStationApprovalStatusText from "@/components/train-station/status/TrainStationApprovalStatusText";
import {getTrainFilesDownloadUri} from "@/domains/train-file/api";

export default {
    components: {
        TrainStationApprovalStatusText,
        TrainStationAction,
        Pagination,
        AlertMessage
    },
    props: {
        proposalId: {
            type: Number,
            default: undefined
        },
        stationId: {
            type: Number,
            default: undefined
        }
    },
    data () {
        return {
            busy: false,
            message: null,
            fields: [
                { key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'status', label: 'Status', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'updatedAt', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'createdAt', label: 'Created At', thClass: 'text-left', tdClass: 'text-left' },
                { key: 'options', label: '', tdClass: 'text-left' }
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },

            actionBusy: false,

            train: undefined,
            statusOptions: TrainStationStatusOptions
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
                let record = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    include: [

                    ],
                    filter: {
                        station_id: this.stationId
                    }
                };

                if (typeof this.proposalId !== 'undefined') {
                    record.filter.proposal_id = this.proposalId;
                }

                const response = await getTrainStations(record);

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
        download(item) {
            window.open(this.$config.apiUrl+getTrainFilesDownloadUri(item.trainId), '_blank')
        },
        handleUpdated(item) {
            const index = this.items.findIndex(i => i.id === item.id);
            if(index !== -1) {
                this.items[index].status = item.status;
            }
        }
    },
    computed: {
        canApprove() {
            return this.$auth.can('approve','train');
        }
    }
}
</script>
<template>
    <div>
        <div class="d-flex flex-row mb-2">
            <div>
                <button class="btn btn-primary btn-xs" @click.prevent="load" :disabled="busy">
                    <i class="fa fa-sync"></i> refresh
                </button>
            </div>
        </div>

        <alert-message :message="message" />

        <b-table :items="items" :fields="fields" :busy="busy" head-variant="'dark'" sort-by="id" :sort-desc="true" outlined>
            <template v-slot:cell(id)="data">
                {{data.item.trainId}}
            </template>
            <template v-slot:cell(status)="data">
                <train-station-approval-status-text :status="data.item.status">
                    <template v-slot:default="props">
                        <span class="badge" :class="'badge-'+props.classSuffix">{{props.statusText}}</span>
                    </template>
                </train-station-approval-status-text>
            </template>
            <template v-slot:cell(createdAt)="data">
                <timeago :datetime="data.item.createdAt" />
            </template>
            <template v-slot:cell(updatedAt)="data">
                <timeago :datetime="data.item.updatedAt" />
            </template>

            <template v-slot:cell(options)="data">
                <button type="button" class="btn btn-dark btn-xs" @click.prevent="download(data.item)">
                    <i class="fa fa-file-download"></i>
                </button>
                <template v-if="canApprove">
                    <b-dropdown class="dropdown-xs" :no-caret="true">
                        <template #button-content>
                            <i class="fa fa-bars"></i>
                        </template>
                        <train-station-action
                            :train-station-id="data.item.id"
                            :status="data.item.status"
                            :with-icon="true"
                            action-type="dropDownItem"
                            action="approve"
                            @done="handleUpdated"
                        />
                        <train-station-action
                            :train-station-id="data.item.id"
                            :status="data.item.status"
                            :with-icon="true"
                            action-type="dropDownItem"
                            action="reject"
                            @done="handleUpdated"
                        />
                    </b-dropdown>
                </template>
            </template>

            <template v-slot:table-busy>
                <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle" />
                    <strong>Loading...</strong>
                </div>
            </template>
        </b-table>
        <div v-if="!busy && items.length === 0" class="alert alert-sm alert-warning">
            There are no trains available.
        </div>

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
    </div>
</template>
