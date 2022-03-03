<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">

import { ServiceID } from '@personalhealthtrain/central-common';
import { PropType } from 'vue';
import HarborProjectManagement from './HarborProjectManagement';

export default {
    components: {
        HarborProjectManagement,
    },
    props: {
        entityId: String as PropType<ServiceID>,
    },
};
</script>
<template>
    <div>
        <harbor-project-management
            :service-id="entityId"
            class="mb-2"
        />
    </div>
</template>
