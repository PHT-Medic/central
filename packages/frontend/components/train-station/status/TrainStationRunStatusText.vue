<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>
import {TrainStationRunStatus} from "@/domains/train-station/type";

export default {
    props: {
        status: {
            type: String,
            default: null
        }
    },
    computed: {
        statusText() {
            switch (this.status) {
                case TrainStationRunStatus.ARRIVED:
                    return 'arrived';
                case TrainStationRunStatus.DEPARTED:
                    return 'departed';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainStationRunStatus.ARRIVED:
                    return 'success';
                case TrainStationRunStatus.DEPARTED:
                    return 'dark';
                default:
                    return 'info';
            }
        }
    }
}
</script>
