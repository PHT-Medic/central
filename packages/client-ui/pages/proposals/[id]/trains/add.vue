<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Proposal } from '@personalhealthtrain/core';
import { TrainBasicForm } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    components: { TrainBasicForm },
    props: {
        proposal: {
            type: Object as PropType<Proposal>,
            required: true,
        },
    },
    setup(props) {
        const handleCreated = async () => {
            await navigateTo(`/proposals/${props.proposal.id}/trains`);
        };

        return {
            handleCreated,
        };
    },
});
</script>
<template>
    <TrainBasicForm
        :proposal-id="proposal.id"
        @created="handleCreated"
    />
</template>
