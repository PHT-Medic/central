<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { ProposalList } from '../../../components/domains/proposal/ProposalList';
import { ProposalItem } from '../../../components/domains/proposal/ProposalItem';

export default {
    components: { ProposalList, ProposalItem },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_ADD,
            PermissionID.PROPOSAL_DROP,
            PermissionID.PROPOSAL_EDIT,

            PermissionID.TRAIN_ADD,
            PermissionID.TRAIN_EDIT,
            PermissionID.TRAIN_DROP,

            PermissionID.TRAIN_RESULT_READ,

            PermissionID.TRAIN_EXECUTION_START,
            PermissionID.TRAIN_EXECUTION_STOP,
        ],
    },
    computed: {
        query() {
            return {
                include: {
                    user: true,
                },
                filter: {
                    realm_id: this.$store.getters['auth/userRealmId'],
                },
                sort: {
                    updated_at: 'DESC',
                },
            };
        },
    },
};
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is a slight overview of all proposals, which are created by you or one of your co workers.
        </div>
        <div class="m-t-10">
            <proposal-list
                :query="query"
            >
                <template #header-title>
                    <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
                </template>
                <template #item="props">
                    <proposal-item
                        :entity="props.item"
                        @updated="props.handleUpdated"
                        @deleted="props.handleDeleted"
                    />
                </template>
            </proposal-list>
        </div>
    </div>
</template>
