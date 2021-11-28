<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { TrainConfigurationStatus } from '@personalhealthtrain/ui-common';

export default {
    props: {
        status: {
            type: TrainConfigurationStatus,
            default: undefined,
        },
    },
    data() {
        return {
            configurationStates: TrainConfigurationStatus,
        };
    },
};
</script>
<template>
    <span>
        <template v-if="!status">
            open
        </template>
        <template v-else-if="status === configurationStates.RESOURCE_CONFIGURED">
            files uploaded
        </template>
        <template v-else-if="status === configurationStates.HASH_GENERATED">
            hash generated
        </template>
        <template v-else-if="status === configurationStates.HASH_SIGNED">
            hash signed
        </template>
        <template v-else-if="status === configurationStates.FINISHED">
            completed
        </template>
        <template v-else>
            unknown {{ status }}
        </template>
    </span>
</template>
