<template>
    <span>
        <slot v-bind:iconClass="iconClass">
            <i class="fa" :class="iconClass"></i>
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
        iconClass() {
            switch (this.status) {
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
                    return 'info';
            }
        }
    }
}
</script>
