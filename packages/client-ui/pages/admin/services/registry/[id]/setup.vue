<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Registry } from '@personalhealthtrain/central-common';
import { Ecosystem } from '@personalhealthtrain/central-common';
import type { PropType } from 'vue';
import { toRefs } from 'vue';
import { RegistrySetup } from '@personalhealthtrain/client-vue';
import { defineNuxtComponent, navigateTo } from '#app';

export default defineNuxtComponent({
    components: { RegistrySetup },
    props: {
        entity: {
            type: Object as PropType<Registry>,
            required: true,
        },
    },
    async setup(props) {
        const refs = toRefs(props);
        if (refs.entity.value.ecosystem !== Ecosystem.DEFAULT) {
            await navigateTo(`/admin/services/registry/${refs.entity.value.id}`);
        }
    },
});
</script>
<template>
    <div>
        <RegistrySetup :entity-id="entity.id" />
    </div>
</template>
