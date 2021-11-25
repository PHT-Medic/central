<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    TrainStationApprovalStatus,
    getAPITrainFilesDownloadUri,
    getAPITrainStations,
} from '@personalhealthtrain/ui-common';
import AlertMessage from '../../alert/AlertMessage';
import Pagination from '../../Pagination';
import TrainStationAction from '../train-station/TrainStationAction';
import TrainStationApprovalStatusText from '../train-station/status/TrainStationApprovalStatusText';

export default {
    components: {
        TrainStationApprovalStatusText,
        TrainStationAction,
        Pagination,
        AlertMessage,
    },
    props: {
        stationId: {
            type: Number,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,
            message: null,
            fields: [
                {
                    key: 'id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'approval_status', label: 'Approval Status', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },

            actionBusy: false,

            train: undefined,
            statusOptions: TrainStationApprovalStatus,
        };
    },
    computed: {
        canApprove() {
            return this.$auth.can('approve', 'train');
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
                const response = await getAPITrainStations({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        station_id: this.stationId,
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
        download(item) {
            window.open(this.$config.apiUrl + getAPITrainFilesDownloadUri(item.train_id), '_blank');
        },
        handleUpdated(item) {
            const index = this.items.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                this.items[index].approval_status = item.approval_status;
            }
        },
    },
};
</script>
<template>
    <div>
        <div class="d-flex flex-row mb-2">
            <div>
                <button
                    class="btn btn-primary btn-xs"
                    :disabled="busy"
                    @click.prevent="load"
                >
                    <i class="fa fa-sync" /> refresh
                </button>
            </div>
        </div>

        <alert-message :message="message" />

        <b-table
            :items="items"
            :fields="fields"
            :busy="busy"
            head-variant="'dark'"
            sort-by="id"
            :sort-desc="true"
            outlined
        >
            <template #cell(id)="data">
                {{ data.item.train_id }}
            </template>
            <template #cell(approval_status)="data">
                <train-station-approval-status-text :status="data.item.approval_status">
                    <template #default="props">
                        <span
                            class="badge"
                            :class="'badge-'+props.classSuffix"
                        >{{ props.statusText }}</span>
                    </template>
                </train-station-approval-status-text>
            </template>
            <template #cell(created_at)="data">
                <timeago :datetime="data.item.created_at" />
            </template>
            <template #cell(updated_at)="data">
                <timeago :datetime="data.item.updated_at" />
            </template>

            <template #cell(options)="data">
                <button
                    type="button"
                    class="btn btn-dark btn-xs"
                    @click.prevent="download(data.item)"
                >
                    <i class="fa fa-file-download" />
                </button>
                <template v-if="canApprove">
                    <b-dropdown
                        class="dropdown-xs"
                        :no-caret="true"
                    >
                        <template #button-content>
                            <i class="fa fa-bars" />
                        </template>
                        <train-station-action
                            :train-station-id="data.item.id"
                            :approval-status="data.item.approval_status"
                            :with-icon="true"
                            action-type="dropDownItem"
                            action="approve"
                            @done="handleUpdated"
                        />
                        <train-station-action
                            :train-station-id="data.item.id"
                            :approval-status="data.item.approval_status"
                            :with-icon="true"
                            action-type="dropDownItem"
                            action="reject"
                            @done="handleUpdated"
                        />
                    </b-dropdown>
                </template>
            </template>

            <template #table-busy>
                <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle" />
                    <strong>Loading...</strong>
                </div>
            </template>
        </b-table>
        <div
            v-if="!busy && items.length === 0"
            class="alert alert-sm alert-warning"
        >
            There are no trains available.
        </div>

        <pagination
            :total="meta.total"
            :offset="meta.offset"
            :limit="meta.limit"
            @to="goTo"
        />
    </div>
</template>
