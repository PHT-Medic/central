<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { VCTimeago } from '@vuecs/timeago';
import type { ProposalStation } from '@personalhealthtrain/core';
import {
    PermissionID,
} from '@personalhealthtrain/core';
import {
    BDropdown, BDropdownDivider, BDropdownItem, BModal, BSpinner, BTable,
} from 'bootstrap-vue-next';
import { storeToRefs } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import {
    FPagination,
    FSearch,
    FTitle,
    ProposalInForm,
    ProposalStationApprovalCommand,
    ProposalStationApprovalStatus,
    ProposalStationList,
} from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';
import { definePageMeta } from '#imports';
import { useAPI } from '../../../composables/api';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination,
        ListSearch: FSearch,
        ListTitle: FTitle,
        BDropdown,
        BModal,
        BDropdownDivider,
        BDropdownItem,
        BSpinner,
        BTable,
        ProposalStationList,
        ProposalStationApprovalCommand,
        ProposalStationApprovalStatus,
        ProposalInForm,
        VCTimeago,
    },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.PROPOSAL_APPROVE,
            ],
        });

        const fields = [
            {
                key: 'proposal_id', label: 'Id', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'proposal_title', label: 'Title', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'realm', label: 'Realm', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'approval_status', label: 'Status', thClass: 'text-left', tdClass: 'text-left',
            },
            {
                key: 'created_at', label: 'Created At', thClass: 'text-center', tdClass: 'text-center',
            },
            {
                key: 'updated_at', label: 'Updated At', thClass: 'text-left', tdClass: 'text-left',
            },
            { key: 'options', label: '', tdClass: 'text-left' },
        ];

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const canManage = computed(() => store.has(PermissionID.PROPOSAL_APPROVE));

        const stationId : Ref<string | null> = ref(null);

        try {
            const response = await useAPI().station.getMany({
                filter: {
                    realm_id: realmId.value,
                },
            });

            const station = response.data.pop();
            if (station) {
                stationId.value = station.id;
            }
        } catch (e) {
            // do nothing :)
        }

        const modalNode = ref<boolean>(false);

        const entity = ref<null | ProposalStation>(null);

        const edit = (item: ProposalStation) => {
            entity.value = item;

            modalNode.value = true;
        };

        const listNode = ref<null | typeof ProposalStationList>(null);

        const handleUpdated = (item: ProposalStation) => {
            if (listNode.value) {
                listNode.value.handleUpdated(item);
            }

            modalNode.value = false;
        };

        const handleFailed = (e: Error) => {
            // todo: handle error
        };

        return {
            realmId,
            stationId,
            entity,
            handleFailed,
            handleUpdated,
            canManage,
            edit,
            fields,
            listNode,
            modalNode,
        };
    },
});
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is a slight overview of all incoming proposals from other stations. If you approve a proposal,
            your station can be used by inherited trains.
        </div>
        <div class="m-t-10">
            <proposal-station-list
                ref="listNode"
                :direction="'in'"
                :target="'proposal'"
                :realm-id="realmId"
                :source-id="stationId"
            >
                <template #header="props">
                    <ListTitle />
                    <ListSearch
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #footer="props">
                    <ListPagination
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #body="props">
                    <BTable
                        :items="props.data"
                        :fields="fields"
                        :busy="props.busy"
                        head-variant="'dark'"
                        outlined
                    >
                        <template #cell(realm)="data">
                            <span class="bg-dark badge">{{ data.item.proposal_realm_id }}</span>
                        </template>

                        <template #cell(approval_status)="data">
                            <proposal-station-approval-status
                                :status="data.item.approval_status"
                            >
                                <template #default="slotProps">
                                    <span
                                        class="badge"
                                        :class="'bg-'+slotProps.classSuffix"
                                    >
                                        {{ slotProps.statusText }}
                                    </span>
                                </template>
                            </proposal-station-approval-status>
                        </template>

                        <template #cell(proposal_id)="data">
                            {{ data.item.proposal.id }}
                        </template>
                        <template #cell(proposal_title)="data">
                            {{ data.item.proposal.title }}
                        </template>
                        <template #cell(options)="data">
                            <NuxtLink
                                class="btn btn-primary btn-xs me-1"
                                :to="'/proposals/'+data.item.proposal_id+'?refPath=/proposals/in'"
                            >
                                <i class="fa fa-arrow-right" />
                            </NuxtLink>
                            <template v-if="canManage">
                                <b-dropdown
                                    class="dropdown-xs"
                                    :no-caret="true"
                                >
                                    <template #button-content>
                                        <i class="fa fa-bars" />
                                    </template>
                                    <b-dropdown-item @click.prevent="edit(data.item)">
                                        <i class="fa fa-comment-alt ps-1 pe-1" /> comment
                                    </b-dropdown-item>
                                    <b-dropdown-divider />
                                    <proposal-station-approval-command
                                        :entity-id="data.item.id"
                                        :approval-status="data.item.approval_status"
                                        :with-icon="true"
                                        :element-type="'dropDownItem'"
                                        :command="'approve'"
                                        @updated="props.updated"
                                    />
                                    <proposal-station-approval-command
                                        :entity-id="data.item.id"
                                        :approval-status="data.item.approval_status"
                                        :with-icon="true"
                                        :element-type="'dropDownItem'"
                                        :command="'reject'"
                                        @updated="props.updated"
                                    />
                                </b-dropdown>
                            </template>
                        </template>
                        <template #cell(created_at)="data">
                            <VCTimeago :datetime="data.item.created_at" />
                        </template>
                        <template #cell(updated_at)="data">
                            <VCTimeago :datetime="data.item.updated_at" />
                        </template>
                        <template #table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </BTable>
                </template>
            </proposal-station-list>
        </div>

        <BModal
            v-model="modalNode"
            size="lg"
            button-size="sm"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <template #title>
                <i class="fas fa-file-import" /> Proposal {{ entity ? entity.proposal.title : '' }}
            </template>
            <template v-if="entity">
                <ProposalInForm
                    :entity="entity"
                    @updated="handleUpdated"
                    @failed="handleFailed"
                />
            </template>
            <template v-else>
                ...
            </template>
        </BModal>
    </div>
</template>
