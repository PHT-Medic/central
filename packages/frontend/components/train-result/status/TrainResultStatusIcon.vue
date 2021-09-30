<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <span>
        <slot v-bind:iconClass="iconClass">
            <i class="fa" :class="iconClass"></i>
        </slot>
    </span>
</template>
<script>


import {TrainResultStatus} from "@personalhealthtrain/ui-common";

export default {
    props: {
        status: {
            type: TrainResultStatus,
            default: null
        }
    },
    computed: {
        iconClass() {
            switch (this.status) {
                case TrainResultStatus.STARTING:
                case TrainResultStatus.STOPPING:
                    return 'fas fa-sync';
                case TrainResultStatus.DOWNLOADING:
                    return 'fa-download';
                case TrainResultStatus.DOWNLOADED:
                    return 'fa-file-download';
                case TrainResultStatus.EXTRACTING:
                case TrainResultStatus.EXTRACTED:
                    return 'fa-file-export';
                case TrainResultStatus.FINISHED:
                    return 'fa-save';
                case TrainResultStatus.FAILED:
                    return 'fa-exclamation';
                default:
                    return 'fa fa-info';
            }
        }
    }
}
</script>
