<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
        <slot
            :classSuffix="classSuffix"
            :statusText="statusText"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </span>
</template>
<script>

import { TrainBuildStatus } from '@personalhealthtrain/central-common';

export default {
    props: {
        status: {
            type: String,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainBuildStatus.STARTING:
                    return 'starting...';
                case TrainBuildStatus.STOPPING:
                    return 'stopping...';

                case TrainBuildStatus.STARTED:
                    return 'started';
                case TrainBuildStatus.STOPPED:
                    return 'stopped';

                case TrainBuildStatus.FINISHED:
                    return 'finished';
                case TrainBuildStatus.FAILED:
                    return 'failed';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainBuildStatus.STARTING:
                case TrainBuildStatus.STARTED:
                case TrainBuildStatus.STOPPED:
                    return 'primary';
                case TrainBuildStatus.FINISHED:
                    return 'success';
                case TrainBuildStatus.STOPPING:
                    return 'warning';
                case TrainBuildStatus.FAILED:
                    return 'danger';
                default:
                    return 'info';
            }
        },
    },
};
</script>
