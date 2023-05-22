<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import { navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';
import TrainWizard from '../../../components/domains/train/wizard/TrainWizard.vue';

export default defineNuxtComponent({
    components: { TrainWizard },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    methods: {
        async handleFinished() {
            await navigateTo(`/trains/${this.entity.id}`);
        },
        handleUpdated(train) {
            this.$emit('updated', train);
        },
    },
});
</script>
<template>
    <train-wizard
        :entity="entity"
        @updated="handleUpdated"
        @finished="handleFinished"
    />
</template>
