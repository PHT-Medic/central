<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { toRefs } from 'vue';
import type { PropType } from 'vue';
import type { Proposal } from '@personalhealthtrain/central-common';
import { defineNuxtComponent, navigateTo } from '#app';
import TrainBasicForm from '../../../../components/domains/train/TrainBasicForm.vue';

export default defineNuxtComponent({
    components: { TrainBasicForm },
    props: {
        proposal: {
            type: Object as PropType<Proposal>,
            required: true,
        },
    },
    setup(props) {
        const refs = toRefs(props);

        const handleCreated = async () => {
            await navigateTo(`/proposals/${refs.proposal.value.id}/trains`);
        };

        return {
            handleCreated,
            proposal: refs.proposal,
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
