<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
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
