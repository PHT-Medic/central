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
import { TrainRunStatus } from '@personalhealthtrain/ui-common';

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
                case TrainRunStatus.STARTING:
                    return 'starting...';
                case TrainRunStatus.RUNNING:
                    return 'running...';
                case TrainRunStatus.STOPPING:
                    return 'stopping...';
                case TrainRunStatus.STOPPED:
                    return 'stopped...';
                case TrainRunStatus.FINISHED:
                    return 'finished';
                case TrainRunStatus.FAILED:
                    return 'failed';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainRunStatus.STARTING:
                case TrainRunStatus.STOPPING:
                case TrainRunStatus.RUNNING:
                    return 'primary';
                case TrainRunStatus.STOPPED:
                    return 'warning';
                case TrainRunStatus.FINISHED:
                    return 'success';
                case TrainRunStatus.FAILED:
                    return 'danger';
                default:
                    return 'info';
            }
        },
    },
};
</script>
