<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
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
<script>

import { TrainResultStatus } from '@personalhealthtrain/central-common';

export default {
    props: {
        status: {
            type: TrainResultStatus,
            default: null,
        },
    },
    computed: {
        statusText() {
            switch (this.status) {
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
        },
        classSuffix() {
            switch (this.status) {
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
        },
    },
};
</script>
