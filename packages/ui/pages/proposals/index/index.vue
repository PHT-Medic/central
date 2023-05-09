<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import ProposalList from '../../../components/domains/proposal/ProposalList';
import ProposalItem from '../../../components/domains/proposal/ProposalItem';
import { defineNuxtComponent, definePageMeta } from '#imports';
import { useAuthStore } from '~/store/auth';

export default defineNuxtComponent({
    components: { ProposalList, ProposalItem },
    setup() {
        definePageMeta({
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
        });

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const query = computed(() => ({
            filter: {
                realm_id: realmId.value,
            },
            sort: {
                updated_at: 'DESC',
            },
        }));

        return {
            query,
        };
    },
});
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is a slight overview of all proposals, which are created by you or one of your co workers.
        </div>
        <div class="m-t-10">
            <ProposalList
                :query="query"
            >
                <template #header-title>
                    <h6><i class="fa-solid fa-list pr-1" /> Overview</h6>
                </template>
                <template #item="props">
                    <proposal-item
                        :entity="props.data"
                        @updated="props.handleUpdated"
                        @deleted="props.handleDeleted"
                    />
                </template>
            </ProposalList>
        </div>
    </div>
</template>
