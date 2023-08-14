<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Train } from '@personalhealthtrain/core';
import { TrainWizard } from '@personalhealthtrain/client-vue';
import { navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { TrainWizard },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit }) {
        const handleFinished = async () => {
            await navigateTo(`/trains/${props.entity.id}`);
        };

        const handleUpdated = (entity: Train) => {
            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleFinished,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <train-wizard
        v-if="entity"
        :entity="entity"
        @updated="handleUpdated"
        @finished="handleFinished"
        @failed="handleFailed"
    />
</template>
