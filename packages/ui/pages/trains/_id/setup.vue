<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/central-common';
import TrainWizard from '../../../components/domains/train/wizard/TrainWizard.vue';

export default {
    components: { TrainWizard },
    props: {
        entity: Object as PropType<Train>,
    },
    methods: {
        async handleFinished() {
            await this.$nuxt.$router.push(`/trains/${this.entity.id}`);
        },
        handleUpdated(train) {
            this.$emit('updated', train);
        },
    },
};
</script>
<template>
    <train-wizard
        :entity="entity"
        @updated="handleUpdated"
        @finished="handleFinished"
    />
</template>
