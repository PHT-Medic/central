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

import { TrainManagerExtractingQueueEvent } from '@personalhealthtrain/central-common';

export default {
    props: {
        status: {
            type: TrainManagerExtractingQueueEvent,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainManagerExtractingQueueEvent.STARTED:
                    return 'started';

                case TrainManagerExtractingQueueEvent.DOWNLOADING:
                    return 'downloading...';
                case TrainManagerExtractingQueueEvent.DOWNLOADED:
                    return 'downloaded';

                case TrainManagerExtractingQueueEvent.PROCESSING:
                    return 'extracting...';
                case TrainManagerExtractingQueueEvent.PROCESSED:
                    return 'extracted';

                case TrainManagerExtractingQueueEvent.FINISHED:
                    return 'finished';
                case TrainManagerExtractingQueueEvent.FAILED:
                    return 'failed';

                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainManagerExtractingQueueEvent.STARTED:
                case TrainManagerExtractingQueueEvent.DOWNLOADING:
                case TrainManagerExtractingQueueEvent.PROCESSING:
                case TrainManagerExtractingQueueEvent.PROCESSED:
                    return 'primary';

                case TrainManagerExtractingQueueEvent.FINISHED:
                    return 'success';

                case TrainManagerExtractingQueueEvent.FAILED:
                    return 'danger';

                default:
                    return 'info';
            }
        },
    },
};
</script>
