<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { PropType } from 'vue';
import { Registry } from '@personalhealthtrain/central-common';
import { RegistryForm } from '../../../../../components/domains/registry/RegistryForm';

export default {
    components: { RegistryForm },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            default: undefined,
        },
    },
    methods: {
        handleUpdated(e) {
            this.$emit('updated', e);
        },
        handleDeleted(e) {
            this.$emit('deleted', e);
        },
    },
};
</script>
<template>
    <div>
        <registry-form
            :entity="entity"
            @updated="handleUpdated"
            @deleted="handleDeleted"
        />
    </div>
</template>
