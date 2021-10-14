<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    getAPITrainFilesDownloadUri,
    getAPITrainStations,
    TrainStationApprovalStatus
} from "@personalhealthtrain/ui-common";
import AlertMessage from "../../components/alert/AlertMessage";
import Pagination from "../../components/Pagination";
import TrainStationAction from "../../components/train-station/TrainStationAction";
import TrainStationApprovalStatusText from "../../components/train-station/status/TrainStationApprovalStatusText";

export default {
    components: {
        TrainStationApprovalStatusText,
        TrainStationAction,
        Pagination,
        AlertMessage
    },
    props: {
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
                { key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center' },
                { key: 'created_at', label: 'Created At', thClass: 'text-left', tdClass: 'text-left' },
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
            statusOptions: TrainStationApprovalStatus
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
                const response = await getAPITrainStations({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        station_id: this.station_id
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
        download(item) {
            window.open(this.$config.apiUrl+getAPITrainFilesDownloadUri(item.train_id), '_blank')
        },
        handleUpdated(item) {
            const index = this.items.findIndex(i => i.id === item.id);
            if(index !== -1) {
                this.items[index].approval_status = item.approval_status;
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
                {{data.item.train_id}}
            </template>
            <template v-slot:cell(status)="data">
                <train-station-approval-status-text :status="data.item.approval_status">
                    <template v-slot:default="props">
                        <span class="badge" :class="'badge-'+props.classSuffix">{{props.statusText}}</span>
                    </template>
                </train-station-approval-status-text>
            </template>
            <template v-slot:cell(created_at)="data">
                <timeago :datetime="data.item.created_at" />
            </template>
            <template v-slot:cell(updated_at)="data">
                <timeago :datetime="data.item.updated_at" />
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
                            :status="data.item.approval_status"
                            :with-icon="true"
                            action-type="dropDownItem"
                            action="approve"
                            @done="handleUpdated"
                        />
                        <train-station-action
                            :train-station-id="data.item.id"
                            :status="data.item.approval_status"
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
