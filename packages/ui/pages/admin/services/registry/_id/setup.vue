<!--
  Copyright (c) 2021-2022.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import type { Registry } from '@personalhealthtrain/central-common';
import { Ecosystem } from '@personalhealthtrain/central-common';
import RegistrySetup from '../../../../../components/domains/registry/RegistrySetup';

export default {
    components: { RegistrySetup },
    props: {
        entity: Object as PropType<Registry>,
    },
    created() {
        if (this.entity.ecosystem !== Ecosystem.DEFAULT) {
            Promise.resolve()
                .then(this.$nuxt.$router.push(`/admin/services/registry/${this.entity.id}`));
        }
    },
};
</script>
<template>
    <div>
        <registry-setup :entity-id="entity.id" />
    </div>
</template>
