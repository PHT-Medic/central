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
import {TrainStationStatic} from "@/domains/train-station/type";
import {TrainBuildStatus, TrainRunStatus} from "@/domains/train";

export default {
    props: {
        id: {
            // incoming, outgoing
            type: String,
            default: null
        },
        trainBuildStatus: {
            type: String,
            default: null
        },
        trainRunStatus: {
            type: String,
            default: null
        },
        trainRunStationIndex: {
            type: Number,
            default: null
        }
    },
    methods: {
        hasArrived(id) {

        }
    },
    computed: {
        arrived() {
            switch (this.id) {
                case TrainStationStatic.INCOMING:
                    return this.trainBuildStatus === TrainBuildStatus.FINISHED && !this.trainRunStationIndex;
                case TrainStationStatic.OUTGOING:
                    return this.trainRunStatus === TrainRunStatus.FINISHED;
            }

            return false;
        },
        departed() {
            switch (this.id) {
                case TrainStationStatic.INCOMING:
                    return this.trainRunStatus === TrainRunStatus.STARTED && !Number.isNaN(this.trainRunStationIndex);
            }

            return false;
        },
        statusText() {
            if(this.arrived) {
                return 'arrived';
            }

            if(
                this.id === TrainStationStatic.INCOMING &&
                this.departed
            ) {
                return 'departed';
            }

            return 'none';
        },
        classSuffix() {
            switch (true) {
                case this.arrived:
                    return 'success';
                case this.id === TrainStationStatic.INCOMING && this.departed:
                    return 'primary';
                default:
                    return 'info';
            }
        }
    }
}
</script>
