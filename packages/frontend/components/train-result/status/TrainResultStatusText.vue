<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>
import {TrainResultStatus} from "@/domains/train";

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
                case TrainResultStatus.DOWNLOADING:
                    return 'downloading...';
                case TrainResultStatus.DOWNLOADED:
                    return 'downloaded';
                case TrainResultStatus.EXTRACTING:
                    return 'extracting...';
                case TrainResultStatus.EXTRACTED:
                    return 'extracted';
                case TrainResultStatus.FINISHED:
                    return 'extracted';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainResultStatus.DOWNLOADING:
                case TrainResultStatus.EXTRACTING:
                    return 'dark';
                case TrainResultStatus.EXTRACTED:
                case TrainResultStatus.FINISHED:
                    return 'success';
                case TrainResultStatus.FAILED:
                    return 'danger';
                default:
                    return 'info';
            }
        }
    }
}
</script>
