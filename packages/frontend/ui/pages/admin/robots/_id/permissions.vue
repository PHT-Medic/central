<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { Robot } from '@authelion/common';
import { PropType } from 'vue';

export default {
    props: {
        entity: {
            type: Object as PropType<Robot>,
            default: undefined,
        },
    },
    data() {
        return {
        };
    },
};
</script>
<template>
    <div>
        <robot-permission-assignment-list :entity-id="entity.id" />
    </div>
</template>
