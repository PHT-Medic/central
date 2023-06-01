<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Proposal } from '@personalhealthtrain/central-common';
import { PermissionID } from '@personalhealthtrain/central-common';
import { useToast } from 'bootstrap-vue-next';
import { toRefs } from 'vue';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import ProposalForm from '../../../components/domains/proposal/ProposalForm';

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
        const refs = toRefs(props);
        const toast = useToast();

        const handleUpdated = (entity: Proposal) => {
            toast.success({ body: 'The proposal was successfully updated.' });

            emit('updated', entity);
        };

        return {
            proposal: refs.proposal,
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
