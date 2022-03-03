<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue from 'vue';
import { PermissionID, TrainStation } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { TrainStationList } from '../../../components/domains/train-station/TrainStationList';
import TrainStationApprovalStatus from '../../../components/domains/train-station/TrainStationApprovalStatus';
import TrainStationApprovalCommand from '../../../components/domains/train-station/TrainStationApprovalCommand';

export default Vue.extend({
    components: {
        TrainStationApprovalCommand,
        TrainStationApprovalStatus,
        TrainStationList,
    },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.TRAIN_APPROVE,
        ],
    },
    async asyncData(ctx) {
        try {
            const { data: stations } = await ctx.$api.station.getMany({
                filter: {
                    realm_id: ctx.store.getters['auth/userRealmId'],
                },
            });

            return {
                viewerStation: stations.length === 1 ? stations[0] : null,
            };
        } catch (e) {
            return {
                viewerStation: null,
            };
        }
    },
    data() {
        return {
            viewerStation: null,
            fields: [
                {
                    key: 'train_id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left',
                },
                {
                    key: 'approval_status', label: 'Status', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
                },
                {
                    key: 'created_at', label: 'Created At', thClass: 'text-left', tdClass: 'text-left',
                },
                { key: 'options', label: '', tdClass: 'text-left' },
            ],
        };
    },
    computed: {
        realmId() {
            return this.$store.getters['auth/userRealmId'];
        },
        canManage() {
            return this.$auth.hasPermission(PermissionID.TRAIN_APPROVE);
        },
    },
    methods: {
        download(item: TrainStation) {
            window.open(this.$config.apiUrl + this.$api.trainFile.getDownloadURI(item.train_id), '_blank');
        },

        handleUpdated(item) {
            if (this.$refs.itemList) {
                this.$refs.itemList.handleUpdated(item);
            }

            this.$refs.form.hide();
        },
    },
});
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is an overview of all incoming trains from other stations, that want to run an algorithm on your infrastructure.
        </div>

        <div class="m-t-10">
            <template v-if="viewerStation">
                <train-station-list
                    ref="itemList"
                    :target="'train'"
                    :realm-id="realmId"
                    :source-id="viewerStation.id"
                >
                    <template #items="props">
                        <b-table
                            :items="props.items"
                            :fields="fields"
                            :busy="props.busy"
                            head-variant="'dark'"
                            sort-by="id"
                            :sort-desc="true"
                            outlined
                        >
                            <template #cell(realm)="data">
                                <span class="badge-dark badge">{{ data.item.train_realm_id }}</span>
                            </template>
                            <template #cell(approval_status)="data">
                                <train-station-approval-status :status="data.item.approval_status">
                                    <template #default="props">
                                        <span
                                            class="badge"
                                            :class="'badge-'+props.classSuffix"
                                        >{{ props.statusText }}</span>
                                    </template>
                                </train-station-approval-status>
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
                                <template v-if="canManage">
                                    <b-dropdown
                                        class="dropdown-xs"
                                        :no-caret="true"
                                    >
                                        <template #button-content>
                                            <i class="fa fa-bars" />
                                        </template>
                                        <train-station-approval-command
                                            :entity-id="data.item.id"
                                            :approval-status="data.item.approval_status"
                                            :with-icon="true"
                                            :element-type="'dropDownItem'"
                                            :command="'approve'"
                                            @updated="props.handleUpdated"
                                        />
                                        <train-station-approval-command
                                            :entity-id="data.item.id"
                                            :approval-status="data.item.approval_status"
                                            :with-icon="true"
                                            :element-type="'dropDownItem'"
                                            :command="'reject'"
                                            @updated="props.handleUpdated"
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
                    </template>
                </train-station-list>
            </template>
        </div>
    </div>
</template>
