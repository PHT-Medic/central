<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PropType } from 'vue';
import { Proposal } from '@personalhealthtrain/central-common';
import TrainBasicForm from '../../../../components/domains/train/TrainBasicForm.vue';

export default {
    components: { TrainBasicForm },
    props: {
        proposal: Object as PropType<Proposal>,
    },
    methods: {
        handleCreated() {
            this.$router.push({ path: `/proposals/${this.proposal.id}/trains` });
        },
    },
};
</script>
<template>
    <div>
        <train-basic-form
            :proposal-id="proposal.id"
            @created="handleCreated"
        />
    </div>
</template>
