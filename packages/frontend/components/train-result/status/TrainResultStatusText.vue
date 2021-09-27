<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>

import {TrainResultStatus} from "@/domains/train-result/type";

export default {
    props: {
        status: {
            type: TrainResultStatus,
            default: null
        }
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainResultStatus.STARTING:
                    return 'starting...';
                case TrainResultStatus.STOPPING:
                    return 'stopping...';

                case TrainResultStatus.STARTED:
                    return 'started';
                case TrainResultStatus.STOPPED:
                    return 'stopped';

                case TrainResultStatus.DOWNLOADING:
                    return 'downloading...';
                case TrainResultStatus.DOWNLOADED:
                    return 'downloaded';

                case TrainResultStatus.EXTRACTING:
                    return 'extracting...';
                case TrainResultStatus.EXTRACTED:
                    return 'extracted';

                case TrainResultStatus.FINISHED:
                    return 'finished';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainResultStatus.STARTING:
                case TrainResultStatus.STARTED:
                case TrainResultStatus.STOPPED:
                case TrainResultStatus.DOWNLOADING:
                case TrainResultStatus.EXTRACTING:
                case TrainResultStatus.EXTRACTED:
                    return 'primary';

                case TrainResultStatus.FINISHED:
                    return 'success';

                case TrainResultStatus.STOPPING:
                    return 'warning';

                case TrainResultStatus.FAILED:
                    return 'danger';

                default:
                    return 'info';
            }
        }
    }
}
</script>
