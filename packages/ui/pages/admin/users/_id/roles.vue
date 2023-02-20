<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { User } from '@authup/common';
import type { PropType } from 'vue';

export default {
    props: {
        entity: {
            type: Object as PropType<User>,
        },
    },
};
</script>
<template>
    <div>
        <user-role-assignment-list :entity-id="entity.id" />
    </div>
</template>
