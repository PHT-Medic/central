<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';
import ProposalForm from '../../../components/domains/proposal/ProposalForm';

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
        proposal: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    methods: {
        handleUpdated(entity) {
            this.$emit('updated', entity);
        },
    },
};
</script>
<template>
    <proposal-form
        :entity-property="proposal"
        @updated="handleUpdated"
    />
</template>
