<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PropType } from 'vue';
import { Registry } from '@personalhealthtrain/central-common';
import RegistrySetup from '../../../../components/domains/registry/RegistrySetup';

export default {
    components: { RegistrySetup },
    props: {
        entity: Object as PropType<Registry>,
    },
};
</script>
<template>
    <div>
        <registry-setup :entity-id="entity.id" />
    </div>
</template>
