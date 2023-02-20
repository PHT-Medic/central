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
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { ProposalForm } from '../../../components/domains/proposal/ProposalForm';

export default {
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
        proposal: Object as PropType<Proposal>,
    },
    methods: {
        handleUpdated(entity) {
            this.$bvToast.toast('The proposal was successfully updated.', {
                variant: 'success',
                toaster: 'b-toaster-top-center',
            });

            this.$emit('updated', entity);
        },
    },
};
</script>
<template>
    <proposal-form
        :entity="proposal"
        @updated="handleUpdated"
    />
</template>
