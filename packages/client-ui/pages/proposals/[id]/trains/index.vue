<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Proposal, ProposalStation } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { computed } from 'vue';
import type { PropType } from 'vue';
import { TrainList } from '@personalhealthtrain/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: { TrainList },
    props: {
        proposal: {
            type: Object as PropType<Proposal>,
            required: true,
        },
        visitorProposalStation: {
            type: Object as PropType<ProposalStation>,
            default: undefined,
        },
    },
    setup(props) {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.TRAIN_ADD,
                PermissionID.TRAIN_EDIT,
                PermissionID.TRAIN_DROP,

                PermissionID.TRAIN_RESULT_READ,

                PermissionID.TRAIN_EXECUTION_START,
                PermissionID.TRAIN_EXECUTION_STOP,
            ],
        });

        const query = computed(() => ({
            filter: {
                proposal_id: props.proposal.id,
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
        <div class="m-t-10">
            <template v-if="visitorProposalStation">
                <div class="alert alert-sm alert-warning">
                    You are not permitted to view the train list.
                </div>
            </template>
            <template v-else>
                <train-list
                    ref="trainTable"
                    :query="query"
                />
            </template>
        </div>
    </div>
</template>
