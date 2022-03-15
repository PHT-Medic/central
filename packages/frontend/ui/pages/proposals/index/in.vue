<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import Vue from 'vue';
import {
    PermissionID,
} from '@personalhealthtrain/central-common';
import { ProposalInForm } from '../../../components/domains/proposal/ProposalInForm';
import ProposalStationApprovalStatus from '../../../components/domains/proposal-station/ProposalStationApprovalStatus';
import ProposalStationApprovalCommand from '../../../components/domains/proposal-station/ProposalStationApprovalCommand';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { ProposalStationList } from '../../../components/domains/proposal-station/ProposalStationList';

export default Vue.extend({
    components: {
        ProposalStationList,
        ProposalStationApprovalCommand,
        ProposalStationApprovalStatus,
        ProposalInForm,
    },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_APPROVE,
        ],
    },
    data() {
        return {
            item: undefined,
            itemBusy: false,
            busy: false,
            fields: [
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
            ],
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },

            stationId: null,
        };
    },
    computed: {
        realmId() {
            return this.$store.getters['auth/userRealmId'];
        },
        canManage() {
            return this.$auth.hasPermission(PermissionID.PROPOSAL_APPROVE);
        },
    },
    created() {
        this.init()
            .then(this.load);
    },
    methods: {
        /**
         * Get station of current user.
         *
         * @return {Promise<void>}
         */
        async init() {
            const response = await this.$api.station.getMany({
                filter: {
                    realm_id: this.realmId,
                },
            });

            if (response.meta.total !== 1) {
                return;
            }

            this.stationId = response.data[0].id;
        },

        async edit(item) {
            this.item = item;

            this.$refs.form.show();
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
            This is a slight overview of all incoming proposals from other stations. If you approve a proposal,
            your station can be used by inherited trains.
        </div>
        <div class="m-t-10">
            <proposal-station-list
                ref="itemList"
                :direction="'in'"
                :target="'proposal'"
                :realm-id="realmId"
                :source-id="stationId"
            >
                <template #header-title>
                    <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
                </template>
                <template #items="props">
                    <b-table
                        :items="props.items"
                        :fields="fields"
                        :busy="props.busy"
                        head-variant="'dark'"
                        outlined
                    >
                        <template #cell(realm)="data">
                            <span class="badge-dark badge">{{ data.item.proposal_realm_id }}</span>
                        </template>

                        <template #cell(approval_status)="data">
                            <proposal-station-approval-status
                                :status="data.item.approval_status"
                            >
                                <template #default="slotProps">
                                    <span
                                        class="badge"
                                        :class="'badge-'+slotProps.classSuffix"
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
                            <nuxt-link
                                class="btn btn-primary btn-xs"
                                :to="'/proposals/'+data.item.proposal_id+'?refPath=/proposals/in'"
                            >
                                <i class="fa fa-arrow-right" />
                            </nuxt-link>
                            <template v-if="canManage">
                                <b-dropdown
                                    class="dropdown-xs"
                                    :no-caret="true"
                                >
                                    <template #button-content>
                                        <i class="fa fa-bars" />
                                    </template>
                                    <b-dropdown-item @click.prevent="edit(data.item)">
                                        <i class="fa fa-comment-alt pl-1 pr-1" /> comment
                                    </b-dropdown-item>
                                    <b-dropdown-divider />
                                    <proposal-station-approval-command
                                        :entity-id="data.item.id"
                                        :approval-status="data.item.approval_status"
                                        :with-icon="true"
                                        :element-type="'dropDownItem'"
                                        :command="'approve'"
                                        @updated="props.handleUpdated"
                                    />
                                    <proposal-station-approval-command
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
                        <template #cell(created_at)="data">
                            <timeago :datetime="data.item.created_at" />
                        </template>
                        <template #cell(updated_at)="data">
                            <timeago :datetime="data.item.updated_at" />
                        </template>
                        <template #table-busy>
                            <div class="text-center text-danger my-2">
                                <b-spinner class="align-middle" />
                                <strong>Loading...</strong>
                            </div>
                        </template>
                    </b-table>
                </template>
            </proposal-station-list>
        </div>

        <b-modal
            ref="form"
            size="lg"
            button-size="sm"
            :title-html="'<i class=\'fas fa-file-import\'></i> Proposal' + (item ? ': '+item.proposal.title : '')"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <proposal-in-form
                :entity="item"
                @updated="handleUpdated"
            />
        </b-modal>
    </div>
</template>
