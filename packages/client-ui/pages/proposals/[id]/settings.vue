<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Proposal } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { ProposalForm } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_EDIT,
            PermissionID.PROPOSAL_DROP,
        ],
    },
    components: { ProposalForm },
    props: {
        proposal: {
            type: Object as PropType<Proposal>,
            required: true,
        },
    },
    emits: ['updated'],
    setup(props, { emit }) {
        const handleUpdated = (entity: Proposal) => {
            emit('updated', entity);
        };

        return {
            handleUpdated,
        };
    },
});
</script>
<template>
    <ProposalForm
        :entity="proposal"
        @updated="handleUpdated"
    />
</template>
