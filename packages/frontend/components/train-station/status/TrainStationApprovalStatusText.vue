<template>
    <span>
       <slot v-bind:classSuffix="classSuffix" v-bind:statusText="statusText">
            <span :class="'text-'+classSuffix">{{statusText}}</span>
        </slot>
    </span>
</template>
<script>
import {TrainStationApprovalStatus} from "@/domains/train-station/type";

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
                case TrainStationApprovalStatus.APPROVED:
                    return 'approved';
                case TrainStationApprovalStatus.REJECTED:
                    return 'rejected';
                default:
                    return 'none';
            }
        },
        classSuffix() {
            switch (this.status) {
                case TrainStationApprovalStatus.APPROVED:
                    return 'success';
                case TrainStationApprovalStatus.REJECTED:
                    return 'danger';
                default:
                    return 'info';
            }
        }
    }
}
</script>
