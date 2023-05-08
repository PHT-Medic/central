<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Proposal } from '@personalhealthtrain/central-common';
import {
    PermissionID,
} from '@personalhealthtrain/central-common';

import { useToast } from 'bootstrap-vue-next';
import { navigateTo } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import ProposalForm from '../../../components/domains/proposal/ProposalForm';

export default {
    components: {
        ProposalForm,
    },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.PROPOSAL_ADD,
        ],
    },
    setup() {
        const toast = useToast();

        const handleCreated = (entity: Proposal) => {
            toast.success({ body: 'The proposal was successfully created.' }, {
                pos: 'top-center',
            });

            navigateTo({
                path: `/proposals/${entity.id}`,
            });
        };

        return {
            handleCreated,
        };
    },
};
</script>
<template>
    <proposal-form @created="handleCreated" />
</template>
