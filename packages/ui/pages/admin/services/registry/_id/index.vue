<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { toRefs } from 'vue';
import type { PropType } from 'vue';
import type { Registry } from '@personalhealthtrain/central-common';
import { defineNuxtComponent } from '#app';
import RegistryForm from '../../../../../components/domains/registry/RegistryForm';

export default defineNuxtComponent({
    components: { RegistryForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    emits: ['updated', 'deleted', 'failed'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const handleUpdated = (e: Registry) => {
            emit('updated', e);
        };

        const handleDeleted = (e: Registry) => {
            emit('deleted', e);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            entity: refs.entity,
            handleUpdated,
            handleDeleted,
            handleFailed,
        };
    },
    methods: {
        handleUpdated(e) {
            this.$emit('updated', e);
        },
        handleDeleted(e) {
            this.$emit('deleted', e);
        },
    },
});
</script>
<template>
    <RegistryForm
        :entity="entity"
        @updated="handleUpdated"
        @deleted="handleDeleted"
        @failed="handleFailed"
    />
</template>
