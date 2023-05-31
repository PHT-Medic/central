<!--
  Copyright (c) 2022-2023.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Station } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';
import StationForm from '../../../../components/domains/station/StationForm';
import StationRegistryProjectDetails from '../../../../components/domains/station/StationRegistryProjectDetails';

export default defineNuxtComponent({
    components: { StationRegistryProjectDetails, StationForm },
    props: {
        entity: {
            type: Object as PropType<Station>,
            required: true,
        },
    },
    emits: ['failed', 'updated'],
    methods: {
        handleUpdated(e) {
            this.$emit('updated', e);
        },
        handleFailed(e) {
            this.$emit('failed', e);
        },
    },
});
</script>
<template>
    <StationRegistryProjectDetails
        v-if="entity"
        :entity="entity"
        :realm-id="entity.realm_id"
        @updated="handleUpdated"
        @failed="handleFailed"
    />
</template>
