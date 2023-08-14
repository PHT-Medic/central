<!--
  Copyright (c) 2022-2023.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Station } from '@personalhealthtrain/core';
import type { PropType } from 'vue';
import { StationRobotEntity } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent } from '#app';

export default defineNuxtComponent({
    components: { StationRobotEntity },
    props: {
        entity: {
            type: Object as PropType<Station>,
            required: true,
        },
    },
    emits: ['failed'],
    methods: {
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
});
</script>
<template>
    <StationRobotEntity
        v-if="entity"
        :entity="entity"
        :realm-id="entity.realm_id"
        @failed="handleFailed"
    />
</template>
