<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { TrainResultStatus } from '@personalhealthtrain/core';
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
    props: {
        status: {
            type: Object as PropType<TrainResultStatus>,
        },
    },
    setup(props) {
        const statusText = computed(() => {
            switch (props.status) {
                case TrainResultStatus.STARTED:
                    return 'started';

                case TrainResultStatus.DOWNLOADING:
                    return 'downloading...';
                case TrainResultStatus.DOWNLOADED:
                    return 'downloaded';

                case TrainResultStatus.PROCESSING:
                    return 'extracting...';
                case TrainResultStatus.PROCESSED:
                    return 'extracted';

                case TrainResultStatus.FINISHED:
                    return 'finished';
                case TrainResultStatus.FAILED:
                    return 'failed';

                default:
                    return 'none';
            }
        });

        const classSuffix = computed(() => {
            switch (props.status) {
                case TrainResultStatus.STARTED:
                case TrainResultStatus.DOWNLOADING:
                case TrainResultStatus.PROCESSING:
                case TrainResultStatus.PROCESSED:
                    return 'primary';

                case TrainResultStatus.FINISHED:
                    return 'success';

                case TrainResultStatus.FAILED:
                    return 'danger';

                default:
                    return 'info';
            }
        });

        return {
            statusText,
            classSuffix,
        };
    },
});
</script>
<template>
    <span>
        <slot
            :class-suffix="classSuffix"
            :status-text="statusText"
        >
            <span :class="'text-'+classSuffix">{{ statusText }}</span>
        </slot>
    </span>
</template>
