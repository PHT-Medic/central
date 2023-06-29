<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { Timeago } from '@vue-layout/timeago';
import type { Train, TrainStation } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { BDropdown, BTable } from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed, ref } from 'vue';
import { defineNuxtComponent, useRuntimeConfig } from '#app';
import { definePageMeta, useAPI } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import TrainStationList from '../../../components/domains/train-station/TrainStationList';
import TrainStationApprovalStatus from '../../../components/domains/train-station/TrainStationApprovalStatus';
import TrainStationApprovalCommand from '../../../components/domains/train-station/TrainStationApprovalCommand';
import TrainStationRunStatus from '../../../components/domains/train-station/TrainStationRunStatus';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: {
        BDropdown,
        BTable,
        TrainStationRunStatus,
        TrainStationApprovalCommand,
        TrainStationApprovalStatus,
        TrainStationList,
        Timeago,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.TRAIN_APPROVE,
            ],
        });

        const fields = [
            {
                key: 'train_id', label: 'ID', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'approval_status', label: 'Approval Status', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'run_status', label: 'Run Status', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-left', tdClass: 'text-left',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const canManage = computed(() => store.has(PermissionID.TRAIN_APPROVE));

        const query = computed<BuildInput<Train>>(() => ({
            include: {
                station: true,
            },
        }));

        const download = (item: TrainStation) => {
            const app = useRuntimeConfig();

            window.open(new URL(useAPI().train.getFilesDownloadPath(item.train_id), app.public.apiUrl).href, '_blank');
        };

        const listNode = ref<null | TrainStationList>(null);

        const handleUpdated = (item: TrainStation) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }
        };

        return {
            fields,
            realmId,
            canManage,
            query,
            download,
            handleUpdated,
            listNode,
        };
    },
});
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is an overview of all incoming trains from other stations, that want to run an algorithm on your infrastructure.
        </div>

        <div class="m-t-10">
            <TrainStationList
                ref="listNode"
                :target="'train'"
                :realm-id="realmId"
                :direction="'in'"
                :query="query"
            >
                <template #headerTitle>
                    <h6><i class="fa-solid fa-list pe-1" /> Overview</h6>
                </template>
                <template #body="props">
                    <BTable
                        :items="props.data"
                        :fields="fields"
                        :busy="props.busy"
                        head-variant="'dark'"
                        sort-by="id"
                        :sort-desc="true"
                        outlined
                    >
                        <template #cell(realm)="data">
                            <span class="bg-dark badge">{{ data.item.train_realm_id }}</span>
                        </template>
                        <template #cell(approval_status)="data">
                            <train-station-approval-status :status="data.item.approval_status">
                                <template #default="statusProps">
                                    <span
                                        class="badge"
                                        :class="'bg-'+statusProps.classSuffix"
                                    >{{ statusProps.statusText }}</span>
                                </template>
                            </train-station-approval-status>
                        </template>
                        <template #cell(run_status)="data">
                            <train-station-run-status :status="data.item.run_status">
                                <template #default="statusProps">
                                    <span
                                        class="badge"
                                        :class="'bg-'+statusProps.classSuffix"
                                    >{{ statusProps.statusText }}</span>
                                </template>
                            </train-station-run-status>
                        </template>
                        <template #cell(created_at)="data">
                            <Timeago :datetime="data.item.created_at" />
                        </template>
                        <template #cell(updated_at)="data">
                            <Timeago :datetime="data.item.updated_at" />
                        </template>

                        <template #cell(options)="data">
                            <button
                                type="button"
                                class="btn btn-dark btn-xs me-1"
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
                    </BTable>
                </template>
            </TrainStationList>
        </div>
    </div>
</template>
