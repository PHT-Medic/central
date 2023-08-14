<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Proposal } from '@personalhealthtrain/core';
import {
    PermissionID,
} from '@personalhealthtrain/core';

import { useToast } from 'bootstrap-vue-next';
import { ProposalForm } from '@personalhealthtrain/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent, navigateTo } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        ProposalForm,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionID.PROPOSAL_ADD,
            ],
        });
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
});
</script>
<template>
    <ProposalForm @created="handleCreated" />
</template>
