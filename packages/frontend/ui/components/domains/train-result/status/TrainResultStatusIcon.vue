<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
        <slot :icon-class="iconClass">
            <i
                class="fa"
                :class="iconClass"
            />
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
        iconClass() {
            switch (this.status) {
                case TrainManagerExtractingQueueEvent.DOWNLOADING:
                    return 'fa-download';
                case TrainManagerExtractingQueueEvent.DOWNLOADED:
                    return 'fa-file-download';
                case TrainManagerExtractingQueueEvent.PROCESSING:
                case TrainManagerExtractingQueueEvent.PROCESSED:
                    return 'fa-file-export';
                case TrainManagerExtractingQueueEvent.FINISHED:
                    return 'fa-save';
                case TrainManagerExtractingQueueEvent.FAILED:
                    return 'fa-exclamation';
                default:
                    return 'fa fa-info';
            }
        },
    },
};
</script>
