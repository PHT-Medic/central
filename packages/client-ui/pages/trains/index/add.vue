<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Train } from '@personalhealthtrain/core';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { TrainBasicForm } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';
import { navigateTo, useRoute } from '#imports';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: { TrainBasicForm },
    setup() {
        const proposalId = ref<string | null>(null);

        const store = useAuthStore();
        const { realmId } = storeToRefs(store);

        const route = useRoute();
        if (typeof route.query.proposal_id === 'string') {
            proposalId.value = route.query.proposal_id;
        }

        const handleCreated = async (train: Train) => {
            await navigateTo(`/trains/${train.id}/setup`);
        };

        return {
            proposalId,
            realmId,
            handleCreated,
        };
    },
});
</script>
<template>
    <TrainBasicForm
        :proposal-id="proposalId"
        :realm-id="realmId"
        @created="handleCreated"
    />
</template>
